// app/api/save-workout/route.ts
import { db } from "@/firebase";
import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[save-workout] Incoming payload:", JSON.stringify(body, null, 2));

    const { userId, muscleGroup, workoutPlan } = body;

    if (!userId || !muscleGroup || !Array.isArray(workoutPlan)) {
      console.error("[save-workout] Invalid payload:", body);
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // Get today's date (YYYY-MM-DD)
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Reference: users/{uid}/workouts/{date}/plans/{autoId}
    const plansRef = collection(
      db,
      "users",
      userId,
      "workouts",
      dateStr,
      "plans"
    );

    // Map and log exercises
    const exercises = workoutPlan.map((ex: any, i: number) => {
      console.log(`[save-workout] Exercise ${i}:`, ex);
      return {
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

    console.log("[save-workout] Final exercises object:", exercises);

    await addDoc(plansRef, {
      muscleGroup,
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