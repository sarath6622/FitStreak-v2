"use client";
import { useEffect, useMemo, useState } from "react";
import FoodSearch from "@/components/diet/modal/FoodHeader";
import QuantityMeasure from "./modal/QuantityMeasure";
import NutrientsCard from "./modal/NutrientsCard";
import FooterActions from "./modal/FooterActions";
import { X } from "lucide-react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

// --------------------
// Types
// --------------------
export type FoodItem = {
  id: string;
  name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fiber_g: number;
  sugar_g: number;
  fat_g: number;
  serving_weight_g?: number;
  cup_weight_g?: number;
  piece_weight_g?: number;
};

export type Measure = "Grams" | "Serving" | "Cup" | "Oz" | "Piece";

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string; // Breakfast, Lunch, etc.
  defaultQuantity?: number;
  defaultMeasure?: Measure;
  onSave?: (payload: any) => void; // optional: if parent still wants local state
}

// --------------------
// Debounce Hook
// --------------------
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// --------------------
// Component
// --------------------
export default function MealModal({
  isOpen,
  onClose,
  mealType,
  defaultQuantity = 100,
  defaultMeasure = "Grams",
  onSave,
}: MealModalProps) {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch food data

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!debouncedQuery) return;

    const fetchFood = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/food/search?q=${debouncedQuery}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.foods)) {
          const mapped = data.foods.map((f: any) => ({
            id: f.id,
            name: f.name,
            serving_size: f.servingSize ?? "100g",
            calories: f.nutrients.calories ?? 0,
            protein_g: f.nutrients.protein ?? 0,
            carbohydrates_g: f.nutrients.carbs ?? 0,
            fiber_g: f.nutrients.fiber ?? 0,
            sugar_g: f.nutrients.sugars ?? 0,
            fat_g: f.nutrients.fat ?? 0,
          }));
          setResults(mapped);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("[MealModal] Error fetching food:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [debouncedQuery]);

  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [measure, setMeasure] = useState<Measure>(defaultMeasure);

  if (!isOpen) return null;

  const round = (n: number, d = 1) => Number(n.toFixed(d));

  const gramsPerUnit = useMemo(() => {
    const f = selectedFood;
    if (!f) return { Grams: 1, Serving: 100, Cup: 240, Oz: 28.35, Piece: 100 };
    return {
      Grams: 1,
      Serving: f.serving_weight_g ?? 100,
      Cup: f.cup_weight_g ?? 240,
      Oz: 28.35,
      Piece: f.piece_weight_g ?? f.serving_weight_g ?? 100,
    };
  }, [selectedFood]);

  const netWeightG = useMemo(() => {
    const gPerUnit = gramsPerUnit[measure] ?? 1;
    return measure === "Grams" ? quantity : quantity * gPerUnit;
  }, [quantity, measure, gramsPerUnit]);

  const totals = useMemo(() => {
    if (!selectedFood) return null;
    const mult = netWeightG / 100;
    return {
      calories: Math.round(selectedFood.calories * mult),
      protein: round(selectedFood.protein_g * mult, 1),
      fat: round(selectedFood.fat_g * mult, 1),
      carbs: round(selectedFood.carbohydrates_g * mult, 1),
      fiber: round(selectedFood.fiber_g * mult, 1),
      netWeightG: round(netWeightG, 0),
    };
  }, [selectedFood, netWeightG]);

  const disabled = !selectedFood || saving;

  // --------------------
  // Handle Save → API
  // --------------------
  const handleAdd = async () => {
    if (!selectedFood || !totals || !user) {
      alert("You must be logged in to save meals.");
      return;
    }

    const payload = {
      userId: user.uid,   // 👈 REQUIRED
      mealType,
      food: selectedFood,
      quantity,
      measure,
      totals,
    };

    try {
      setSaving(true);
      const res = await fetch("/api/food/save-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save meal");

      onSave?.(payload); // still notify parent if needed
      onClose();
    } catch (err) {
      console.error("[MealModal] Save error:", err);
      alert("Failed to save meal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[420px] max-w-[92vw] rounded-3xl border border-white/10 bg-[#0d0f1a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-white font-medium">{mealType}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Food Search */}
        <FoodSearch
          selectedFood={selectedFood}
          setSelectedFood={setSelectedFood}
          results={results}
          query={query}
          setQuery={setQuery}
          loading={loading}
          onFallbackSearch={async (q) => {
            setLoading(true);
            try {
              const res = await fetch(`/api/food/search?q=${q}&forceGroq=true`);
              const data = await res.json();
              if (res.ok && Array.isArray(data.foods)) {
                const mapped = data.foods.map((f: any) => ({
                  id: f.id,
                  name: f.name,
                  serving_size: f.servingSize ?? "100g",
                  calories: f.nutrients?.calories ?? 0,
                  protein_g: f.nutrients?.protein ?? 0,
                  carbohydrates_g: f.nutrients?.carbs ?? 0,
                  fiber_g: f.nutrients?.fiber ?? 0,
                  sugar_g: f.nutrients?.sugars ?? 0,
                  fat_g: f.nutrients?.fat ?? 0,
                }));
                setResults(mapped);
              } else {
                setResults([]);
              }
            } catch (err) {
              console.error("[MealModal] Fallback error:", err);
              setResults([]);
            } finally {
              setLoading(false);
            }
          }}
        />

        <QuantityMeasure
          quantity={quantity}
          setQuantity={setQuantity}
          measure={measure}
          setMeasure={setMeasure}
        />
        <NutrientsCard totals={totals} />

        <FooterActions
          disabled={disabled}
          onClose={onClose}
          onAdd={handleAdd} // 👈 now saves directly to Firestore
        />
      </div>
    </div>
  );
}