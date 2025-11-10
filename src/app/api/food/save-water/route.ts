// app/api/save-water/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[save-water] Incoming payload:", JSON.stringify(body, null, 2));

    const { userId, amount } = body;

    if (!userId || typeof amount !== "number" || amount <= 0) {
      console.error("[save-water] Invalid payload:", body);
      return NextResponse.json(
        { error: "Invalid request payload: expected { userId, amount > 0 }" },
        { status: 400 }
      );
    }

    // Today's date as YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Reference: users/{uid}/water/{date}/logs/{autoId}
    const logsRef = collection(db, "users", userId, "water", dateStr, "logs");

    // Save water log
    await addDoc(logsRef, {
      amount, // ml consumed
      createdAt: serverTimestamp(),
    });

    console.log(`[save-water] Logged ${amount}ml for user ${userId} on ${dateStr}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[save-water] Error:", err);
    return NextResponse.json(
      { error: "Failed to log water", details: err.message },
      { status: 500 }
    );
  }
}