"use client";

import TodaysWorkouts from "@/components/workout/TodaysWorkouts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TodaysWorkoutsPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto px-4 py-6 pt-0 space-y-6 bg-[var(--card-background)] min-h-screen text-[var(--text-primary)]">

      {/* List of plans */}
      <TodaysWorkouts />
    </div>
  );
}