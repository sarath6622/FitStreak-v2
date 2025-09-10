// app/api/save-workout/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[save-workout] Incoming payload:", JSON.stringify(body, null, 2));

    const { userId, muscleGroups, workoutPlan } = body;

    if (!userId || !Array.isArray(muscleGroups) || muscleGroups.length === 0 || !Array.isArray(workoutPlan)) {
      console.error("[save-workout] Invalid payload:", body);
      return NextResponse.json(
        { error: "Invalid request payload: expected { userId, muscleGroups: [], workoutPlan: [] }" },
        { status: 400 }
      );
    }

    // Today's date as YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Reference: users/{uid}/workouts/{date}/plans/{autoId}
    const plansRef = collection(db, "users", userId, "workouts", dateStr, "plans");

    // Fetch master exercises collection so we can map names -> ids
    const masterExercisesSnap = await getDocs(collection(db, "exercises"));
    const masterExercises: Record<string, any> = {};
    masterExercisesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      masterExercises[data.name.toLowerCase()] = docSnap.id; // map by lowercased name
    });

    console.log("[save-workout] Master exercises loaded:", masterExercises);

    // Normalize workoutPlan into exercises
    const exercises = workoutPlan.map((ex: any, i: number) => {
      const matchedId = masterExercises[ex.name?.toLowerCase()] ?? null;

      console.log(`[save-workout] Processing exercise ${i}:`, ex);
      console.log(`[save-workout] Matched exerciseId for "${ex.name}":`, matchedId);

      return {
        exerciseId: matchedId, // ✅ attach Firestore doc ID
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

    console.log("[save-workout] Final exercises object to save:", exercises);

    // Save in Firestore
    await addDoc(plansRef, {
      muscleGroups, // ✅ store as array
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