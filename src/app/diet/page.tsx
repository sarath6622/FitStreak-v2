"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { CaloriesRing, WaterRing, Macros, MealCard } from "@/components/diet";
import MealModal from "@/components/diet/MealModal";

type Meal = {
  id?: string; // from Firestore
  name: string;
  calories: number;
  recommended: number;
  carbs: number;
  protein: number;
  fat: number;
};

// 🔹 Default fixed meal slots
const DEFAULT_MEALS: Meal[] = [
  { name: "Breakfast", calories: 0, recommended: 400, carbs: 0, protein: 0, fat: 0 },
  { name: "Morning Snack", calories: 0, recommended: 200, carbs: 0, protein: 0, fat: 0 },
  { name: "Lunch", calories: 0, recommended: 600, carbs: 0, protein: 0, fat: 0 },
  { name: "Evening Snack", calories: 0, recommended: 200, carbs: 0, protein: 0, fat: 0 },
  { name: "Dinner", calories: 0, recommended: 500, carbs: 0, protein: 0, fat: 0 },
];

export default function Diet() {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // 🔹 Fetch meals when user is available
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMeals = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/food/get-meals?userId=${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch meals");
        const data = await res.json();

        // Merge defaults with saved meals
        const merged = DEFAULT_MEALS.map((slot) => {
          const saved = data.meals.find((m: Meal) => m.name === slot.name);
          return saved ? { ...slot, ...saved } : slot;
        });

        setMeals(merged);
      } catch (err) {
        console.error("Error fetching meals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [user]);

  // 🔹 Totals (memoized for performance)
  const { totalCalories, calorieGoal, totalCarbs, totalProtein, totalFat } = useMemo(() => {
    const totalCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const calorieGoal = meals.reduce((acc, m) => acc + (m.recommended || 0), 0);
    const totalCarbs = meals.reduce((acc, m) => acc + (m.carbs || 0), 0);
    const totalProtein = meals.reduce((acc, m) => acc + (m.protein || 0), 0);
    const totalFat = meals.reduce((acc, m) => acc + (m.fat || 0), 0);

    return { totalCalories, calorieGoal, totalCarbs, totalProtein, totalFat };
  }, [meals]);

  // 🔹 Macro goals (could be dynamic from profile later)
  const macroGoals = { carbs: 180, protein: 72, fat: 48 };

  const macroData = [
    { name: "Carbs", value: totalCarbs, goal: macroGoals.carbs, color: "#3b82f6" },
    { name: "Protein", value: totalProtein, goal: macroGoals.protein, color: "#22c55e" },
    { name: "Fat", value: totalFat, goal: macroGoals.fat, color: "#a855f7" },
  ];

  const waterIntake = 1200;
  const waterGoal = 3000;

  // 🔹 Update a meal when saving (local only for now)
  const handleSave = useCallback(
    (index: number, calories: number, macros: { carbs: number; protein: number; fat: number }) => {
      setMeals((prev) =>
        prev.map((m, i) => (i === index ? { ...m, calories, ...macros } : m))
      );
    },
    []
  );

  if (loading) {
    return (
      <div className="p-4 text-gray-400">
        Loading meals...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-red-400">
        Please log in to see your meals.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-white">My Diary</h2>
        <p className="text-gray-400 text-sm">Summary</p>
      </header>

      {/* Rings */}
      <div className="grid grid-cols-2 gap-4">
        <CaloriesRing total={totalCalories} goal={calorieGoal} />
        <WaterRing intake={waterIntake} goal={waterGoal} />
      </div>

      {/* Macros */}
      <Macros data={macroData} waterIntake={waterIntake} waterGoal={waterGoal} />

      {/* Meals Grid */}
      <div className="grid grid-cols-2 gap-3">
        {meals.map((meal, index) => (
          <MealCard
            key={meal.id || meal.name}
            name={meal.name}
            calories={meal.calories}
            recommended={meal.recommended}
            onClick={() => setSelectedMeal(index)}
          />
        ))}
      </div>

      {/* Modal */}
{selectedMeal !== null && (
<MealModal
  isOpen={true}
  onClose={() => setSelectedMeal(null)}
  defaultQuantity={100}
  mealType={meals[selectedMeal].name}
  defaultMeasure="Grams"
  onSave={async ({ food, quantity, measure, totals, mealType, userId }) => {
    try {
      const res = await fetch("/api/food/save-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          food,
          quantity,
          measure,
          totals,
          mealType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save meal");

      console.log("[Diet] ✅ Meal saved:", data);

      // Update local state
      handleSave(selectedMeal, totals.calories, {
        carbs: totals.carbs,
        protein: totals.protein,
        fat: totals.fat,
      });
    } catch (err) {
      console.error("[Diet] ❌ Error saving meal:", err);
    }

    setSelectedMeal(null);
  }}
/>
)}
    </div>
  );
}