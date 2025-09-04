// app/api/save-meal/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    console.log("====================================");
    console.log("[save-meal] 🔔 Incoming request");

    // Parse body
    const body = await req.json().catch((err) => {
      console.error("[save-meal] ❌ Failed to parse JSON body:", err);
      throw new Error("Invalid JSON body");
    });

    console.log("[save-meal] 📨 Raw payload:", JSON.stringify(body, null, 2));

    const { userId, food, quantity, measure, totals, mealType } = body;

    // Validate payload
    if (!userId) console.error("[save-meal] ❌ Missing userId");
    if (!food) console.error("[save-meal] ❌ Missing food object");
    if (!quantity) console.error("[save-meal] ❌ Missing quantity");
    if (!measure) console.error("[save-meal] ❌ Missing measure");
    if (!totals) console.error("[save-meal] ❌ Missing totals");
    if (!mealType) console.error("[save-meal] ❌ Missing mealType");

    if (!userId || !food || !quantity || !measure || !totals || !mealType) {
      console.error("[save-meal] ❌ Invalid payload received");
      return NextResponse.json(
        { error: "Invalid payload: expected { userId, food, quantity, measure, totals, mealType }" },
        { status: 400 }
      );
    }

    // Today's date
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    console.log("[save-meal] 📅 Date string:", dateStr);

    // Firestore reference
    const mealsRef = collection(db, "users", userId, "meals", dateStr, "entries");
    console.log("[save-meal] 📂 Firestore path:", `users/${userId}/meals/${dateStr}/entries`);

    // Build entry
    const entry = {
      mealType, // e.g. Breakfast, Lunch, Dinner
      food: {
        id: food.id,
        name: food.name,
        serving_size: food.serving_size,
      },
      quantity,
      measure,
      totals,
      createdAt: serverTimestamp(),
    };

    console.log("[save-meal] 📝 Prepared entry:", JSON.stringify(entry, null, 2));

    // Save to Firestore
    const docRef = await addDoc(mealsRef, entry);
    console.log("[save-meal] ✅ Saved successfully, docId:", docRef.id);

    console.log("====================================");
    return NextResponse.json({ success: true, docId: docRef.id });
  } catch (err: any) {
    console.error("[save-meal] ❌ Error caught:", err);
    console.error("[save-meal] ❌ Error stack:", err.stack);

    return NextResponse.json(
      { error: "Failed to save meal", details: err.message },
      { status: 500 }
    );
  }
}