"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import FriendCard from "./FriendCard";

type FriendsSectionProps = {
  friends: any[];
  loading: boolean;
  onPreviewWorkout: (plans: any[]) => void;
};

export default function FriendsSection({
  friends,
  loading,
  onPreviewWorkout,
}: FriendsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Friendssss</h2>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)] shadow-sm"
            />
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