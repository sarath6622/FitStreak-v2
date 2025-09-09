import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const muscleGroupsParam = searchParams.get("muscleGroups");

    if (!userId || !muscleGroupsParam) {
      return NextResponse.json(
        { error: "Missing userId or muscleGroups" },
        { status: 400 }
      );
    }

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

    let history: any[] = [];
    let todayWorkout: any | null = null;

    for (const doc of snapshot.docs) {
      const date = doc.id; // yyyy-mm-dd
      if (date < monthAgoStr || date > todayStr) continue;

      const plansRef = collection(db, "users", userId, "workouts", date, "plans");
      const plansSnap = await getDocs(plansRef);

      plansSnap.forEach((plan) => {
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
      console.error("[analyze-exercise-progress] JSON parse error:", aiResponse);
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    return NextResponse.json({
      date: todayStr,
      muscleGroups,
      appreciation: parsed, // ✅ contains { summary, stats }
    });
  } catch (err: any) {
    console.error("[analyze-exercise-progress] ❌ Error:", err);
    return NextResponse.json(
      { error: "Failed to analyze progress", details: err.message },
      { status: 500 }
    );
  }
}