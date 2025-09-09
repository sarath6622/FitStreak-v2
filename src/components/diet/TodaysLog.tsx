"use client";

import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { motion, AnimatePresence } from "framer-motion";

type TimelineEntry = {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  measure: string;
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugars?: number;
  };
  consumedAt?: { seconds: number; nanoseconds: number } | null;
  mealType: string;
};

const MEAL_ORDER = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Evening Snack",
  "Dinner",
  "Other",
];

export default function TodaysLog() {
  const [user, setUser] = useState<User | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchLog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/food/get-meals?userId=${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch timeline");
        const data = await res.json();
        setTimeline(data.timeline || []);
      } catch (err) {
        console.error("[TodaysLog] ❌ Error fetching log:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [user]);

  // Group by mealType
  const grouped = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};
    timeline.forEach((entry) => {
      if (!groups[entry.mealType]) groups[entry.mealType] = [];
      groups[entry.mealType].push(entry);
    });

    // Sort within each group by time
    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => {
        const at = a.consumedAt?.seconds || 0;
        const bt = b.consumedAt?.seconds || 0;
        return at - bt;
      });
    });

    return groups;
  }, [timeline]);

  if (!user) {
    return <div className="text-red-400">⚠️ Please log in to see your diary.</div>;
  }

  if (loading) {
    return <div className="text-gray-400">⏳ Loading today’s log...</div>;
  }

  if (timeline.length === 0) {
    return (
      <div className="text-gray-400 text-center py-6">
        📝 No meals logged today.  
        <br /> Start by logging your breakfast 🍳
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#0d0f1a] rounded-2xl border border-white/10 space-y-6">
      <h3 className="text-lg font-semibold text-white">📔 Today’s Log</h3>

      {MEAL_ORDER.map((mealType) => {
        const entries = grouped[mealType] || [];
        if (entries.length === 0) return null;

        // Totals for the meal
        const totals = entries.reduce(
          (acc, e) => {
            acc.calories += e.nutrients.calories || 0;
            acc.protein += e.nutrients.protein || 0;
            acc.carbs += e.nutrients.carbs || 0;
            acc.fat += e.nutrients.fat || 0;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return (
          <div key={mealType} className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <h4 className="text-md font-medium text-white">
                {mealType}
              </h4>
              <p className="text-sm text-gray-400">
                {totals.calories} kcal • P {totals.protein}g • C {totals.carbs}g • F {totals.fat}g
              </p>
            </div>

            {/* Entries */}
            <ul className="space-y-2">
              <AnimatePresence>
                {entries.map((entry) => {
                  const time = entry.consumedAt?.seconds
                    ? new Date(entry.consumedAt.seconds * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--";

                  return (
                    <motion.li
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)] flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white font-medium">{entry.foodName}</p>
                        <p className="text-sm text-gray-400">
                          {entry.quantity} {entry.measure.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500">⏰ {time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">{entry.nutrients.calories} kcal</p>
                        <p className="text-xs text-gray-400">
                          P {entry.nutrients.protein}g • C {entry.nutrients.carbs}g • F {entry.nutrients.fat}g
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        );
      })}
    </div>
  );
}