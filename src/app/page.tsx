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
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [prs, setPrs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch workouts from Firestore
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

        console.log("Workouts from Firestore:", workouts);
        setPrs(calculatePRs(workouts));
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-full max-w-md">
          <Auth />
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-8 pb-20">
<div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-full max-w-md p-4 flex flex-col items-center">
  <h2 className="text-lg font-bold mb-2 flex items-center">
    {user.photoURL && (
      <img
        src={user.photoURL}
        alt={user.displayName || "Profile"}
        className="inline-block w-8 h-8 rounded-full border border-gray-600 mr-2"
      />
    )}
    Welcome back{user.displayName ? `, ${user.displayName}` : ""}!
  </h2>
  <p className="text-gray-300 mb-4 text-sm text-center">
    Track your workouts, view your progress, and achieve your goals!
  </p>
  <Link
    href="/workouts"
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow transition"
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