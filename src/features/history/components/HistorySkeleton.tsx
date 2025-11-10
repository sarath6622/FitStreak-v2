// components/history/HistorySkeleton.tsx
"use client";

export default function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-[var(--surface-dark)] text-[var(--text-primary)] px-4 py-6 animate-pulse space-y-6">
      {/* Progression Chart Placeholder */}
      <div className="h-52 w-full rounded-xl bg-[var(--surface-light)]" />

      {/* Filters Placeholder */}
      <div className="h-10 w-full rounded-md bg-[var(--surface-light)]" />

      {/* Timeline Placeholder */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 w-full rounded-xl bg-[var(--surface-light)]"
          />
        ))}
      </div>
    </div>
  );
}