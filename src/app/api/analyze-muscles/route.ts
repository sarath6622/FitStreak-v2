import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getUserWorkoutHistory } from "@/services/workoutService";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in body" }, { status: 400 });
    }

    const workoutHistory = await getUserWorkoutHistory(userId, 10);

    // --- FIX STARTS HERE ---
    // First, filter the flat array of exercises to remove low-volume sets
    const filteredExercises = workoutHistory.filter(
      (ex: any) => {
        // Assume 'completed' is true if not specified
        const isCompleted = ex.completed === undefined || ex.completed === true;
        const hasSets = ex.sets > 0;

        if (isCompleted && hasSets) {
          const avgReps = ex.repsPerSet.length > 0 ? ex.repsPerSet.reduce((a: number, b: number) => a + b, 0) / ex.repsPerSet.length : 0;
          const avgWeight = ex.weight.length > 0 ? ex.weight.reduce((a: number, b: number) => a + b, 0) / ex.weight.length : 0;
          const volume = ex.sets * avgReps * avgWeight;
          
          // Only keep exercises with a volume of 200 or more
          return volume >= 200;
        }

        return false;
      }
    );

    // Now, group the filtered exercises by date to create the nested workout history
    const finalProcessedHistory: any[] = [];
    const workoutsByDate: { [date: string]: any } = {};

    filteredExercises.forEach(ex => {
      const date = ex.date;
      if (!workoutsByDate[date]) {
        workoutsByDate[date] = {
          date: date,
          duration: 0, // Duration is not available per exercise, so we'll leave it as 0 or sum it up later if needed
          exercises: []
        };
        finalProcessedHistory.push(workoutsByDate[date]);
      }

      workoutsByDate[date].exercises.push(ex);
    });

    // --- FIX ENDS HERE ---

    // Use finalProcessedHistory in the prompt
    const historyJson = JSON.stringify(finalProcessedHistory, null, 2);
    
    const prompt = `
You are a virtual fitness coach analyzing a user's workout history.
Each workout entry includes:
- 'date' (YYYY-MM-DD) of the workout
- 'duration' (number, total workout time in minutes)
- 'exercises': an array of objects, each with:
    - 'name' (string)
    - 'muscleGroup' (string)
    - 'sets' (number)
    - 'repsPerSet' (array of numbers)
    - 'weight' (array of numbers)
    - 'completed' (boolean)

Workout history:
${historyJson}

Instructions:

1. For each major muscle group, find the most recent date it was trained (based on completed exercises).
2. Calculate 'daysAgo' as number of days since it was last trained compared to today.
3. If a muscle group hasn't been trained in the last 7 days, use 'daysAgo' = 7.
4. Assign an 'intensity' level ('low', 'medium', 'high') to each muscle group based on total volume (sets, reps, weights) in the most recent workout involving that group:
   - 'low' = very low volume (e.g., sets < 3 or very light weights)
   - 'medium' = moderate volume (sets 3–6, moderate weights)
   - 'high' = high volume (sets 7+, heavy weights)

5. Return ONLY a JSON array listing undertrained muscle groups as objects with:
   - "muscleGroup": string
   - "lastTrained": string (YYYY-MM-DD or "Never")
   - "daysAgo": integer (min 0, max 7)
   - "intensity": string ("low", "medium", or "high")

6. If there is no workout history, return all major muscle groups with "lastTrained": "Never", "daysAgo": 7 and "intensity": "low".

7. Your response MUST be only this JSON array. Do NOT include any explanations, greetings, or text outside the JSON.

Example valid response:

[
  {
    "muscleGroup": "Legs",
    "lastTrained": "2025-08-10",
    "daysAgo": 5,
    "intensity": "medium"
  },
  {
    "muscleGroup": "Shoulders",
    "lastTrained": "Never",
    "daysAgo": 7,
    "intensity": "low"
  }
]
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in /api/analyze-muscles:", error);
    return NextResponse.json({ error: "Failed to analyze muscle groups" }, { status: 500 });
  }
}