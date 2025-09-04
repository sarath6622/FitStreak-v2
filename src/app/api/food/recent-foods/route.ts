// app/api/food/recent-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const mealType = searchParams.get("mealType"); // Breakfast, Lunch, Dinner, etc.

    console.log("[recent-meals] Incoming request", { userId, mealType });

    if (!userId || !mealType) {
      console.warn("[recent-meals] Missing params", { userId, mealType });
      return NextResponse.json({ error: "Missing userId or mealType" }, { status: 400 });
    }

    // For simplicity, fetch last N days (say 7 days)
    const today = new Date();
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    console.log("[recent-meals] Checking days:", days);

    const recents: any[] = [];

    for (const dateStr of days) {
      console.log(`[recent-meals] Fetching entries for`, { dateStr });

      const entriesRef = collection(db, "users", userId, "meals", dateStr, "entries");
      const snap = await getDocs(entriesRef);

      console.log(`[recent-meals] ${dateStr} → found ${snap.size} docs`);

snap.forEach((doc) => {
  const data = doc.data();
  console.log(`[recent-meals] Doc ${doc.id}`, JSON.stringify(data.food, null, 2));

if (data.mealType === mealType && data.food) {
  recents.push({
    id: data.food.id,
    name: data.food.name,
    serving_size: data.food.serving_size ?? "100g",
    calories: data.totals?.calories ?? 0,
    protein_g: data.totals?.protein ?? 0,
    carbohydrates_g: data.totals?.carbs ?? 0,
    fat_g: data.totals?.fat ?? 0,
    fiber_g: data.totals?.fiber ?? 0,
    sugar_g: data.totals?.sugar ?? 0,
  });
} else {
    console.log(
      `[recent-meals] Skipping doc ${doc.id}, mealType=${data.mealType}, hasFood=${!!data.food}`
    );
  }
});
    }

    // Deduplicate by food id (latest first)
    const unique = Array.from(new Map(recents.map((f) => [f.id, f])).values()).slice(0, 10);

    console.log("[recent-meals] Returning unique foods:", unique);

    return NextResponse.json({ foods: unique });
  } catch (err: any) {
    console.error("[recent-meals] Fatal error:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}