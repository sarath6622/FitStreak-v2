// app/api/food/recent-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const mealType = searchParams.get("mealType");

    if (!userId || !mealType) {
      return NextResponse.json({ error: "Missing userId or mealType" }, { status: 400 });
    }

    const today = new Date();
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    const recents: any[] = [];

    for (const dateStr of days) {
      const entriesRef = collection(db, "users", userId, "meals", dateStr, "entries");
      const q = query(entriesRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      snap.forEach((doc) => {
        const data = doc.data();

        if (data.mealType === mealType && data.food) {
          recents.push({
            id: data.food.id,
            name: data.food.name,
            category: mealType, // we don’t store category, fallback to mealType
            baseNutrientsPer100g: {
              calories: data.nutrients?.calories ?? 0,
              protein: data.nutrients?.protein ?? 0,
              carbs: data.nutrients?.carbs ?? 0,
              fat: data.nutrients?.fat ?? 0,
              fiber: data.nutrients?.fiber ?? 0,
              sugars: data.nutrients?.sugars ?? 0,
            },
            servingUnits: {
              g: 1, // always fallback to grams
              serving: data.servingWeight ?? 100,
            },
          });
        }
      });
    }

    // Deduplicate by food id (latest first)
    const unique = Array.from(new Map(recents.map((f) => [f.id, f])).values()).slice(0, 10);

    return NextResponse.json({ foods: unique });
  } catch (err: any) {
    console.error("[recent-meals] Fatal error:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}