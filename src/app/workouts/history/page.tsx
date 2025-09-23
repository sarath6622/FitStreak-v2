"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import Auth from "@/components/Auth";
import WorkoutTimeline from "@/components/history/WorkoutTimeline";
import Filters from "@/components/history/Filters";
import { WorkoutSession } from "@/types";
import { calculatePRs } from "@/lib/historyUtils";
import { Sparkles } from "lucide-react";
import WorkoutProgression from "@/components/workout/history/WorkoutProgression";
import HistorySkeleton from "@/components/history/HistorySkeleton";

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutSession[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<Record<string, number>>({});
  const [lastLoggedExercise, setLastLoggedExercise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [dateRange, setDateRange] = useState<string>("14d"); // default fetch window

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (firebaseUser) {
        // initial fetch based on dateRange
        const workoutsRef = collection(db, "users", firebaseUser.uid, "workouts");
        // compute start boundary for date-based query using document id (YYYY-MM-DD)
        const now = new Date();
        let start: string | null = null;
        if (dateRange === "14d") {
          const s = new Date(now);
          s.setDate(now.getDate() - 13);
          start = s.toISOString().split("T")[0];
        } else if (dateRange === "30d") {
          const s = new Date(now);
          s.setDate(now.getDate() - 29);
          start = s.toISOString().split("T")[0];
        } else {
          start = null; // all time
        }

        const qBase = start
          ? query(
              workoutsRef,
              orderBy("__name__", "desc"),
              where("__name__", ">=", start)
            )
          : query(workoutsRef, orderBy("__name__", "desc"));

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
  }, [dateRange]);

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
    <div className="min-h-screen bg-black text-[var(--text-primary)] px-4 py-6">
      {/* ✅ Pass lastLoggedExercise here */}
      <WorkoutProgression workouts={allWorkouts} defaultExercise={lastLoggedExercise} />

      <div className="mt-6">
        <Filters
          allWorkouts={allWorkouts}
          onFilter={setFilteredWorkouts}
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="mt-6">
        <WorkoutTimeline workouts={filteredWorkouts} />
      </div>
    </div>
  );
}