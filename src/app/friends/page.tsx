"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import RequestsButton from "@/components/friends/RequestsButton";
import FriendsList from "@/components/friends/FriendsList";
import SearchFriends from "@/components/friends/SearchFriends";
import WorkoutPreviewModal from "@/components/friends/JoinWorkoutModal";

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [previewPlans, setPreviewPlans] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // ✅ Watch auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 space-y-6 text-white">
      {/* Top: Friend Code + Requests */}
      {loading ? (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="flex-1 h-12 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)]" />
          <div className="h-12 w-12 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)]" />
        </div>
      ) : (
        user &&
        profile && (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">Your Friend Code</span>
              <span className="text-sm font-mono">@{profile.username}</span>
            </div>
            <RequestsButton userId={user.uid} />
          </div>
        )
      )}

      {/* Friends List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)]"
            />
          ))}
        </div>
      ) : (
        user && (
          <FriendsList
            userId={user.uid}
            onPreviewWorkout={(plans) => {
              console.log("📝 Previewing plans:", plans);
              setPreviewPlans(plans);
              setShowModal(true);
            }}
          />
        )
      )}

      {/* Search Friends */}
      {loading ? (
        <div className="h-12 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)] animate-pulse" />
      ) : (
        user && <SearchFriends userId={user.uid} />
      )}

      {/* Workout Preview Modal */}
      {showModal && (
        <WorkoutPreviewModal
          userId={user.uid}
          plans={previewPlans}
          onClose={() => {
            setShowModal(false);
            setPreviewPlans([]);
          }}
        />
      )}
    </div>
  );
}