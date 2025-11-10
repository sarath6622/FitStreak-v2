// app/api/get-water/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in query params" },
        { status: 400 }
      );
    }

    // Today's date as YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Reference: users/{uid}/water/{date}/logs
    const logsRef = collection(db, "users", userId, "water", dateStr, "logs");

    const snapshot = await getDocs(logsRef);

    let total = 0;
    const logs: { id: string; amount: number; createdAt: string | null }[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount ?? 0;
      total += amount;

      logs.push({
        id: doc.id,
        amount,
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? null,
      });
    });

    console.log(`[get-water] User ${userId} total today: ${total}ml`);

    return NextResponse.json({
      userId,
      date: dateStr,
      total,
      logs,
    });
  } catch (err: any) {
    console.error("[get-water] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch water logs", details: err.message },
      { status: 500 }
    );
  }
}