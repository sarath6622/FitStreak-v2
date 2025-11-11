"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import Auth from "@/features/auth/components/Auth";
import WorkoutTimeline from "@/features/history/components/WorkoutTimeline";
import Filters from "@/features/history/components/Filters";
import { WorkoutSession } from "@/features/shared/types";
import { calculatePRs } from "@/features/history/utils/historyUtils";
import { Sparkles } from "lucide-react";
import WorkoutProgression from "@/features/workout/components/history/WorkoutProgression";
import HistorySkeleton from "@/features/history/components/HistorySkeleton";

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
        // Fetch ALL workout data once - let components filter independently
        const workoutsRef = collection(db, "users", firebaseUser.uid, "workouts");
        const qBase = query(workoutsRef, orderBy("__name__", "desc"));

        const snapshot = await getDocs(qBase);

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-dark)] text-[var(--text-primary)]">
        <Sparkles className="w-8 h-8 animate-spin text-[var(--accent-blue)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-dark)] text-[var(--text-primary)]">
        <div className="w-full max-w-md">
          <Auth />
        </div>
      </div>
    );
  }
  
if (loading) {
  return <HistorySkeleton />;
}

  return (
    <div className="bg-black text-[var(--text-primary)] px-4 py-4">
      <WorkoutProgression workouts={allWorkouts} defaultExercise={lastLoggedExercise} />

      <div className="mt-4">
        <Filters
          allWorkouts={allWorkouts}
          onFilter={setFilteredWorkouts}
        />
      </div>

      <div className="mt-4">
        <WorkoutTimeline workouts={filteredWorkouts} />
      </div>
    </div>
  );
}