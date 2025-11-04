// /app/api/edit-exercise/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { editExerciseSchema, validateRequestBody } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateRequestBody(editExerciseSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId, dateStr, planId, exerciseIndex, updatedExercise } = validation.data;

    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);
    const snap = await getDoc(planRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const planData = snap.data();
    const exercises: any[] = Array.isArray(planData.exercises) ? planData.exercises : [];

    if (exerciseIndex < 0 || exerciseIndex >= exercises.length) {
      return NextResponse.json({ error: "Exercise index out of bounds" }, { status: 400 });
    }

    // Merge old + updated
    const merged = { ...exercises[exerciseIndex], ...updatedExercise };
    const newExercises = [...exercises];
    newExercises[exerciseIndex] = merged;

    await updateDoc(planRef, { exercises: newExercises });

    return NextResponse.json({
      success: true,
      exercises: newExercises,
      replacedIndex: exerciseIndex,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
