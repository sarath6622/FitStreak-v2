"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
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
          const data = fsnap.data();
          // Check if friend has a workout PLANS doc for TODAY
          const today = new Date().toISOString().split("T")[0];
          const plansSnap = await getDocs(collection(db, "users", friendId, "workouts", today, "plans"));
          friendProfiles.push({
            id: fsnap.id,
            name: data.name,
            username: data.username,
            photoURL: data.photoURL,
            hasWorkoutPlan: Boolean(data.workoutsThisWeek || data.currentStreak), // ✅ infer flag
            hasWorkoutToday: !plansSnap.empty,
          });
        }
      }

      setFriends(friendProfiles);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Friends */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Friends</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)]"
              />
            ))}
          </div>
        ) : friends.length > 0 ? (
          friends.map((f) => (
            <FriendCard
              key={f.id}
              user={f}
              onJoinWorkout={async (id) => {
                const today = new Date().toISOString().split("T")[0];
                const plansCol = collection(db, "users", id, "workouts", today, "plans");
                const plansSnap = await getDocs(plansCol);
                const plans = plansSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                onPreviewWorkout(plans);
              }}
            />
          ))
        ) : (
          <p className="text-sm text-[var(--text-muted)]">You don’t have any friends yet.</p>
        )}
      </div>
    </div>
  );
}