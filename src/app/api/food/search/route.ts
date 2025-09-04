// app/api/food/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
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
import { NormalizedFood } from "@/lib/openfoodfacts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

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
        const results: NormalizedFood[] = snapshot.docs.map(
          (d) => d.data() as NormalizedFood
        );
        console.log(`[food-search] ✅ Found ${results.length} result(s) in Firestore`);
        return NextResponse.json({ source: "firestore", foods: results });
      }

      // ⚠️ If no Firestore result AND not forced → return empty
      return NextResponse.json({ source: "firestore", foods: [] });
    }

    // 🌍 If forceGroq=true → call Groq
    console.log("[food-search] 🌍 Forced Groq search:", lowerQuery);

    const prompt = `
      You are a nutrition assistant. A user searched for "${searchTerm}".
      Return a JSON object with a single key "foods" containing 1–5 related variations of this food.

      Rules:
      - Always wrap results inside { "foods": [] }
      - Each entry must match this schema:
        {
          "id": string,
          "name": string,
          "brand": string | null,
          "category": string | null,
          "imageUrl": string | null,
          "servingSize": string | null,
          "nutrients": {
            "calories": number | null,
            "protein": number | null,
            "carbs": number | null,
            "fat": number | null,
            "fiber": number | null,
            "sugars": number | null
          },
          "source": "groq"
        }

      - Nutrients should be per 100g if possible
      - If data is unknown, set the field to null
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
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let foods: NormalizedFood[];
    try {
      const obj = JSON.parse(parsed);
      foods = obj.foods;
    } catch (err) {
      console.error("❌ Failed to parse AI response:", parsed);
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    // add Firestore timestamp + nameLower
    foods = foods.map((f) => ({
      ...f,
      nameLower: f.name.toLowerCase(),
      createdAt: serverTimestamp(),
    }));

    // 💾 Cache first Groq result
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