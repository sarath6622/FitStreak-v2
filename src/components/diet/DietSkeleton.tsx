// components/diet/DietSkeleton.tsx
"use client";

export default function DietSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-5 w-32 bg-[var(--surface-light)] rounded-md mb-2" />
        <div className="h-3 w-20 bg-[var(--surface-light)] rounded-md" />
      </div>

      {/* Rings */}
      <div className="grid grid-cols-1 gap-4">
        <div className="h-32 bg-[var(--surface-light)] rounded-xl" />
        <div className="h-32 bg-[var(--surface-light)] rounded-xl" />
      </div>

      {/* Macros */}
      <div className="h-24 bg-[var(--surface-light)] rounded-xl" />

      {/* Meals */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-[var(--surface-light)] rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}