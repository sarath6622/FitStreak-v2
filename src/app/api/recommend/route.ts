import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getWorkoutsForUser } from "@/services/workoutService";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, muscleGroups } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in body" },
        { status: 400 }
      );
    }

    // Fetch last 7 workouts (may be used for context)
    const previousWorkouts = await getWorkoutsForUser(userId, { limit: 7 });

    // Build workout summary for context
    const workoutSummary = previousWorkouts
      .map(
        (w, i) =>
          `${i + 1}) ${w.date} – ${w.muscleGroup} – ${w.sets} sets – ${w.weight.join(",")}kg`
      )
      .join("\n");

    // Build prompt
    const prompt =
      muscleGroups && muscleGroups.length > 0
        ? `
You are a virtual fitness coach. Here are the user's last 7 workouts:\n\n${workoutSummary}\n\n
Based on this history, suggest a personalized workout plan for TODAY focusing ONLY on the following muscle groups: ${muscleGroups.join(
          ", "
        )}.

Rules:
- If the user's most recent workout includes any of the selected muscle groups, avoid repeating them unless it is one of the selected groups.
- If multiple muscle groups are selected, mix them in a balanced fashion (e.g. alternate between selected muscle groups rather than grouping all of one together).
- Suggest realistic sets & reps.
- The workout should last around 60 minutes.
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
`
        : `
You are a virtual fitness coach. Here are the user's last 7 workouts:\n\n${workoutSummary}\n\n
Based on this history, suggest a personalized full-body workout plan for TODAY.

Rules:
- Do not repeat the same muscle group as the most recent workout.
- Ensure each major muscle is trained at least once per week.
- Return realistic sets & reps.
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

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const recommendation = completion.choices[0].message.content;
    console.log("Generated recommendation:", recommendation);

    return NextResponse.json({ recommendation });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}