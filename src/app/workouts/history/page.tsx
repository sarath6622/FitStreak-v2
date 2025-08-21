"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Auth from "@/components/Auth";
import WorkoutTimeline from "@/components/history/WorkoutTimeline";
import SummaryCards from "@/components/history/SummaryCards";
import PRHighlights from "@/components/history/PRHighlights";
import Filters from "@/components/history/Filters";
import { WorkoutSession } from "@/types";
import { calculatePRs } from "@/lib/historyUtils";

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const workoutsRef = collection(db, "users", firebaseUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const fetchedWorkouts: WorkoutSession[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as WorkoutSession),
        }));

        setWorkouts(fetchedWorkouts);
        console.log("Fetched workouts:", fetchedWorkouts);
        
        setPrs(calculatePRs(fetchedWorkouts));
      }

      setLoading(false);
    });

    return unsub;
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
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Workout History</h1>

      {/* Summary Cards */}
      <SummaryCards workouts={workouts} />

      {/* PR Highlights */}
      <div className="mt-6">
        <PRHighlights prs={prs} />
      </div>

      {/* Filters */}
      <div className="mt-6">
        <Filters workouts={workouts} onFilter={(filtered) => setWorkouts(filtered)} />
      </div>

      {/* Workout Timeline */}
      <div className="mt-6">
        <WorkoutTimeline workouts={workouts} />
      </div>
    </div>
  );
}