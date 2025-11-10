import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  getWorkoutsForUser,
  getExerciseNamesByMuscleGroup,
} from "@/features/shared/services/workoutService";
import { recommendWorkoutSchema, validateRequestBody } from "@/features/shared/utils/validations";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateRequestBody(recommendWorkoutSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId, muscleGroups, duration } = validation.data;

    if (!muscleGroups || muscleGroups.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing muscleGroups" },
        { status: 400 }
      );
    }

    // Fetch last 7 workouts (may be used for context)
    const previousWorkouts = await getWorkoutsForUser(userId, { limit: 7 });
    const exerciseList = await getExerciseNamesByMuscleGroup(muscleGroups);

    // Build workout summary for context
    const workoutSummary = previousWorkouts
      .map(
        (w, i) =>
          `${i + 1}) ${w.date} – ${w.muscleGroup} – ${
            w.sets
          } sets – ${w.weight.join(",")}kg`
      )
      .join("\n");

    // Prepare prompt with conditional muscleGroup targeting and JSON-only output requested
    const prompt = muscleGroups?.length
      ? `
You are a virtual fitness coach.  
Here are the user's last 7 workouts:

${workoutSummary}

Task:
Suggest a personalized workout plan for TODAY focused ONLY on the muscle group(s): "${muscleGroups.join(
          ", "
        )}".  
The workout must last for AT LEAST ${duration} minutes in total and the suggestions of the wokrouts should only be from this list ${exerciseList}.

---

## Rules:
- Do not repeat the same muscle group as the most recent workout if it is NOT one of the selected muscle groups.
- Suggest realistic sets & reps based on user's logged history (progressive overload, realistic progression).
- Always enrich exercises with metadata.
- Make sure the workout duration is AT LEAST ${duration} minutes.
- Assume each set takes ~90 seconds (including rest) unless otherwise noted.
- Adjust number of exercises, sets, and reps to hit the duration:
  - ≤45 min → fewer exercises, focus on compounds, moderate sets.
  - ~60 min → 5–7 exercises, balanced compound + isolation.
  - ~90–120 min → more exercises, higher volume, accessory/isolation included.
- If the plan is too short, increase sets/exercises.  
- If the plan is too long, reduce sets/exercises.

Output Format:
Return ONLY valid JSON, an array of exercises.
Each exercise must have the following fields:
{
  "name": string,
  "muscleGroup": string,
  "subGroup": string,
  "equipment": string[],
  "movementType": string,
  "difficulty": string,
  "secondaryMuscleGroups": string[],
  "sets": number,
  "reps": string,
  "notes": string (optional)
}

No text outside JSON.
`
      : `
You are a virtual fitness coach. Here are the user's last 7 workouts:\n\n${workoutSummary}\n\n
Based on this history, suggest a personalized workout for TODAY.

Rules:
- Do not repeat the same muscle group as the most recent workout.
- Ensure each major muscle is trained at least once per week.
- Suggest realistic sets & reps.
- Always return exercises enriched with metadata.

Output Format:
Return ONLY valid JSON, an array of exercises.
Each exercise must have the following fields:
{
  "name": string,
  "muscleGroup": string,
  "subGroup": string,
  "equipment": string[],
  "movementType": string,
  "difficulty": string,
  "secondaryMuscleGroups": string[],
  "sets": number,
  "reps": string,
  "notes": string (optional)
}

No text outside JSON.
`;

    // Call Groq SDK
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // update the model if needed
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const recommendation = completion.choices[0].message.content;

    return NextResponse.json({ recommendation });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
