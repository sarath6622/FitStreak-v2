import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getWorkoutsForUser } from "@/services/workoutService";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, muscleGroup } = await req.json();

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

    // Prepare prompt with conditional muscleGroup targeting and JSON-only output requested
const prompt = muscleGroup
  ? `
You are a virtual fitness coach. Here are the user's last 7 workouts:\n\n${workoutSummary}\n\n
Based on this history, suggest a personalized workout plan for TODAY focused ONLY on the muscle group: "${muscleGroup}".

Rules:
- Do not repeat the same muscle group as the most recent workout if it is NOT the selected muscle group.
- Suggest realistic sets & reps.
- Always return exercises enriched with metadata.
- Make sure the workout is atleast an hour long.
- Analyze the user's history to suggest sets and reps difficulty as the user has been logging workouts for a while.

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
      model: "llama3-70b-8192", // update the model if needed
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
