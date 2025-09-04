"use client";
import { useMemo, useState } from "react";
import foods from "@/components/diet/foods.json";
import FoodHeader from "./modal/FoodHeader";
import QuantityMeasure from "./modal/QuantityMeasure";
import NutrientsCard from "./modal/NutrientsCard";
import FooterActions from "./modal/FooterActions";
import { X } from "lucide-react";

export type FoodItem = {
  id: number;
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

// ✅ Define measure type so it's never undefined
export type Measure = "Grams" | "Serving" | "Cup" | "Oz" | "Piece";

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodId?: number;
  defaultQuantity?: number;
  defaultMeasure?: Measure;
  onSave: (payload: {
    food: FoodItem;
    quantity: number;
    measure: Measure;
    totals: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber: number;
      netWeightG: number;
    };
  }) => void;
}

export default function MealModal({
  isOpen,
  onClose,
  foodId,
  defaultQuantity = 100,
  defaultMeasure = "Grams",
  onSave,
}: MealModalProps) {
  const initialFood = useMemo(
    () => foods.find((f: FoodItem) => f.id === foodId) || null,
    [foodId]
  );

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(initialFood);
  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [measure, setMeasure] = useState<Measure>(defaultMeasure); // ✅ fixed typing

  if (!isOpen) return null;

  // helpers
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

  const disabled = !selectedFood;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-[420px] max-w-[92vw] rounded-3xl border border-white/10 bg-[#0d0f1a] shadow-2xl">
        {/* Top close button */}
        <div className="flex items-center justify-end px-4 pt-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sections */}
        <FoodHeader
          foods={foods}
          selectedFood={selectedFood}
          setSelectedFood={setSelectedFood}
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
          onAdd={() => {
            if (!selectedFood || !totals) return;
            onSave({ food: selectedFood, quantity, measure, totals });
            onClose();
          }}
        />
      </div>
    </div>
  );
}