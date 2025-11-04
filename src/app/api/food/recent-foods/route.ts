// app/api/food/recent-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getRecentFoodsSchema, validateQueryParams } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate input
    const validation = validateQueryParams(getRecentFoodsSchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { userId } = validation.data;
    const mealType = searchParams.get("mealType");

    if (!mealType) {
      return NextResponse.json({ error: "Missing mealType" }, { status: 400 });
    }

    const today = new Date();
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    const recents: any[] = [];

    // FIX: Fetch all days in parallel to avoid N+1 query problem
    const queryPromises = days.map(async (dateStr) => {
      const entriesRef = collection(db, "users", userId, "meals", dateStr, "entries");
      const q = query(entriesRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return { dateStr, docs: snap.docs };
    });

    const allDaysData = await Promise.all(queryPromises);

    // Process all docs
    for (const { docs } of allDaysData) {
      docs.forEach((doc) => {
        const data = doc.data();

        if (data.mealType === mealType && data.food) {
          recents.push({
            id: data.food.id,
            name: data.food.name,
            category: mealType,
            baseNutrientsPer100g: {
              calories: data.nutrients?.calories ?? 0,
              protein: data.nutrients?.protein ?? 0,
              carbs: data.nutrients?.carbs ?? 0,
              fat: data.nutrients?.fat ?? 0,
              fiber: data.nutrients?.fiber ?? 0,
              sugars: data.nutrients?.sugars ?? 0,
            },
            servingUnits: {
              g: 1,
              serving: data.servingWeight ?? 100,
            },
          });
        }
      });
    }

    // Deduplicate by food id (latest first)
    const unique = Array.from(new Map(recents.map((f) => [f.id, f])).values()).slice(0, 10);

    return NextResponse.json({ foods: unique });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch recent foods" }, { status: 500 });
  }
}