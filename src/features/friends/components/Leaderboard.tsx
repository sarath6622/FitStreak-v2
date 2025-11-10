"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Flame, Crown } from "lucide-react";

type LeaderboardProps = {
  userId: string;
};

type Friend = {
  id: string;
  name?: string;
  username?: string;
  streak?: number;
  pushups?: number;
  pullups?: number;
  currentStreak?: number;
  longestStreak?: number;
};

export default function Leaderboard({ userId }: LeaderboardProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"streak" | "pushups" | "pullups">(
    "streak"
  );

  function getInitials(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (
      (parts[0][0] || "").toUpperCase() +
      (parts[parts.length - 1][0] || "").toUpperCase()
    );
  }

  function getGradient(idx: number) {
    if (idx === 0) return "from-yellow-400 to-yellow-600"; // gold
    if (idx === 1) return "from-gray-300 to-gray-500"; // silver
    if (idx === 2) return "from-amber-600 to-amber-800"; // bronze

    const colors = [
      "from-pink-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
      "from-blue-500 to-cyan-500",
    ];
    return colors[idx % colors.length];
  }

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);

        // fetch user doc
        const snap = await getDoc(doc(db, "users", userId));
        if (!snap.exists()) {
          setFriends([]);
          setLoading(false);
          return;
        }

        // include the current user
        const currentUser: Friend = { id: userId, ...snap.data() } as Friend;

        // fetch subcollection "friends"
        const friendsCol = collection(db, "users", userId, "friends");
        const friendsSnap = await getDocs(friendsCol);

        const friendIds = friendsSnap.docs.map((d) => d.data().friendId);

        const friendDocs = await Promise.all(
          friendIds.map(async (fid) => {
            const fSnap = await getDoc(doc(db, "users", fid));
            if (fSnap.exists()) {
              return { id: fid, ...fSnap.data() } as Friend;
            }

            return null;
          })
        );

        const validFriends: Friend[] = friendDocs.filter(
          (f): f is Friend => f !== null
        );

        // combine you + your friends
        const leaderboard = [currentUser, ...validFriends];

        // sort leaderboard
        leaderboard.sort((a, b) => {
          const valA =
            (metric === "streak"
              ? a.streak ?? a.currentStreak ?? a.longestStreak
              : a[metric]) ?? 0;
          const valB =
            (metric === "streak"
              ? b.streak ?? b.currentStreak ?? b.longestStreak
              : b[metric]) ?? 0;
          return valB - valA;
        });

        setFriends(leaderboard);
      } catch (err) {
        console.error("🔥 Error fetching friends:", err);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId, metric]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Leaderboard
        </h2>
        <select
          value={metric}
          onChange={(e) =>
            setMetric(e.target.value as "streak" | "pushups" | "pullups")
          }

          className="bg-[var(--surface-dark)] border border-[var(--card-border)] rounded-md px-2 py-1 text-sm text-[var(--text-primary)]"
        >
          <option value="streak">🔥 Streak</option>
          <option value="pushups">💪 Pushups</option>
          <option value="pullups">🏋️ Pullups</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)] mt-2">Loading…</p>
      ) : friends.length > 0 ? (
        <div className="mt-3 space-y-2">
          {friends.map((f, idx) => {
            const isYou = f.id === userId;

            return (
              <div
                key={f.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition ${
                  isYou
                    ? "bg-indigo-900/40 border-indigo-500/60 shadow-lg"
                    : "bg-[var(--surface-dark)] border-[var(--card-border)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* rank */}
                  <span className="text-sm font-bold text-[var(--text-muted)] w-6">
                    #{idx + 1}
                  </span>

                  {/* avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br ${getGradient(
                      idx
                    )}`}
                  >
                    {getInitials(f.name)}
                  </div>

                  {/* user info */}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {f.name || "Unknown"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      @{f.username}
                    </p>
                  </div>
                </div>

                {/* score */}
                <div className="flex items-center gap-1">
                  {metric === "streak" && (
                    <Flame className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-base font-bold text-green-500">
                    {f[metric] || f.currentStreak || f.longestStreak || 0}
                  </span>

                  {/* 👑 crown for rank #1 */}
                  {idx === 0 && (
                    <Crown className="w-4 h-4 text-yellow-400 ml-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)] mt-2">
          No leaderboard data yet.
        </p>
      )}
    </div>
  );
}