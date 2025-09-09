"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
    setDoc,
} from "firebase/firestore";

export default function RequestsModal({ userId, onClose }: { userId: string; onClose: () => void }) {
    const [requests, setRequests] = useState<any[]>([]);

    // ✅ Fetch live friend requests
    useEffect(() => {
        const q = query(
            collection(db, "friendRequests"),
            where("to", "==", userId),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const data = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const req = docSnap.data();
                    const userDoc = await getDoc(doc(db, "users", req.from));
                    return {
                        id: docSnap.id,
                        ...req,
                        fromUser: userDoc.exists() ? userDoc.data() : null,
                    };
                })
            );
            setRequests(data);
        });

        return () => unsubscribe();
    }, [userId]);

    async function handleAction(reqId: string, action: "accepted" | "rejected", fromId: string, toId: string) {
        // 1. Update request status
        await updateDoc(doc(db, "friendRequests", reqId), { status: action });

        if (action === "accepted") {
            // 2. Add each user to the other's friends subcollection
            await Promise.all([
                setDoc(doc(db, "users", fromId, "friends", toId), {
                    friendId: toId,
                    createdAt: new Date(),
                }),
                setDoc(doc(db, "users", toId, "friends", fromId), {
                    friendId: fromId,
                    createdAt: new Date(),
                }),
            ]);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[var(--surface-light)] rounded-xl w-96 max-h-[70vh] overflow-y-auto p-5 space-y-4">
                <h2 className="text-lg font-semibold mb-3">Friend Requests</h2>

                {requests.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No pending requests.</p>
                ) : (
                    requests.map((req) => (
                        <div
                            key={req.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-dark)] border border-[var(--card-border)]"
                        >
                            <div>
                                <p className="font-medium">@{req.fromUser?.username || "unknown"}</p>
                                <p className="text-xs text-[var(--text-muted)]">{req.fromUser?.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(req.id, "accepted", req.from, userId)}
                                    className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, "rejected", req.from, userId)}
                                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}

                <button
                    onClick={onClose}
                    className="w-full py-2 mt-4 rounded-lg bg-[var(--accent-blue)] text-white font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    );
}