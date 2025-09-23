import { NextResponse } from "next/server";
import { db } from "@/firebase"; // ✅ admin SDK
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Received request body:", body);

    const { userId, dateStr, planId, exercise } = body;

    if (!userId || !dateStr || !planId || !exercise) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // ✅ Correct nested path: users/{uid}/workouts/{dateStr}/plans/{planId}
    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);
    const snap = await getDoc(planRef);

    if (!snap.exists()) {
      console.error("❌ Plan not found at:", planRef.path);
      return NextResponse.json(
        { success: false, error: "Workout not found" },
        { status: 404 }
      );
    }

    const data = snap.data();

    // 🔎 Enrich the incoming exercise from master exercises collection
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
            reps: master.reps ?? exercise.reps ?? "",
            sets: master.sets ?? exercise.sets ?? 3,
            notes: exercise.notes ?? null,
          };
        }
      }
    } catch (e) {
      console.warn("Failed to enrich exercise; saving as-is", e);
    }

    // ✅ Ensure uniqueness by exerciseId: replace existing if present, else append
    const existing: any[] = Array.isArray(data.exercises) ? data.exercises : [];
    const idx = existing.findIndex((ex) => ex.exerciseId === enriched.exerciseId);
    let updatedExercises: any[];
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
  } catch (err) {
    console.error("Add failed:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}