"use client";
import { useState } from "react";
import { CaloriesRing, WaterRing, Macros, MealCard } from "@/components/diet";
import MealModal from "@/components/diet/MealModal"; // ✅ import

export default function Diet() {
  // ✅ each meal now tracks macros
  const [meals, setMeals] = useState([
    {
      name: "Breakfast",
      calories: 450,
      recommended: 550,
      carbs: 60,
      protein: 20,
      fat: 15,
    },
    {
      name: "Lunch",
      calories: 500,
      recommended: 550,
      carbs: 70,
      protein: 25,
      fat: 18,
    },
    {
      name: "Dinner",
      calories: 0,
      recommended: 600,
      carbs: 0,
      protein: 0,
      fat: 0,
    },
    {
      name: "Snacks",
      calories: 0,
      recommended: 300,
      carbs: 0,
      protein: 0,
      fat: 0,
    },
  ]);

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = meals.reduce((acc, m) => acc + m.recommended, 0);

  // ✅ total macros from meals
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fat, 0);

  // ✅ macro goals (can be from user profile later)
  const carbGoal = 180;
  const proteinGoal = 72;
  const fatGoal = 48;

  const macroData = [
    { name: "Carbs", value: totalCarbs, goal: carbGoal, color: "#3b82f6" },
    { name: "Protein", value: totalProtein, goal: proteinGoal, color: "#22c55e" },
    { name: "Fat", value: totalFat, goal: fatGoal, color: "#a855f7" },
  ];

  const waterIntake = 1200;
  const waterGoal = 3000;

  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);

  const handleSave = (
    index: number,
    calories: number,
    macros: { carbs: number; protein: number; fat: number }
  ) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, calories, ...macros } : m
      )
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-white">My Diary</h2>
      <p className="text-gray-400 text-sm">Summary</p>

      <div className="grid grid-cols-2 gap-4">
        <CaloriesRing total={totalCalories} goal={calorieGoal} />
        <WaterRing intake={waterIntake} goal={waterGoal} />
      </div>

      {/* ✅ now using dynamic macros */}
      <Macros data={macroData} waterIntake={waterIntake} waterGoal={waterGoal} />

      {/* Meals Grid */}
      <div className="grid grid-cols-2 gap-3">
        {meals.map((meal, index) => (
          <MealCard
            key={index}
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
    isOpen={selectedMeal !== null}
    onClose={() => setSelectedMeal(null)}
    foodId={1} // 👈 you can later make this dynamic if needed
    defaultQuantity={100}
    defaultMeasure="Grams"
    onSave={({ totals }) =>
      handleSave(selectedMeal, totals.calories, {
        carbs: totals.carbs,
        protein: totals.protein,
        fat: totals.fat,
      })
    }

  />
)}
    </div>
  );
}