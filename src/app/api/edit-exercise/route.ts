// app/api/edit-exercise/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, dateStr, planId, exerciseIndex, updatedExercise } = await req.json();

    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);
    const snap = await getDoc(planRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const data = snap.data();
    const exercises = data.exercises || [];
    exercises[exerciseIndex] = { ...exercises[exerciseIndex], ...updatedExercise };

    await updateDoc(planRef, { exercises });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[edit-exercise] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}