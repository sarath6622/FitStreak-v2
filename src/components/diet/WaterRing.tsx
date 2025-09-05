"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { Plus } from "lucide-react";
import WaterLogModal from "./WaterLogModal";
import { toast, useSonner } from "sonner";

interface Props {
  goal: number;   // total ml goal
  stepMl?: number; // default glass size
  className?: string;
}

export default function WaterGlassesCard({
  goal,
  stepMl,
  className = "",
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const glassSize = stepMl ?? 250;
  const totalGlasses = Math.ceil(goal / glassSize);

  // 🔹 Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔹 Fetch today's water intake from API
  useEffect(() => {
    if (!user) return;

    const fetchWater = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/food/get-water?userId=${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch water intake");
        const data = await res.json();
        setIntake(data.total ?? 0);
      } catch (err) {
        console.error("[WaterGlassesCard] ❌ Error fetching water:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWater();
  }, [user]);

  // 🔹 Log new water entry
  const handleLog = async (amount: number) => {
    if (!user) return;

    try {
      const res = await fetch("/api/food/save-water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, amount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save water");
      }

      // ✅ Optimistically update UI
      setIntake((prev) => prev + amount);
      toast.success(`Logged ${amount}ml water`);
    } catch (err) {
      console.error("[WaterGlassesCard] ❌ Error saving water:", err);
    }
  };

  if (!user) {
    return (
      <div className="p-4 rounded-xl border border-gray-800 text-red-400">
        Please log in to track water.
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-[var(--card-background)] backdrop-blur-md rounded-2xl p-4 border border-gray-800 text-white w-full flex flex-col gap-3 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm">Water</p>
          <p className="text-xs text-gray-400">
            {loading ? "..." : `${intake}/${goal} ml`}
          </p>
        </div>

        {/* Glasses row */}
        <div className="flex items-end gap-2 w-full">
          {Array.from({ length: totalGlasses }).map((_, i) => {
            const start = i * glassSize;
            const filled = Math.min(Math.max(intake - start, 0), glassSize);
            const fillPct = filled / glassSize;

            return (
              <div
                key={i}
                className="flex-1 h-12 relative flex items-end justify-center"
              >
                <div className="w-full h-full rounded-lg border-1 bg-[var(--surface-dark)] overflow-hidden relative">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                    style={{ height: `${fillPct * 100}%` }}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}

          {/* ➕ button */}
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Log water intake"
            className="w-12 h-12 rounded-full border-2 border-transparent 
             bg-blue-500
             flex items-center justify-center text-white 
             shadow-lg shadow-blue-500/40 hover:scale-105 
             transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <WaterLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLog={(amount) => {
          handleLog(amount);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}