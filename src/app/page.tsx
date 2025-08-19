"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import PRSection from "@/components/history/PRSection";
import Auth from "@/components/Auth";
import { calculatePRs } from "@/lib/historyUtils";
import type { WorkoutSession } from "@/types";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [prs, setPrs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const workoutsRef = collection(db, "users", firebaseUser.uid, "workouts");
        const snapshot = await getDocs(workoutsRef);

        const workouts: WorkoutSession[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            date: data.date || "",
            duration: data.duration || 0,
            notes: data.notes || "",
            exercises: data.exercises || []
          };
        });

        setPrs(calculatePRs(workouts));
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md">
        <Auth />
      </div>
    </div>
  );
}

  return (
    <div className="bg-black text-white flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center px-4 pt-6 pb-16">
        {/* Welcome card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md w-full max-w-sm p-4 flex flex-col items-center">
          <h2 className="text-base font-semibold mb-2 flex items-center">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || "Profile"}
                className="inline-block w-7 h-7 rounded-full border border-gray-600 mr-2"
              />
            )}
            Welcome back{user.displayName ? `, ${user.displayName}` : ""}!
          </h2>
          <p className="text-gray-300 mb-3 text-xs text-center leading-relaxed">
            Track your workouts, view your progress, and achieve your goals!
          </p>
          <Link
            href="/workouts"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-xs shadow transition"
          >
            Start a Workout
          </Link>
        </div>

        {/* PR Section */}
        <div className="mt-6 w-full max-w-2xl">
          <PRSection prs={prs} />
        </div>
      </main>
    </div>
  );
}