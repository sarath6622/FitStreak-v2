"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ExerciseSkeleton() {
  return (
    <div className="rounded-xl p-3 bg-[var(--card-background)] border border-[var(--card-border)] shadow-sm space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
      <div className="flex gap-1">
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}