"use client";

import { CheckCircle2 } from "lucide-react";
import { Exercise } from "@/features/shared/types";

interface CompletedExercise {
  setsDone: number;
  repsDone: number;
  totalSets: number;
}

export default function ExerciseCard({
  exercise,
  selected,
  onSelect,
  completedData,
}: {
  exercise: Exercise;
  selected: boolean;
  onSelect: () => void;
  completedData?: CompletedExercise;
}) {
  const progress =
    completedData && exercise.sets > 0
      ? Math.min(100, Math.round((completedData.setsDone / exercise.sets) * 100))
      : 0;

  const secondary = exercise.secondaryMuscleGroups ?? [];
  const equipment = exercise.equipment ?? [];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative w-full rounded-xl p-3 text-[var(--text-primary)] text-left transition-all
        bg-black backdrop-blur-md border border-[var(--card-border)] shadow-sm
        hover:border-[var(--accent-yellow)]/70 hover:shadow-[0_0_8px_rgba(250,204,21,0.25)]
        ${selected ? "border-[var(--accent-yellow)] shadow-[0_0_8px_rgba(250,204,21,0.4)] scale-[1.01]" : ""}
        focus:outline-none focus:ring-1 focus:ring-[var(--accent-yellow)]/40 flex flex-col gap-1.5
      `}
    >
      {/* Top Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm">{exercise.name}</span>
          <span className="px-1.5 py-0.5 text-[var(--accent-yellow)] bg-[var(--card-background)] rounded-md text-[10px] font-medium">
            {exercise.sets} × {exercise.reps}
          </span>
        </div>
        {progress === 100 && (
          <CheckCircle2 size={14} className="text-[var(--accent-green)]" />
        )}
      </div>

      {/* Sub Info */}
      <div className="text-[11px] text-[var(--text-muted)] truncate">
        {exercise.muscleGroup} • {exercise.subGroup} • {exercise.movementType}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 text-[10px] mt-0.5">
        <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-blue)]/10 text-[var(--text-muted)]">
          {exercise.difficulty}
        </span>
        {secondary.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-purple)]/10 text-[var(--text-muted)]">
            {secondary.join(", ")}
          </span>
        )}
        {equipment.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-orange)]/10 text-[var(--text-muted)]">
            {equipment.join(", ")}
          </span>
        )}
      </div>

      {/* Progress */}
      {completedData && (
        <div className="mt-0.5">
          <div className="w-full bg-[var(--surface-light)]/60 rounded-full h-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-green)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
            {completedData.setsDone}/{exercise.sets} sets
          </div>
        </div>
      )}
    </button>
  );
}