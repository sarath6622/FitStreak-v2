import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[edit-exercise] Incoming body:", JSON.stringify(body, null, 2));

    const { userId, dateStr, planId, oldExerciseId, updatedExercise } = body;

    if (!userId || !dateStr || !planId || !oldExerciseId || !updatedExercise) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const planData = planSnap.data();
    const exercises = planData.exercises || [];
    console.log("[edit-exercise] Current exercises:", JSON.stringify(exercises, null, 2));

    const idx = exercises.findIndex((ex: any) => ex.exerciseId === oldExerciseId);
    if (idx === -1) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    console.log("[edit-exercise] Found index:", idx);
    console.log("[edit-exercise] Old exercise at index", idx, ":", exercises[idx]);

    // ✅ Replace only that exercise in memory
    const newExercises = [...exercises];
    newExercises[idx] = {
      ...exercises[idx],
      ...updatedExercise,
    };

    console.log("[edit-exercise] Final new exercises array:", JSON.stringify(newExercises, null, 2));

    // ✅ Write the whole array back
    await updateDoc(planRef, { exercises: newExercises });

    console.log("[edit-exercise] Successfully updated exercise:", oldExerciseId);

    return NextResponse.json({
      success: true,
      oldExerciseId,
      updatedExercise: newExercises[idx],
    });
  } catch (err: any) {
    console.error("[edit-exercise] Error caught:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}