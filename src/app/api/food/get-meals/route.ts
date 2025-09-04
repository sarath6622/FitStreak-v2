// app/api/food/get-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    const mealsRef = collection(db, "users", userId, "meals", dateStr, "entries");
    const snap = await getDocs(mealsRef);

    // 🔹 Aggregate by mealType
    const mealTotals: Record<
      string,
      { calories: number; carbs: number; protein: number; fat: number }
    > = {};

    snap.forEach((doc) => {
      const d = doc.data();
      const type = d.mealType || "Other";
      if (!mealTotals[type]) {
        mealTotals[type] = { calories: 0, carbs: 0, protein: 0, fat: 0 };
      }

      mealTotals[type].calories += d.totals?.calories || 0;
      mealTotals[type].carbs += d.totals?.carbs || 0;
      mealTotals[type].protein += d.totals?.protein || 0;
      mealTotals[type].fat += d.totals?.fat || 0;
    });

    // 🔹 Convert to array for frontend
    const meals = Object.entries(mealTotals).map(([name, totals]) => ({
      name,
      ...totals,
    }));

    return NextResponse.json({ date: dateStr, meals });
  } catch (err: any) {
    console.error("[get-meals] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}