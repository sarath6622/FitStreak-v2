"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import WorkoutGroup from "./WorkoutGroup";
import { Exercise } from "@/types";

interface WorkoutPlan {
  id: string;
  muscleGroup: string;
  exercises: Exercise[];
}

export default function TodaysWorkouts() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const plansRef = collection(
        db,
        "users",
        user.uid,
        "workouts",
        today,
        "plans"
      );

      // Order by createdAt so the newest plan shows last
      const q = query(plansRef, orderBy("createdAt", "asc"));
      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          createdAt: d.createdAt?.toDate
            ? d.createdAt.toDate().toISOString()
            : null,
        };
      });

      setPlans(data);
      setLoading(false);
    };

    fetchPlans();
  }, []);  

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <WorkoutGroup key={plan.id} plan={plan} />
      ))}
    </div>
  );
}