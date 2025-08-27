import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[edit-exercise] Incoming body:", body);

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

    const idx = exercises.findIndex((ex: any) => ex.exerciseId === oldExerciseId);
    if (idx === -1) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // ✅ Replace just that exercise
    const newExercises = [...exercises];
    newExercises[idx] = {
      ...exercises[idx],
      ...updatedExercise,
    };

    await updateDoc(planRef, { exercises: newExercises });

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