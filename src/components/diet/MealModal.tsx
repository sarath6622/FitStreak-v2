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
  category: string;
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
    oz?: number;
    piece?: number;
    serving?: number;
    cup?: number;
    [key: string]: number | undefined; // for future-proofing
  };
  source?: string;
  nameLower?: string;
};

export type Measure = "Grams" | "Serving" | "Cup" | "Oz" | "Piece";

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string; // Breakfast, Lunch, etc.
  defaultQuantity?: number;
  defaultMeasure?: Measure;
  onSave?: (payload: any) => void;
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

  const [user, setUser] = useState<User | null>(null);

  const mealOptions = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner", "Other"];

  const [localMealType, setLocalMealType] = useState(mealType || "");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  // 🔍 Fetch food data
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
            category: f.category,
            baseNutrientsPer100g: {
              calories: f.baseNutrientsPer100g?.calories ?? 0,
              protein: f.baseNutrientsPer100g?.protein ?? 0,
              carbs: f.baseNutrientsPer100g?.carbs ?? 0,
              fat: f.baseNutrientsPer100g?.fat ?? 0,
              fiber: f.baseNutrientsPer100g?.fiber ?? 0,
              sugars: f.baseNutrientsPer100g?.sugars ?? 0,
            },
            servingUnits: f.servingUnits ?? { g: 1 },
            source: f.source,
            nameLower: f.nameLower,
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

  const [recents, setRecents] = useState<FoodItem[]>([]);

useEffect(() => {
  if (!isOpen || !user || !localMealType) return; // ✅ ensure mealType is chosen

  fetch(`/api/food/recent-foods?userId=${user.uid}&mealType=${localMealType}`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data.foods)) setRecents(data.foods);
    })
    .catch((err) => console.error("[MealModal] recents error:", err));
}, [isOpen, user, localMealType]);

  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [measure, setMeasure] = useState<Measure>(defaultMeasure);

  if (!isOpen) return null;

  const round = (n: number, d = 1) => Number(n.toFixed(d));

const gramsPerUnit = useMemo(() => {
  const f = selectedFood;
  if (!f || !f.servingUnits) {
    return { Grams: 1, Serving: 100, Cup: 240, Oz: 28.35, Piece: 100 };
  }

  return {
    Grams: f.servingUnits.g ?? 1,
    Serving: f.servingUnits.serving ?? 100,
    Cup: f.servingUnits.cup ?? 240,
    Oz: f.servingUnits.oz ?? 28.35,
    Piece: f.servingUnits.piece ?? 100,
  };
}, [selectedFood]);

  const netWeightG = useMemo(() => {
    const gPerUnit = gramsPerUnit[measure] ?? 1;
    return measure === "Grams" ? quantity : quantity * gPerUnit;
  }, [quantity, measure, gramsPerUnit]);

const totals = useMemo(() => {
  if (!selectedFood || !selectedFood.baseNutrientsPer100g) return null;

  const mult = netWeightG / 100;
  const n = selectedFood.baseNutrientsPer100g;

  return {
    calories: Math.round((n.calories ?? 0) * mult),
    protein: round((n.protein ?? 0) * mult, 1),
    fat: round((n.fat ?? 0) * mult, 1),
    carbs: round((n.carbs ?? 0) * mult, 1),
    fiber: round((n.fiber ?? 0) * mult, 1),
    sugars: round((n.sugars ?? 0) * mult, 1),
    netWeightG: round(netWeightG, 0),
  };
}, [selectedFood, netWeightG]);

  const disabled = !selectedFood;

  // --------------------
  // Handle Save → parent
  // --------------------
  const handleAdd = () => {
    if (!selectedFood || !totals || !user) {
      alert("You must be logged in to save meals.");
      return;
    }

    if (!localMealType) {
      alert("Please select a meal type.");
      return;
    }

    const payload = {
      userId: user.uid,
      mealType: localMealType, // ✅ use local selection
      food: selectedFood,
      quantity,
      measure,
      totals,
    };

    onSave?.(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center p-3 justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[420px] max-w-[92vw] rounded-3xl border border-white/10 bg-[#0d0f1a] shadow-2xl">
        {/* Header */}
<div className="px-4 pt-4 pb-4 relative">
  {/* Row 1: Close button */}
  <div className="flex justify-end mb-3">
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-white"
    >
      <X className="h-6 w-6" />
    </button>
  </div>

  {/* Row 2: Meal type selection */}
  {mealType === "" || mealType === "new" ? (
    <div className="flex flex-col w-full">
      <label className="text-sm text-gray-400 mb-1">Select meal type</label>
      <select
        value={localMealType}
        onChange={(e) => setLocalMealType(e.target.value)}
        className={`rounded-lg bg-[var(--surface-dark)] border p-2 text-white ${
          !localMealType
            ? "border-blue-500 animate-pulse"
            : "border-[var(--card-border)]"
        }`}
      >
        <option value="">-- Select meal type --</option>
        {mealOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  ) : (
    <h3 className="text-white font-medium">{mealType}</h3>
  )}
</div>

        {/* Food Search */}
        <FoodSearch
    selectedFood={selectedFood}
    setSelectedFood={setSelectedFood}
    results={results}
    query={query}
    setQuery={setQuery}
    loading={loading}
    recents={recents}
    disabled={!localMealType} // 🔹 disable until meal type is chosen
    // placeholder={
    //   !localMealType ? "Select a meal type first..." : "Search for a food..."
    // }

    onFallbackSearch={async (q) => {
            setLoading(true);
            try {
              const res = await fetch(`/api/food/search?q=${q}&forceGroq=true`);
              const data = await res.json();
              if (res.ok && Array.isArray(data.foods)) {
const mapped = data.foods.map((f: any) => ({
  id: f.id,
  name: f.name,
  category: f.category,
  baseNutrientsPer100g: f.baseNutrientsPer100g
    ? {
        calories: f.baseNutrientsPer100g.calories ?? 0,
        protein: f.baseNutrientsPer100g.protein ?? 0,
        carbs: f.baseNutrientsPer100g.carbs ?? 0,
        fat: f.baseNutrientsPer100g.fat ?? 0,
        fiber: f.baseNutrientsPer100g.fiber ?? 0,
        sugars: f.baseNutrientsPer100g.sugars ?? 0,
      }

    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugars: 0 },
  servingUnits: f.servingUnits ?? { g: 1 },
  source: f.source,
  nameLower: f.nameLower ?? f.name.toLowerCase(),
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
          onAdd={handleAdd}
        />
      </div>
    </div>
  );
}