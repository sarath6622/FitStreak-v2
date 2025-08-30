"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Auth from "@/components/Auth";
import WorkoutTimeline from "@/components/history/WorkoutTimeline";
import Filters from "@/components/history/Filters";
import { WorkoutSession } from "@/types";
import { calculatePRs } from "@/lib/historyUtils";
import { Sparkles } from "lucide-react";
import WorkoutProgression from "@/components/WorkoutProgression";

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutSession[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<Record<string, number>>({});
  const [lastLoggedExercise, setLastLoggedExercise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (firebaseUser) {
        const workoutsRef = collection(db, "users", firebaseUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const fetchedWorkouts: WorkoutSession[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as WorkoutSession),
        }));

        setAllWorkouts(fetchedWorkouts);
        setFilteredWorkouts(fetchedWorkouts);
        setPrs(calculatePRs(fetchedWorkouts));

        // ✅ set last logged exercise safely
        if (fetchedWorkouts.length > 0) {
          const lastExercise = fetchedWorkouts[0].exercises[0]?.name || null;
          setLastLoggedExercise(lastExercise);
        }
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Sparkles className="w-8 h-8 animate-spin text-blue-400" />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Sparkles className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* ✅ Pass lastLoggedExercise here */}
      <WorkoutProgression workouts={allWorkouts} defaultExercise={lastLoggedExercise} />

      <div className="mt-6">
        <Filters allWorkouts={allWorkouts} onFilter={setFilteredWorkouts} />
      </div>

      <div className="mt-6">
        <WorkoutTimeline workouts={filteredWorkouts} />
      </div>
    </div>
  );
}