"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CompletedExercise {
  setsDone: number;
  totalSets: number;
}

interface WorkoutSummaryProps {
  completedExercises: Record<string, CompletedExercise>;
  planExercises: { name: string; sets: number; muscleGroup: string }[];
}

export default function WorkoutSummary({
  completedExercises,
  planExercises,
}: WorkoutSummaryProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // ✅ Total sets across all exercises
  const totalSets = useMemo(
    () => planExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0),
    [planExercises]
  );

  // ✅ Completed sets across all exercises
  const completedSets = useMemo(() => {
    return Object.values(completedExercises).reduce(
      (sum, ex) => sum + (ex.setsDone || 0),
      0
    );
  }, [completedExercises]);

  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // ✅ Group exercises by muscleGroup
  const grouped = useMemo(() => {
    return planExercises.reduce((acc, ex) => {
      if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = [];
      acc[ex.muscleGroup].push(ex);
      return acc;
    }, {} as Record<string, typeof planExercises>);
  }, [planExercises]);

  return (
<div
  className="bg-gradient-to-br from-[#0f0f0f] via-[#111827] to-[#1f2937] 
             border border-[var(--card-border)] rounded-xl p-3 space-y-4"
>
      {/* Overall completion */}
      <div>
        <div className="flex justify-between text-sm text-[var(--text-muted)] mb-1">
          <span>Workout Completion</span>
          <span>
            {completedSets}/{totalSets} sets
          </span>
        </div>

        <div className="w-full bg-[var(--surface-light)]/40 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-full"
          />
        </div>

        <div className="text-right text-xs text-[var(--text-muted)] mt-1">
          {Math.round(progress)}% completed
        </div>
      </div>

      {/* Accordion summary (collapsed by default) */}
      <div className="space-y-2">
        {Object.entries(grouped).map(([muscle, exercises]) => {
          const total = exercises.length;
          const done = exercises.filter(
            (ex) => (completedExercises[ex.name]?.setsDone || 0) >= ex.sets
          ).length;

          const isOpen = openGroup === muscle;

          return (
            <div
              key={muscle}
              className="border border-[var(--card-border)] rounded-lg"
            >
              <button
                onClick={() => setOpenGroup(isOpen ? null : muscle)}
                className="w-full flex justify-between items-center px-3 py-2 text-sm font-medium text-white"
              >
                <span>
                  {muscle} – {done}/{total} exercises completed
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-2 space-y-1">
                  {exercises.map((ex) => {
                    const logged = completedExercises[ex.name];
                    const fullyDone = logged && logged.setsDone >= ex.sets;
                    return (
                      <div
                        key={ex.name}
                        className="flex justify-between text-sm text-[var(--text-muted)]"
                      >
                        <span>{ex.name}</span>
                        <span className={fullyDone ? "text-green-400" : ""}>
                          {logged?.setsDone || 0}/{ex.sets} sets
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}