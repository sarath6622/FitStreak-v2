import { serverTimestamp } from "firebase/firestore";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --------------------
// Firestore-ready type
// --------------------
export interface NormalizedFood {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl?: string;
  servingSize?: string;
  nutrients: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber?: number | null;
    sugars?: number | null;
  };
  source: "groq" | "manual";
  createdAt: any; // Firestore timestamp
}

// --------------------
// Groq Fetcher
// --------------------
export async function fetchFoodFromGroq(
  query: string
): Promise<NormalizedFood | null> {
  const prompt = `
    You are a nutrition database assistant.
    Given the food name: "${query}", return its nutritional info
    in strict JSON with this schema:

    {
      "id": string,           // slugified lowercase name
      "name": string,         // readable name
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
      }
    }

    Rules:
    - Always respond with ONLY JSON.
    - If data is uncertain, set field to null.
    - Use grams (g) for serving sizes if unsure.
    - Calories are per 100g unless otherwise clear.
  `;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const raw = completion.choices[0].message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    const normalized: NormalizedFood = {
      id: parsed.id ?? query.toLowerCase().replace(/\s+/g, "-"),
      name: parsed.name ?? query,
      brand: parsed.brand ?? null,
      category: parsed.category ?? null,
      imageUrl: parsed.imageUrl ?? undefined,
      servingSize: parsed.servingSize ?? undefined,
      nutrients: {
        calories: parsed.nutrients?.calories ?? null,
        protein: parsed.nutrients?.protein ?? null,
        carbs: parsed.nutrients?.carbs ?? null,
        fat: parsed.nutrients?.fat ?? null,
        fiber: parsed.nutrients?.fiber ?? null,
        sugars: parsed.nutrients?.sugars ?? null,
      },
      source: "groq",
      createdAt: serverTimestamp(),
    };

    return normalized;
  } catch (err) {
    console.error("Groq parse error:", raw, err);
    return null;
  }
}