import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import Groq from "groq-sdk";
import { analyzeExerciseProgressSchema, validateQueryParams } from "@/features/shared/utils/validations";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate input
    const validation = validateQueryParams(analyzeExerciseProgressSchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId, muscleGroups: muscleGroupsParam } = validation.data;
    const muscleGroups = muscleGroupsParam.split(",").map((m) => m.trim().toLowerCase());

    // 🔹 Date helpers
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    // 🔹 Fetch workouts from the last 30 days
    const workoutsRef = collection(db, "users", userId, "workouts");
    const snapshot = await getDocs(workoutsRef);

    const history: Array<{ date: string; muscleGroups: string[]; exercises: unknown[] }> = [];
    let todayWorkout: { date: string; muscleGroups: string[]; exercises: unknown[] } | null = null;

    // FIX: Fetch all plans in parallel to avoid N+1 query problem
    const relevantDates = snapshot.docs
      .map(doc => doc.id)
      .filter(date => date >= monthAgoStr && date <= todayStr);

    // Fetch all plans in parallel
    const plansPromises = relevantDates.map(async (date) => {
      const plansRef = collection(db, "users", userId, "workouts", date, "plans");
      const plansSnap = await getDocs(plansRef);
      return { date, plans: plansSnap.docs };
    });

    const allPlansData = await Promise.all(plansPromises);

    // Process all plans
    for (const { date, plans } of allPlansData) {
      plans.forEach((plan) => {
        const data = plan.data();
        const planMuscleGroups = (data.muscleGroups || []).map((m: string) =>
          m.toLowerCase()
        );

        if (planMuscleGroups.some((m: string) => muscleGroups.includes(m))) {
          const workout = {
            date,
            muscleGroups: planMuscleGroups,
            exercises: data.exercises || [],
          };

          if (date === todayStr) {
            todayWorkout = workout;
          } else {
            history.push(workout);
          }
        }
      });
    }

    // If no workout today
    if (!todayWorkout) {
      return NextResponse.json({
        message: "No workout logged today for selected muscle groups",
      });
    }

    // 🔹 Build AI prompt
    const prompt = `
You are a fitness coach. Summarize today’s workout in a motivating tone, comparing it with the user’s past 30 days of similar workouts.

Input:
- Today’s workout: ${JSON.stringify(todayWorkout, null, 2)}
- Past workouts (30 days): ${JSON.stringify(history.slice(-10), null, 2)}

Output as JSON:
{
  "summary": "A motivational paragraph",
  "stats": {
    "totalSessions": number,
    "avgSetsPerExercise": number,
    "avgRepsPerExercise": number,
    "progressHighlight": "short sentence about improvement or consistency"
  }
}

`;

    // 🔹 Call Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message?.content;
    if (!aiResponse) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    return NextResponse.json({
      date: todayStr,
      muscleGroups,
      appreciation: parsed, // ✅ contains { summary, stats }
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to analyze progress" },
      { status: 500 }
    );
  }
}