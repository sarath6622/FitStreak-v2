import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getWorkoutsForUser } from "@/services/workoutService";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, muscleGroups , duration} = await req.json();

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
      console.log(`- Make sure the workout is ${duration} in duration.`);
      
    // Prepare prompt with conditional muscleGroup targeting and JSON-only output requested
const prompt = muscleGroups?.length
  ? `
You are a virtual fitness coach. Here are the user's last 7 workouts:\n\n${workoutSummary}\n\n
Based on this history, suggest a personalized workout plan for TODAY focused ONLY on the muscle groups: "${muscleGroups.join(", ")}".

Rules:
- Do not repeat the same muscle group as the most recent workout if it is NOT one of the selected muscle groups.
- Suggest realistic sets & reps.
- Always return exercises enriched with metadata.
- The workout must last approximately ${duration} minutes in total.
- Assume each set takes ~90 seconds (including rest) unless specified otherwise.
- Adjust the number of exercises, sets, and reps to fit the total duration:
   - Shorter duration (≤45 min): fewer exercises, mostly compounds, moderate sets.
   - Medium duration (60 min): balanced variety of compound + isolation, 5–7 exercises.
   - Longer duration (90–120 min): more exercises, higher volume, include accessory/isolation work.
- Ensure the workout is suitable for the selected muscle groups.
- Use the user's workout history to scale difficulty (progressive overload, realistic reps/sets).

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
    
    return NextResponse.json({ recommendation });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
