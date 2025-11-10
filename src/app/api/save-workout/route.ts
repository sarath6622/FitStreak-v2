// app/api/save-workout/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { saveWorkoutSchema, validateRequestBody } from "@/features/shared/utils/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateRequestBody(saveWorkoutSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId, muscleGroups, workoutPlan } = validation.data;

    // Today's date as YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Reference: users/{uid}/workouts/{date}/plans
    const plansRef = collection(db, "users", userId, "workouts", dateStr, "plans");

    // 1️⃣ Delete all existing docs inside "plans"
    const existingPlans = await getDocs(plansRef);
    for (const docSnap of existingPlans.docs) {
      await deleteDoc(docSnap.ref);
    }

    // 2️⃣ Fetch master exercises for ID mapping
    const masterExercisesSnap = await getDocs(collection(db, "exercises"));
    const masterExercises: Record<string, string> = {};
    masterExercisesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      masterExercises[data.name.toLowerCase()] = docSnap.id;
    });

    // Normalize workoutPlan into exercises
    const exercises = workoutPlan.map((ex) => {
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

    // 3️⃣ Save the latest plan under "current"
    const planRef = doc(plansRef, "current");
    await setDoc(planRef, {
      muscleGroups,
      exercises,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to save workout" },
      { status: 500 }
    );
  }
}