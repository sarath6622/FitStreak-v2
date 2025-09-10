"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import FriendCard from "./FriendCard";

export default function FriendsList({
  userId,
  onPreviewWorkout,
}: {
  userId: string;
  onPreviewWorkout: (plans: any[]) => void;
}) {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const friendsRef = collection(db, "users", userId, "friends");
    const unsub = onSnapshot(friendsRef, async (snapshot) => {
      setLoading(true);
      const friendProfiles: any[] = [];

      for (const f of snapshot.docs) {
        const friendId = f.id;
        const fsnap = await getDoc(doc(db, "users", friendId));

        if (fsnap.exists()) {
          let hasWorkoutPlan = false;
          const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

          // 🔎 First, check today's plans directly
          const todayPlansRef = collection(
            db,
            "users",
            friendId,
            "workouts",
            today,
            "plans"
          );
          const todayPlansSnap = await getDocs(todayPlansRef);

          if (!todayPlansSnap.empty) {
            hasWorkoutPlan = true;
          } else {
            // 🔎 Fallback: latest workout
            const workoutsRef = collection(db, "users", friendId, "workouts");
            const workoutSnap = await getDocs(workoutsRef);

            if (!workoutSnap.empty) {
              const latestWorkout = workoutSnap.docs.sort((a, b) =>
                a.id > b.id ? -1 : 1
              )[0];

              const plansSnap = await getDocs(
                collection(latestWorkout.ref, "plans")
              );
              hasWorkoutPlan = !plansSnap.empty;
            }
          }

          friendProfiles.push({
            id: fsnap.id,
            ...fsnap.data(),
            hasWorkoutPlan,
          });
        }
      }

      setFriends(friendProfiles);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Your Friends
      </h2>

      {loading ? (
        // Skeleton loader
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)] shadow-sm"
            >
              <div className="h-full w-full flex items-center px-4 gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-[var(--surface-hover)]" />
                  <div className="h-3 w-16 rounded bg-[var(--surface-hover)]" />
                </div>
                <div className="w-14 h-6 rounded bg-[var(--surface-hover)]" />
              </div>
            </div>
          ))}
        </div>
      ) : friends.length > 0 ? (
        friends.map((f) => (
          <FriendCard
            key={f.id}
            user={f}
            onJoinWorkout={async (friendId) => {
              const today = new Date().toISOString().split("T")[0];
              let plans: any[] = [];

              // 1️⃣ Try today's workout
              const todayPlansRef = collection(
                db,
                "users",
                friendId,
                "workouts",
                today,
                "plans"
              );
              const todayPlansSnap = await getDocs(todayPlansRef);

              if (!todayPlansSnap.empty) {
                plans = todayPlansSnap.docs.map((d) => ({
                  id: d.id,
                  ...d.data(),
                }));
              } else {
                // 2️⃣ Fallback: latest workout
                const workoutsRef = collection(db, "users", friendId, "workouts");
                const workoutSnap = await getDocs(workoutsRef);

                if (!workoutSnap.empty) {
                  const latestWorkout = workoutSnap.docs.sort((a, b) =>
                    a.id > b.id ? -1 : 1
                  )[0];

                  const plansSnap = await getDocs(
                    collection(latestWorkout.ref, "plans")
                  );
                  plans = plansSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                }
              }

              if (plans.length > 0) {
                onPreviewWorkout(plans);
              } else {
                alert("❌ No workout plans found for this friend.");
              }
            }}
          />
        ))
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          You don’t have any friends yet.
        </p>
      )}
    </div>
  );
}