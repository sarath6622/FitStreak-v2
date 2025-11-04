import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { addExerciseSchema, validateRequestBody } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateRequestBody(addExerciseSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId, dateStr, planId, exercise } = validation.data;

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, error: "Missing userId or planId" },
        { status: 400 }
      );
    }

    // Use today's date if not provided
    const actualDateStr = dateStr || new Date().toISOString().split("T")[0];

    const planRef = doc(db, "users", userId, "workouts", actualDateStr, "plans", planId);
    const snap = await getDoc(planRef);

    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, error: "Workout not found" },
        { status: 404 }
      );
    }

    const data = snap.data();

    // Enrich the incoming exercise from master exercises collection
    let enriched = exercise;
    try {
      if (exercise?.exerciseId) {
        const masterSnap = await getDoc(doc(db, "exercises", exercise.exerciseId));
        if (masterSnap.exists()) {
          const master = masterSnap.data();
          enriched = {
            exerciseId: exercise.exerciseId,
            name: master.name ?? exercise.name ?? "",
            muscleGroup: master.muscleGroup ?? exercise.muscleGroup ?? "",
            subGroup: master.subGroup ?? "",
            movementType: master.movementType ?? "",
            difficulty: master.difficulty ?? "",
            equipment: Array.isArray(master.equipment) ? master.equipment : (master.equipment ? [master.equipment] : []),
            secondaryMuscleGroups: Array.isArray(master.secondaryMuscleGroups) ? master.secondaryMuscleGroups : [],
            reps: master.reps ?? exercise.reps ?? "12",
            sets: master.sets ?? exercise.sets ?? 3,
            notes: exercise.notes ?? null,
          };
        }
      }
    } catch {
      // Failed to enrich, continue with original exercise
    }

    // Ensure uniqueness by exerciseId: replace existing if present, else append
    const existing: Record<string, unknown>[] = Array.isArray(data.exercises) ? data.exercises : [];
    const idx = existing.findIndex((ex) => ex.exerciseId === enriched.exerciseId);
    let updatedExercises: Record<string, unknown>[];
    if (idx >= 0) {
      updatedExercises = [...existing];
      updatedExercises[idx] = { ...existing[idx], ...enriched };
    } else {
      updatedExercises = [...existing, enriched];
    }

    await updateDoc(planRef, { exercises: updatedExercises });

    return NextResponse.json({
      success: true,
      exercises: updatedExercises,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
