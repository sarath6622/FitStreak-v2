"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CaloriesRing, WaterRing, Macros, MealCard } from "@/components/diet";
import MealModal from "@/components/diet/MealModal";
import { UserProfile } from "@/types/UserProfile";
import { Sparkles } from "lucide-react";

type Meal = {
  id?: string; // from Firestore
  name: string;
  calories: number;
  recommended: number;
  carbs: number;
  protein: number;
  fat: number;
};

// 🔹 Calculate calories based on profile
function calculateCalories(profile: UserProfile): number {
  if (!profile.height || !profile.weight || !profile.age || !profile.gender) return 2000;

  const bmr =
    profile.gender === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;

  let calories = bmr * 1.55; // moderate activity
  if (profile.goal === "lose") calories -= 500;
  if (profile.goal === "gain") calories += 500;

  return Math.round(calories);
}

// 🔹 Build meals dynamically
function getDynamicMeals(dailyCalories: number): Meal[] {
  const distribution = [0.25, 0.1, 0.3, 0.1, 0.25];
  const names = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"];

  return names.map((name, i) => ({
    name,
    calories: 0,
    recommended: Math.round(dailyCalories * distribution[i]),
    carbs: 0,
    protein: 0,
    fat: 0,
  }));
}

export default function Diet() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Watch auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  // 🔹 Fetch profile
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setMeals([]);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      } catch (err) {
        console.error("[Diet] ❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // 🔹 Fetch meals once profile is ready
  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    const fetchMeals = async () => {
      try {
        setLoading(true);

        const dailyCalories = calculateCalories(profile);
        const dynamicMeals = getDynamicMeals(dailyCalories);

        const res = await fetch(`/api/food/get-meals?userId=${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch meals");
        const data = await res.json();

        const merged = dynamicMeals.map((slot) => {
          const saved = data.meals.find((m: Meal) => m.name === slot.name);
          return saved ? { ...slot, ...saved } : slot;
        });

        setMeals(merged);
      } catch (err) {
        console.error("[Diet] ❌ Error fetching meals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [user, profile]);

  // 🔹 Totals
  const { totalCalories, calorieGoal, totalCarbs, totalProtein, totalFat } = useMemo(() => {
    const totalCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const calorieGoal = meals.reduce((acc, m) => acc + (m.recommended || 0), 0);
    const totalCarbs = meals.reduce((acc, m) => acc + (m.carbs || 0), 0);
    const totalProtein = meals.reduce((acc, m) => acc + (m.protein || 0), 0);
    const totalFat = meals.reduce((acc, m) => acc + (m.fat || 0), 0);

    return { totalCalories, calorieGoal, totalCarbs, totalProtein, totalFat };
  }, [meals]);

  // 🔹 Macro goals (dynamic split)
  const macroGoals = useMemo(() => {
    return {
      carbs: Math.round((0.5 * calorieGoal) / 4),
      protein: Math.round((0.2 * calorieGoal) / 4),
      fat: Math.round((0.3 * calorieGoal) / 9),
    };
  }, [calorieGoal]);

  const macroData = [
    { name: "Carbs", value: totalCarbs, goal: macroGoals.carbs, color: "#3b82f6" },
    { name: "Protein", value: totalProtein, goal: macroGoals.protein, color: "#22c55e" },
    { name: "Fat", value: totalFat, goal: macroGoals.fat, color: "#a855f7" },
  ];

  const waterIntake = 3000;
  const waterGoal = 3000;

  // 🔹 Local meal update after saving
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-2 text-gray-300 animate-pulse">
          <Sparkles className="animate-spin w-5 h-5" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-red-400">Please log in to see your meals.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-white">My Diary</h2>
        <p className="text-gray-400 text-sm">Summary</p>
      </header>

      {/* Rings */}
      <div className="grid grid-cols-1 gap-4">
        <WaterRing intake={waterIntake} goal={waterGoal} />
        <CaloriesRing total={totalCalories} goal={calorieGoal} />
      </div>

      {/* Macros */}
      <Macros data={macroData} waterIntake={waterIntake} waterGoal={waterGoal} />

      {/* Meals */}
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