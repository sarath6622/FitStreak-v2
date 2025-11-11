"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";

interface CompletedExercise {
  setsDone: number;
  totalSets: number;
}

interface WorkoutSummaryProps {
  completedExercises: Record<string, CompletedExercise>;
  planExercises: { name: string; sets: number; muscleGroup: string }[];
}

export default function ImprovedWorkoutCompletionMeter({
  completedExercises,
  planExercises,
}: WorkoutSummaryProps) {
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

  // Calculate completed exercises per muscle group
  const getMuscleGroupProgress = (muscle: string, exercises: typeof planExercises) => {
    const total = exercises.length;
    const done = exercises.filter(
      (ex) => (completedExercises[ex.name]?.setsDone || 0) >= ex.sets
    ).length;

    return { total, done };
  };

  return (
    <>
      {/* Sticky Progress Header */}
      <div className="top-0 z-30 bg-gradient-to-br from-[#0f0f0f] via-[#111827] to-[#1f2937] border-b border-[var(--card-border)] shadow-lg rounded-md">
        <div className="px-4 py-3">
          {/* Top Row - Main Progress */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Today&apos;s Workout</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-white">
                  {completedSets}
                  <span className="text-gray-400 text-lg font-normal">/{totalSets}</span>
                </span>
                <span className="text-xs text-gray-400">sets completed</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-2xl font-bold text-orange-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Progress</p>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full relative"
            >
              {progress > 15 && (
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-[10px] font-bold text-white">
                    {Math.round(progress)}%
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Muscle Groups Summary - Compact */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {Object.entries(grouped).map(([muscle, exercises]) => {
              const { done, total } = getMuscleGroupProgress(muscle, exercises);
              const isComplete = done === total;

              return (
                <div
                  key={muscle}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    isComplete
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {isComplete && <Check className="w-3 h-3" />}
                  <span>
                    {muscle} {done}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
