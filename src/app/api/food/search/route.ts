// app/api/food/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import {
  collection,
  query as fsQuery,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import Groq from "groq-sdk";
import { NormalizedFood } from "@/features/diet/utils/openfoodfacts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// ✅ Normalizer → guarantees safe shape for UI
function normalizeFood(f: any): NormalizedFood {
  return {
    id: f.id ?? `food-${Date.now()}`,
    name: f.name ?? "Unknown Food",
    category: f.category ?? "Other",
    baseNutrientsPer100g: {
      calories: Number(f.baseNutrientsPer100g?.calories ?? 0),
      protein: Number(f.baseNutrientsPer100g?.protein ?? 0),
      carbs: Number(f.baseNutrientsPer100g?.carbs ?? 0),
      fat: Number(f.baseNutrientsPer100g?.fat ?? 0),
      fiber: Number(f.baseNutrientsPer100g?.fiber ?? 0),
      sugars: Number(f.baseNutrientsPer100g?.sugars ?? 0),
    },
    servingUnits: {
      g: Number(f.servingUnits?.g ?? 100), // 100g baseline
      piece: Number(f.servingUnits?.piece ?? 0),
      serving: Number(f.servingUnits?.serving || f.servingUnits?.piece || 100),
      cup: Number(f.servingUnits?.cup ?? 0),
      oz: Number(f.servingUnits?.oz ?? 0),
    },
    source: f.source ?? "generated",
    nameLower: f.name ? f.name.toLowerCase() : "unknown",
    createdAt: serverTimestamp(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("q");
    const forceGroq = searchParams.get("forceGroq") === "true";

    if (!searchTerm) {
      return NextResponse.json({ error: "Missing query ?q=" }, { status: 400 });
    }

    const lowerQuery = searchTerm.toLowerCase();
    console.log("[food-search] 🔎 Searching Firestore for:", lowerQuery);

    if (!forceGroq) {
      // ✅ Query Firestore first
      const foodsCol = collection(db, "diet");
      const q = fsQuery(
        foodsCol,
        where("nameLower", ">=", lowerQuery),
        where("nameLower", "<=", lowerQuery + "\uf8ff")
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const results: NormalizedFood[] = snapshot.docs.map((d) =>
          normalizeFood(d.data())
        );
        console.log(
          `[food-search] ✅ Found ${results.length} result(s) in Firestore`
        );
        return NextResponse.json({ source: "firestore", foods: results });
      }

      // ⚠️ If no Firestore result AND not forced → return empty
      return NextResponse.json({ source: "firestore", foods: [] });
    }

    // 🌍 If forceGroq=true → call Groq
    console.log("[food-search] 🌍 Forced Groq search:", lowerQuery);

    const prompt = `
You are a nutrition API. A user searched for "${searchTerm}".
Respond with a JSON object ONLY. No text, no comments.

Output format:
{
  "foods": [
    {
      "id": "banana-fruit-001",   // slugified, lowercase, category if known
      "name": "Banana",
      "category": "Fruit",
      "baseNutrientsPer100g": {
        "calories": 89,
        "protein": 1.1,
        "carbs": 23,
        "fat": 0.3,
        "fiber": 2.6,
        "sugars": 12
      },
      "servingUnits": {
        "g": 1,
        "piece": 120,
        "serving": 118,
        "cup": 150
      },
      "source": "generated",
      "nameLower": "banana"
    }
  ]
}

Rules:
- Always wrap inside { "foods": [] }.
- Always return numeric values (0 if unknown).
- Always include all keys (even if 0).
- Do not include timestamps (backend adds createdAt).
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const parsed = completion.choices[0].message?.content;
    console.log("[food-search] Groq response:", parsed);

    if (!parsed) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let foods: NormalizedFood[];
    try {
      const obj = JSON.parse(parsed);
      foods = obj.foods.map(normalizeFood);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", parsed);
      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    // 💾 Cache first normalized Groq result
    if (foods[0]) {
      console.log("[food-search] 💾 Caching Groq result:", foods[0].id);
      await setDoc(doc(db, "diet", foods[0].id), foods[0]);
    }

    return NextResponse.json({ source: "groq", foods });
  } catch (err: any) {
    console.error("[food-search] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
