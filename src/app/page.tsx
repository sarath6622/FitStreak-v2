"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PRSection from "@/components/history/PRSection";
import Auth from "@/components/Auth";
import workoutData from "@/data/workoutHistory.json";
import { getPRs } from "@/lib/historyUtils";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const prs = getPRs(workoutData);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  // If user is not logged in, show only the Auth component (no Navbar)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-full max-w-md">
          <Auth />
        </div>
      </div>
    );
  }

  // User is logged in: show Navbar and dashboard
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-8 pb-20">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-full max-w-2xl p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-2">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || "Profile"}
                className="inline-block w-10 h-10 rounded-full border border-gray-600 mr-2 align-middle"
              />
            )}
            Welcome back{user.displayName ? `, ${user.displayName}` : ""}!
          </h2>
          <p className="text-gray-300 mb-6">
            Track your workouts, view your progress, and achieve your goals!
          </p>
          <Link
            href="/workouts"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow transition"
          >
            Start a Workout
          </Link>
        </div>

        <div className="mt-10 w-full max-w-2xl">
          <PRSection prs={prs} />
        </div>
      </main>
    </div>
  );
}
