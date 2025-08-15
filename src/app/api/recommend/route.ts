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
- Suggest sets & reps.
- Provide your response in valid JSON format ONLY, with an array of exercises. Each exercise object should have "exercise" (string), "sets" (number), "reps" (string), and optionally "notes" (string).
- Do not include any explanations, introductions, or other text outside the JSON array.
`
      : `
You are a virtual fitness coach. Here are the user's last 7 workouts:\n\n${workoutSummary}\n\n
Based on this history, suggest a personalized workout for TODAY.
Rules:
- Do not repeat the same muscle group as the most recent workout
- Make sure that each major muscle is trained at least once per week
- Suggest the sets & reps as well.
Please answer in JSON format ONLY, providing an array of exercises with "exercise", "sets", "reps", and optional "notes".
No extra text outside the JSON.
`;

    // Call Groq SDK
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // update the model if needed
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
