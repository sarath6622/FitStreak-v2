"use client";

interface WorkoutPlanListCardProps {
  exercises: { name: string; sets: number }[];
}

export default function WorkoutPlanListCard({ exercises }: WorkoutPlanListCardProps) {
  return (
    <div className="p-4 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)] shadow-sm">
      {exercises?.length > 0 ? (
        <ul className="space-y-2">
          {exercises.map((ex, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg 
                         bg-[var(--surface-light)] border border-[var(--card-border)]"
            >
              <span className="text-[var(--text-primary)] font-medium">{ex.name}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {ex.sets ?? 0} sets
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--text-muted)] italic">
          No exercises in this plan.
        </p>
      )}
    </div>
  );
}