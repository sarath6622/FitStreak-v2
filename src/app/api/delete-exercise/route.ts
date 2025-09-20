import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, dateStr, planId, exerciseId } = await req.json();

    console.log("📝 Delete request received", { userId, dateStr, planId, exerciseId });

    if (!userId || !dateStr || !planId || !exerciseId) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // ✅ Navigate into the subcollection
    const planRef = doc(db, "users", userId, "workouts", dateStr, "plans", planId);
    console.log("📄 Looking for plan doc:", planRef.path);

    const snap = await getDoc(planRef);

    if (!snap.exists()) {
      console.warn("❌ Plan not found at:", planRef.path);
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const data = snap.data();
    console.log("✅ Found plan doc:", JSON.stringify(data, null, 2));

    // assuming exercises are stored like: { exercises: [ { exerciseId, ... } ] }
    const updatedExercises = (data.exercises || []).filter(
      (ex: any) => ex.exerciseId !== exerciseId
    );

    console.log("🛠️ Updated exercises:", updatedExercises);

    await updateDoc(planRef, { exercises: updatedExercises });
    console.log("✅ Firestore updated");

    return NextResponse.json({
      success: true,
      exercises: updatedExercises,
    });
  } catch (err) {
    console.error("💥 Delete failed:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}