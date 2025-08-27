// app/api/edit-exercise/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, dateStr, planId, exerciseIndex, updatedExercise } = await req.json();

    if (
      !userId ||
      !dateStr ||
      !planId ||
      typeof exerciseIndex !== "number" ||
      !updatedExercise
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);

    // Build field paths like exercises.0.name, exercises.0.reps, etc.
    const updates: Record<string, any> = {};
    Object.entries(updatedExercise).forEach(([key, value]) => {
      updates[`exercises.${exerciseIndex}.${key}`] = value;
    });

    await updateDoc(planRef, updates);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[edit-exercise] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}