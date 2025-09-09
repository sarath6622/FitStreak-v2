import { serverTimestamp } from "firebase/firestore";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --------------------
// Firestore-ready type
// --------------------
export interface NormalizedFood {
  id: string;
  name: string;
  category: string | null;
  brand?: string | null;
  imageUrl?: string;
  servingSize?: string;

  // 👇 Required by your MealModal
  baseNutrientsPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugars: number;
  };

  servingUnits: {
    g: number;
    piece?: number;
    serving?: number;
    cup?: number;
    oz?: number;
    [key: string]: number | undefined;
  };

  source: "groq" | "manual" | "firestore";
  nameLower: string;
  createdAt: any; // Firestore timestamp
}

// --------------------
// Groq Fetcher
// --------------------

export async function fetchFoodFromGroq(query: string): Promise<NormalizedFood[] | null> {
  const prompt = `
You are a nutrition database assistant.
A user searched for "${query}".
Return a JSON object with a single key "foods" containing 1–5 related foods.

Schema:
{
  "foods": [
    {
      "id": "banana-fruit-001",   // slugified lowercase name + category if known
      "name": "Banana",
      "category": "Fruit",
      "brand": null,
      "imageUrl": null,
      "servingSize": "100g",
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
        "cup": 150,
        "oz": 28.35
      },
      "source": "groq",
      "nameLower": "banana"
    }
  ]
}

Rules:
- Always wrap results inside { "foods": [] }
- Nutrients must always be numbers (default 0 if unknown)
- ServingUnits must always be numbers (grams equivalent)
- Calories and macros are per 100g if possible
- Do not include timestamps (backend adds createdAt)
  `;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    const foods: NormalizedFood[] = (parsed.foods || []).map((f: any) => ({
      id: f.id ?? query.toLowerCase().replace(/\s+/g, "-"),
      name: f.name ?? query,
      category: f.category ?? null,
      brand: f.brand ?? null,
      imageUrl: f.imageUrl ?? null,
      servingSize: f.servingSize ?? "100g",
      baseNutrientsPer100g: {
        calories: Number(f.baseNutrientsPer100g?.calories ?? 0),
        protein: Number(f.baseNutrientsPer100g?.protein ?? 0),
        carbs: Number(f.baseNutrientsPer100g?.carbs ?? 0),
        fat: Number(f.baseNutrientsPer100g?.fat ?? 0),
        fiber: Number(f.baseNutrientsPer100g?.fiber ?? 0),
        sugars: Number(f.baseNutrientsPer100g?.sugars ?? 0),
      },
      servingUnits: {
        g: 1,
        ...f.servingUnits,
      },
      source: "groq",
      nameLower: (f.name ?? query).toLowerCase(),
      createdAt: serverTimestamp(),
    }));

    return foods;
  } catch (err) {
    console.error("Groq parse error:", raw, err);
    return null;
  }
}