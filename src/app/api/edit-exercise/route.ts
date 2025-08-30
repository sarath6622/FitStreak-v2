// /app/api/edit-exercise/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, dateStr, planId, oldName, updatedExercise } = await req.json();

    if (!userId || !dateStr || !planId || !oldName || !updatedExercise) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);
    const snap = await getDoc(planRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const planData = snap.data();
    const exercises: any[] = Array.isArray(planData.exercises) ? planData.exercises : [];

    const idx = exercises.findIndex(
      (ex) => (ex?.name || "").trim().toLowerCase() === oldName.trim().toLowerCase()
    );
    if (idx === -1) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Merge old + updated (so you can send partials safely)
    const merged = { ...exercises[idx], ...updatedExercise };
    const newExercises = [...exercises];
    newExercises[idx] = merged;

    await updateDoc(planRef, { exercises: newExercises });

    // 🔥 Return the updated array directly
    return NextResponse.json({
      success: true,
      exercises: newExercises,
      replacedIndex: idx,
    });
  } catch (err: any) {
    console.error("[edit-exercise] Error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}