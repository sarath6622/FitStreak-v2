"use client";

import { auth, db } from "@/firebase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SuggestionSection from "@/components/SuggestionSection/index";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function WorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipCheck = searchParams.get("from") === "today"; // 👈 detect back navigation

  const [loading, setLoading] = useState(true);
  const [hasTodaysPlan, setHasTodaysPlan] = useState(false);

  const muscleGroups = [
    "Chest", "Legs", "Back", "Shoulders", "Biceps", "Triceps", "Core", "Glutes",
  ];

  useEffect(() => {
    const checkTodaysPlans = async () => {
      if (skipCheck) {
        // user explicitly came from "today's" page, so skip redirect
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const plansRef = collection(db, "users", user.uid, "workouts", today, "plans");
      const q = query(plansRef, orderBy("createdAt", "asc"));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setHasTodaysPlan(true);
        router.replace("/workouts/todays-workouts");
        return;
      }

      setLoading(false);
    };

    checkTodaysPlans();
  }, [router, skipCheck]);

  if (loading || hasTodaysPlan) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  // 👇 Only render fallback if no plans OR if user explicitly skipped check
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-8 bg-black min-h-screen">
      <div className="space-y-1">
        {/* Suggested Section */}
        <div className="bg-gray-900 rounded-xl shadow-md mb-6">
          <SuggestionSection
            userId={auth.currentUser?.uid || ""}
          />
        </div>

        {/* Today's Workouts link */}
        <Link href="/workouts/todays-workouts">
          <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Today's Workouts
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              View your logged plans for today and keep track of progress effortlessly.
            </p>
          </section>
        </Link>

        {/* All Muscle Groups */}
        <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 backdrop-blur-md mt-6">
          <h2 className="text-lg font-semibold text-white mb-4 tracking-wide">
            All Muscle Groups
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {muscleGroups.map((group) => (
              <Link
                key={group}
                href={`/workouts/${encodeURIComponent(group)}`}
                className="bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl py-4 px-3 
                           text-sm font-medium shadow-md transition-all border border-white/10
                           hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm text-center"
              >
                {group}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}