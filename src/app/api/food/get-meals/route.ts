// app/api/food/get-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // 🔹 Query meals with order by createdAt
    const mealsRef = collection(db, "users", userId, "meals", dateStr, "entries");
    const q = query(mealsRef, orderBy("createdAt", "asc"));
    const snap = await getDocs(q);

    // Totals grouped by mealType
    const mealTotals: Record<
      string,
      { calories: number; carbs: number; protein: number; fat: number; items: any[] }
    > = {};

    // Timeline (flat list)
    const timeline: any[] = [];

    snap.forEach((doc) => {
      const d = doc.data();
      const type = d.mealType || "Other";

      if (!mealTotals[type]) {
        mealTotals[type] = { calories: 0, carbs: 0, protein: 0, fat: 0, items: [] };
      }

      // Aggregate nutrients
      mealTotals[type].calories += d.nutrients?.calories || 0;
      mealTotals[type].carbs += d.nutrients?.carbs || 0;
      mealTotals[type].protein += d.nutrients?.protein || 0;
      mealTotals[type].fat += d.nutrients?.fat || 0;

      // Build entry object
      const entry = {
        id: doc.id,
        foodId: d.food?.id,
        foodName: d.food?.name,
        quantity: d.quantity,
        measure: d.measure,
        nutrients: d.nutrients,
        consumedAt: d.createdAt || null,
        mealType: type,
      };

      mealTotals[type].items.push(entry);
      timeline.push(entry);
    });

    // Convert to array for frontend
    const meals = Object.entries(mealTotals).map(([name, totals]) => ({
      name,
      calories: totals.calories,
      carbs: totals.carbs,
      protein: totals.protein,
      fat: totals.fat,
      items: totals.items,
    }));

    return NextResponse.json({
      date: dateStr,
      meals,
      timeline, // ✅ flat list of all consumed foods today
    });
  } catch (err: any) {
    console.error("[get-meals] ❌ Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}