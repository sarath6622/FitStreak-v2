"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Trophy, Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface CompletedExercise {
  setsDone: number;
  totalSets: number;
}

interface WorkoutSummaryProps {
  completedExercises: Record<string, CompletedExercise>;
  planExercises: { name: string; sets: number; muscleGroup: string }[];
  userId: string;
}

export default function ImprovedWorkoutCompletionMeter({
  completedExercises,
  planExercises,
  userId,
}: WorkoutSummaryProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEndWorkoutModal, setShowEndWorkoutModal] = useState(false);

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
    const setsCompleted = exercises.reduce(
      (sum, ex) => sum + (completedExercises[ex.name]?.setsDone || 0),
      0
    );
    const totalExerciseSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);

    return { total, done, setsCompleted, totalExerciseSets };
  };

  // Trigger confetti on workout completion
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10B981", "#3B82F6", "#8B5CF6"],
    });
  };

  // End Workout Handler
  const handleEndWorkout = async () => {
    setLoading(true);
    try {
      const muscleGroups = Array.from(
        new Set(planExercises.map((ex) => ex.muscleGroup.toLowerCase()))
      );

      const res = await fetch(
        `/api/analyze-exercise-progress?userId=${userId}&muscleGroups=${muscleGroups.join(",")}`
      );

      if (!res.ok) throw new Error("Failed to fetch summary");

      const data = await res.json();
      setSummary(data.appreciation);
      triggerConfetti();
    } catch (err) {
      console.error("[WorkoutSummary] ❌ Error ending workout:", err);
      setSummary({ summary: "⚠️ Could not fetch workout summary." });
    } finally {
      setLoading(false);
      setShowEndWorkoutModal(false);
    }
  };

  return (
    <>
      {/* Sticky Progress Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0f0f0f] via-[#111827] to-[#1f2937] border-b border-[var(--card-border)] shadow-lg">
        <div className="px-4 py-3">
          {/* Top Row - Main Progress */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Today's Workout</h3>
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

      {/* Expandable Details Below */}
      <div className="p-4 space-y-3">
        {/* Muscle Group Accordion */}
        {Object.entries(grouped).map(([muscle, exercises]) => {
          const { done, total, setsCompleted, totalExerciseSets } = getMuscleGroupProgress(
            muscle,
            exercises
          );
          const isOpen = openGroup === muscle;
          const isComplete = done === total;

          return (
            <div
              key={muscle}
              className={`border rounded-xl overflow-hidden transition-all ${
                isComplete
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-[var(--card-border)] bg-[var(--surface-dark)]"
              }`}
            >
              <button
                onClick={() => setOpenGroup(isOpen ? null : muscle)}
                className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400">
                        {done}/{total}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{muscle}</p>
                    <p className="text-xs text-gray-500">
                      {setsCompleted}/{totalExerciseSets} sets • {done}/{total} exercises
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-2 border-t border-[var(--card-border)]">
                      {exercises.map((ex) => {
                        const logged = completedExercises[ex.name];
                        const setsDone = logged?.setsDone || 0;
                        const isExComplete = setsDone >= ex.sets;

                        return (
                          <div
                            key={ex.name}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isExComplete ? "bg-green-500/10" : "bg-[var(--surface-light)]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isExComplete && (
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                              )}
                              <span
                                className={`text-sm ${
                                  isExComplete ? "text-green-400" : "text-gray-300"
                                }`}
                              >
                                {ex.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-medium ${
                                isExComplete ? "text-green-400" : "text-blue-400"
                              }`}
                            >
                              {setsDone}/{ex.sets} sets
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* End Workout Button - De-emphasized */}
        <button
          onClick={() => setShowEndWorkoutModal(true)}
          className="w-full mt-4 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-all border border-gray-700"
        >
          End Workout
        </button>

        {/* Appreciation Card */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-sm text-white space-y-3"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-white">Workout Complete!</h3>
            </div>
            <p className="text-gray-300">{summary.summary}</p>
            {summary.stats && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-gray-500">Sessions</p>
                  <p className="text-white font-semibold">{summary.stats.totalSessions}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-gray-500">Avg Sets</p>
                  <p className="text-white font-semibold">
                    {summary.stats.avgSetsPerExercise}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-gray-500">Avg Reps</p>
                  <p className="text-white font-semibold">
                    {summary.stats.avgRepsPerExercise}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-gray-500">Highlight</p>
                  <p className="text-white font-semibold text-[10px]">
                    {summary.stats.progressHighlight}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* End Workout Confirmation Modal */}
      <AnimatePresence>
        {showEndWorkoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !loading && setShowEndWorkoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">End Workout?</h3>
              <p className="text-gray-400 text-sm mb-6">
                You've completed {completedSets}/{totalSets} sets ({Math.round(progress)}%). Are
                you sure you want to end your workout?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndWorkoutModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-all disabled:opacity-50"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndWorkout}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      End
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
