"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Users } from "lucide-react";
import RequestsModal from "./RequestsModal";

export default function RequestsButton({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  // ✅ Live count of pending requests
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", userId),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)]"
      >
        <Users size={18} />
        <span>Requests</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </button>

      {open && <RequestsModal userId={userId} onClose={() => setOpen(false)} />}
    </>
  );
}