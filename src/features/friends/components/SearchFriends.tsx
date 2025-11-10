"use client";

import { useState } from "react";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import FriendCard from "./FriendCard";

export default function SearchFriends({ userId }: { userId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        if (docSnap.id !== userId) {
          results.push({ id: docSnap.id, ...docSnap.data() });
        }
      });
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(targetId: string) {
    await setDoc(doc(db, "friendRequests", `${userId}_${targetId}`), {
      from: userId,
      to: targetId,
      status: "pending",
      createdAt: new Date(),
    });
    alert("✅ Friend request sent!");
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Find Friends</h2>
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

      <div className="space-y-3 mt-3">
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