"use client";

import TodaysWorkouts from "@/components/TodaysWorkouts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TodaysWorkoutsPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto px-4 py-6 pt-0 space-y-6 bg-black min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-[var(--surface-dark)] px-3 py-2 border-b border-[var(--card-border)] shadow-sm">
        <button
          // 👇 add query param to skip redirect check
          onClick={() => router.push("/workouts?from=today")}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] py-1 px-2 rounded-full transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      {/* List of plans */}
      <TodaysWorkouts />
    </div>
  );
}