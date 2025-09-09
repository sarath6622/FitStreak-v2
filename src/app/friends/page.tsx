"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import FriendCard from "@/components/friends/FriendCard";
import RequestsButton from "@/components/friends/RequestsButton";

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("username", ">=", searchTerm.toLowerCase()),
        where("username", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );
      const snapshot = await getDocs(q);
      const results: any[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id !== user?.uid) {
          results.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(targetId: string) {
    if (!user) return;
    await setDoc(doc(db, "friendRequests", `${user.uid}_${targetId}`), {
      from: user.uid,
      to: targetId,
      status: "pending",
      createdAt: new Date(),
    });
    alert("✅ Friend request sent!");
  }

  return (
    <div className="p-4 space-y-6 text-white">

      {user && profile && (
<div className="flex items-center gap-3">
  {/* Friend Code */}
  {user && profile && (
<div className="flex-1 p-3 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)] flex items-center justify-between">
  <span className="text-xs text-[var(--text-muted)]">Your Friend Code</span>
  <span className="text-sm font-mono">@{profile.username}</span>
</div>
  )}

  {/* Requests Button */}
  {user && <RequestsButton userId={user.uid} />}
</div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)] px-3 py-2 text-sm focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-green)] rounded-lg font-medium"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="space-y-3">
        {searchResults.map((u) => (
          <FriendCard key={u.id} user={u} onAdd={sendFriendRequest} />
        ))}

        {searchResults.length === 0 && !loading && (
          <p className="text-sm text-[var(--text-muted)]">No users found.</p>
        )}
      </div>
    </div>
  );
}