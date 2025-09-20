import { NextResponse } from "next/server";
import { db } from "@/firebase"; // ✅ admin SDK
import { doc, getDoc, updateDoc } from "firebase/firestore";

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

    const updatedExercises = [...(data.exercises || []), exercise];

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