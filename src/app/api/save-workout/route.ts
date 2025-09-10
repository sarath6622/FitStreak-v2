// app/api/save-workout/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[save-workout] Incoming payload:", JSON.stringify(body, null, 2));

    const { userId, muscleGroups, workoutPlan, overwrite = false } = body;

    if (
      !userId ||
      !Array.isArray(muscleGroups) ||
      muscleGroups.length === 0 ||
      !Array.isArray(workoutPlan)
    ) {
      console.error("[save-workout] Invalid payload:", body);
      return NextResponse.json(
        {
          error:
            "Invalid request payload: expected { userId, muscleGroups: [], workoutPlan: [] }",
        },
        { status: 400 }
      );
    }

    // Today's date as YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Reference: users/{uid}/workouts/{date}/plans
    const plansRef = collection(db, "users", userId, "workouts", dateStr, "plans");

    // 1️⃣ Check existing plans
    const existing = await getDocs(plansRef);
    if (!existing.empty && !overwrite) {
      console.log("[save-workout] Existing workout found, not overwriting.");
      return NextResponse.json(
        { exists: true, message: "Workout already exists for today" },
        { status: 200 }
      );
    }

    // 2️⃣ If overwrite = true → clear old docs
    if (!existing.empty && overwrite) {
      for (const docSnap of existing.docs) {
        await deleteDoc(docSnap.ref);
      }

      console.log("[save-workout] Old workout deleted, overwriting.");
    }

    // Fetch master exercises collection
    const masterExercisesSnap = await getDocs(collection(db, "exercises"));
    const masterExercises: Record<string, any> = {};
    masterExercisesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      masterExercises[data.name.toLowerCase()] = docSnap.id;
    });

    console.log("[save-workout] Master exercises loaded:", masterExercises);

    // Normalize workoutPlan into exercises
    const exercises = workoutPlan.map((ex: any, i: number) => {
      const matchedId = masterExercises[ex.name?.toLowerCase()] ?? null;

      return {
        exerciseId: matchedId,
        name: ex.name ?? null,
        muscleGroup: ex.muscleGroup ?? null,
        subGroup: ex.subGroup ?? null,
        equipment: ex.equipment ?? [],
        movementType: ex.movementType ?? null,
        difficulty: ex.difficulty ?? null,
        secondaryMuscleGroups: ex.secondaryMuscleGroups ?? [],
        sets: ex.sets ?? null,
        reps: ex.reps ?? null,
        notes: ex.notes ?? null,
      };
    });

    console.log("[save-workout] Final exercises to save:", exercises);

    // 3️⃣ Save new plan
    await addDoc(plansRef, {
      muscleGroups,
      exercises,
      createdAt: serverTimestamp(),
    });

    console.log("[save-workout] Saved successfully");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[save-workout] Error:", err);
    return NextResponse.json(
      { error: "Failed to save workout", details: err.message },
      { status: 500 }
    );
  }
}