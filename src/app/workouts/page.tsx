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
  const skipCheck = searchParams.get("from") === "today";

  const [loading, setLoading] = useState(true);
  const [hasTodaysPlan, setHasTodaysPlan] = useState(false);

  const muscleGroups = [
    "Chest", "Legs", "Back", "Shoulders", "Biceps", "Triceps", "Core", "Glutes",
  ];

  useEffect(() => {
    const checkTodaysPlans = async () => {
      if (skipCheck) {
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

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-8 bg-black min-h-screen">
      <div className="space-y-1">
        {/* Suggested Section */}
        <div className="rounded-xl shadow-md mb-6">
          <SuggestionSection userId={auth.currentUser?.uid || ""} />
        </div>

        {/* Today's Workouts */}
        <Link href="/workouts/todays-workouts">
          <section className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer backdrop-blur-md">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[var(--accent-green)] rounded-full animate-pulse"></span>
              Today's Workouts
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              View your logged plans for today and keep track of progress effortlessly.
            </p>
          </section>
        </Link>
      </div>
    </div>
  );
}