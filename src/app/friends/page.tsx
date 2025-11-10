"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import RequestsButton from "@/features/friends/components/RequestsButton";
import FriendsList from "@/features/friends/components/FriendsList";
import SearchFriends from "@/features/friends/components/SearchFriends";
import WorkoutPreviewModal from "@/features/friends/components/JoinWorkoutModal";
import Leaderboard from "@/features/friends/components/Leaderboard";

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [previewPlans, setPreviewPlans] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"leaderboard" | "friends" | "search">("leaderboard");

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
      {/* Top Section */}
      {loading ? (
        <div className="min-h-screen flex items-center gap-3 animate-pulse">
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--card-border)]">
        {[
          { key: "leaderboard", label: "Leaderboard" },
          { key: "friends", label: "Your Friends" },
          { key: "search", label: "Find Friends" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === tab.key
                ? "bg-[var(--surface-dark)] text-[var(--text-primary)] border-t border-l border-r border-[var(--card-border)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {user && activeTab === "leaderboard" && (
          <Leaderboard userId={user.uid} />
        )}
        {user && activeTab === "friends" && (
          <FriendsList
            userId={user.uid}
            onPreviewWorkout={(plans) => {
              setPreviewPlans(plans);
              setShowModal(true);
            }}
          />
        )}
        {user && activeTab === "search" && <SearchFriends userId={user.uid} />}
      </div>

      {/* Preview Modal */}
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