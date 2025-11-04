import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteExerciseSchema, validateRequestBody } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateRequestBody(deleteExerciseSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId, dateStr, planId, exerciseId } = validation.data;

    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);

    const snap = await getDoc(planRef);

    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const data = snap.data();

    const updatedExercises = (data.exercises || []).filter(
      (ex: any) => ex.exerciseId !== exerciseId
    );

    await updateDoc(planRef, { exercises: updatedExercises });

    return NextResponse.json({
      success: true,
      exercises: updatedExercises,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
