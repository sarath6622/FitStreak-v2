"use client";

import TodaysWorkouts from "@/features/workout/components/TodaysWorkouts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TodaysWorkoutsPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto px-4 bg-[var(--card-background)] text-[var(--text-primary)]">
      {/* List of plans */}
      <TodaysWorkouts />
    </div>
  );
}