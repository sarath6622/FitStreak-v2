"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import PRSection from "@/components/history/PRSection";
import Auth from "@/components/Auth";
import { calculatePRs } from "@/lib/historyUtils";
import type { WorkoutSession } from "@/types";
import type { UserProfile } from "@/types/UserProfile";
import { Sparkles } from "lucide-react";
import WorkoutCalendar from "@/components/WorkoutCalendar";
import StreakTracker from "@/components/StreakTracker";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [prs, setPrs] = useState<Record<string, number>>({});
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [weeklyFrequency, setWeeklyFrequency] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // ✅ Fetch workouts
        const workoutsRef = collection(db, "users", firebaseUser.uid, "workouts");
        const snapshot = await getDocs(workoutsRef);

        const workoutData: WorkoutSession[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            date: data.date || "",
            duration: data.duration || 0,
            notes: data.notes || "",
            exercises: data.exercises || [],
          };
        });

        setWorkouts(workoutData);
        setPrs(calculatePRs(workoutData));

        // ✅ Fetch profile (for weeklyFrequency)
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setWeeklyFrequency(profile.weeklyFrequency ?? null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--text-primary)]">
        <div className="w-full max-w-md">
          <Auth />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-[var(--text-primary)] flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center px-4 pt-6 pb-8">
        {/* Welcome card */}
        <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-xl shadow-md w-full max-w-sm p-3 flex flex-col items-center text-center space-y-2">
          {/* Avatar */}
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || "Profile"}
              className="w-10 h-10 rounded-full ring-1 ring-purple-500/70 shadow"
            />
          )}

          {/* Title */}
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            Welcome{user.displayName ? `, ${user.displayName}` : ""}!
          </h2>

          {/* CTA */}
          <Link
            href="/workouts"
            className="bg-[var(--card-background)] hover:opacity-90  text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-xs shadow transition-all"
          >
            Start Workout
          </Link>
        </div>

        {/* Streak Tracker */}
        <div className="mt-6 w-full max-w-2xl">
          <StreakTracker />
        </div>

        {/* Workout Calendar */}
        <div className="mt-6 w-full max-w-2xl">
          <WorkoutCalendar workouts={workouts} />
        </div>

        {/* PR Section */}
        <div className="mt-6 w-full max-w-2xl">
          <PRSection prs={prs} />
        </div>
      </main>
    </div>
  );
}