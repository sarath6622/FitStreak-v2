"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // 👈 import useRouter
import { db } from "@/config/firebase";
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import Avatar from "@/features/friends/components/Avatar";
import { ArrowLeft } from "lucide-react";

export default function FriendProfilePage() {
  const params = useParams();
  const router = useRouter(); // 👈 router
  const friendId = params.friend as string;

  const [friend, setFriend] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!friendId) return;

    // 👤 Load friend profile
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", friendId));
      if (snap.exists()) setFriend({ id: snap.id, ...snap.data() });
    };

    // 📜 Load friend activity
    const fetchActivity = async () => {
      const q = query(
        collection(db, "users", friendId, "activity"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const acts: any[] = [];
      snapshot.forEach((doc) => acts.push({ id: doc.id, ...doc.data() }));
      setActivities(acts);
    };

    fetchProfile();
    fetchActivity();
  }, [friendId]);

  if (!friend) {
    return (
      <div className="p-6 text-white">
        <p>Loading friend profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--accent-blue)] hover:underline"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar
          id={friend.id}
          name={friend.name}
          username={friend.username}
          photoURL={friend.photoURL}
        />
        <div>
          <h1 className="text-xl font-bold">{friend.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">@{friend.username}</p>
        </div>
      </div>

      {/* Overview */}
      <div className="p-4 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)]">
        <p className="text-sm">Age: {friend.age || "N/A"}</p>
        <p className="text-sm">Goal: {friend.goal || "N/A"}</p>
        <p className="text-sm">Height: {friend.height || "N/A"} cm</p>
        <p className="text-sm">Weight: {friend.weight || "N/A"} kg</p>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg bg-[var(--surface-light)] border border-[var(--card-border)]"
              >
                <p className="text-sm">{a.type || "Did something"} </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {a.createdAt?.seconds
                    ? new Date(a.createdAt.seconds * 1000).toLocaleString()
                    : "Unknown time"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No activity yet.</p>
        )}
      </div>
    </div>
  );
}