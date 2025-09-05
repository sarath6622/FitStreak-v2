"use client";

import TodaysWorkouts from "@/components/TodaysWorkouts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TodaysWorkoutsPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto px-4 py-6 pt-0 space-y-6 bg-[var(--card-background)] min-h-screen text-[var(--text-primary)]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-[var(--card-background)] px-3 py-2 border-b border-[var(--card-border)] shadow-sm">
        <button
          onClick={() => router.push("/workouts?from=today")}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] py-1 px-2 rounded-full transition"
        >
          <ArrowLeft size={16} className="bg-[var(--surface-dark)]" /> Back
        </button>
      </header>

      {/* List of plans */}
      <TodaysWorkouts />
    </div>
  );
}