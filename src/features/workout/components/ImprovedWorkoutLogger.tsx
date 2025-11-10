"use client";

import { Save, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  upsertWorkout,
  getWorkoutForExercise,
  getLastWorkoutForExercise,
} from "@/features/shared/services/workoutService";
import { auth } from "@/config/firebase";
import { toast } from "sonner";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface Exercise {
  name: string;
  muscleGroup: string;
  sets?: number;
  reps?: string;
  defaultWeight?: number;
  notes?: string;
}

type SetEntry = {
  weight: number;
  reps: number;
  done: boolean;
  placeholderWeight?: number;
  placeholderReps?: number;
};

interface LastWorkoutData {
  sets: number;
  weight: number[];
  repsPerSet: number[];
  date?: string;
}

export default function ImprovedWorkoutLogger({
  exercise,
  exerciseId,
  onClose,
  onWorkoutSaved,
}: {
  exercise: Exercise;
  exerciseId: string;
  onClose: () => void;
  onWorkoutSaved: (data: { sets: { weight: number; reps: number; done: boolean }[] }) => void;
}) {
  const parseReps = (val?: string): number => {
    if (!val) return 0;
    const trimmed = String(val).trim();
    return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : 0;
  };

  const [setsCount, setSetsCount] = useState<number>(exercise.sets ?? 4);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [rest, setRest] = useState(90);
  const [duration, setDuration] = useState(45);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastWorkout, setLastWorkout] = useState<LastWorkoutData | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);

  const placeholdersRef = useRef<{ weight: number[]; reps: number[] }>({ weight: [], reps: [] });
  const modalRef = useRef<HTMLDivElement>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress
  const completedSetsCount = sets.filter((s) => s.done).length;
  const progress = setsCount > 0 ? (completedSetsCount / setsCount) * 100 : 0;

  // Rest timer logic
  useEffect(() => {
    if (restTimerActive && restTimeLeft > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setRestTimerActive(false);
            toast.success("Rest complete! 💪");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [restTimerActive, restTimeLeft]);

  // Fetch existing data
  useEffect(() => {
    const fetchExistingData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const [todayData, lastData] = await Promise.all([
        getWorkoutForExercise(user.uid, today, exerciseId),
        getLastWorkoutForExercise(user.uid, exerciseId),
      ]);

      const exToday = todayData?.exercise;
      const exLast = lastData?.exercise;

      // Debug logging
      console.log("[ImprovedWorkoutLogger] Today's date:", today);
      console.log("[ImprovedWorkoutLogger] Exercise ID:", exerciseId);
      console.log("[ImprovedWorkoutLogger] Today's data:", exToday);
      console.log("[ImprovedWorkoutLogger] Last workout data:", exLast);

      // Store last workout data for display
      if (exLast && exLast.weight && exLast.repsPerSet) {
        setLastWorkout({
          sets: exLast.sets || 0,
          weight: exLast.weight,
          repsPerSet: exLast.repsPerSet,
          date: lastData?.date,
        });
      }

      const initialCount = Math.max(
        exToday?.sets ?? 0,
        exercise.sets ?? 0,
        exLast?.sets ?? 0,
        4
      );

      const aiWeight = exercise.defaultWeight ?? 0;
      const aiReps = parseReps(exercise.reps);

      const placeholderWeightArr: number[] = [];
      const placeholderRepsArr: number[] = [];

      for (let i = 0; i < initialCount; i++) {
        const lastW = exLast?.weight?.[i] ?? 0;
        const lastR = exLast?.repsPerSet?.[i] ?? 0;

        placeholderWeightArr[i] = aiWeight || lastW || 0;
        placeholderRepsArr[i] = aiReps || lastR || 0;
      }

      placeholdersRef.current = {
        weight: placeholderWeightArr,
        reps: placeholderRepsArr,
      };

      const nextSets: SetEntry[] = [];
      for (let i = 0; i < initialCount; i++) {
        const loggedW = exToday?.weight?.[i];
        const loggedR = exToday?.repsPerSet?.[i];
        const loggedDone = exToday?.doneFlags?.[i] ?? false;

        // Only pre-fill weight/reps if the set was explicitly marked as done
        // This prevents showing old data that wasn't actually completed
        const shouldPreFill = loggedDone || (typeof loggedW === "number" && loggedW > 0 && typeof loggedR === "number" && loggedR > 0);

        nextSets.push({
          weight: shouldPreFill && typeof loggedW === "number" && loggedW > 0 ? loggedW : 0,
          reps: shouldPreFill && typeof loggedR === "number" && loggedR > 0 ? loggedR : 0,
          done: !!loggedDone,
          placeholderWeight: placeholderWeightArr[i],
          placeholderReps: placeholderRepsArr[i],
        });
      }

      setSetsCount(initialCount);
      setSets(nextSets);
      setDuration(todayData?.duration || 45);
      setRest(todayData?.rest || 90);
      setLoading(false);
    };

    fetchExistingData();
  }, [exercise.name, exercise.defaultWeight, exercise.reps, exercise.sets, exerciseId]);

  // Keep arrays in sync when user changes sets count
  useEffect(() => {
    setSets((prev) => {
      const arr = [...prev];

      if (setsCount > arr.length) {
        for (let i = arr.length; i < setsCount; i++) {
          const phW = placeholdersRef.current.weight[i] ?? (exercise.defaultWeight ?? 0);
          const phR = placeholdersRef.current.reps[i] ?? parseReps(exercise.reps);

          placeholdersRef.current.weight[i] = phW;
          placeholdersRef.current.reps[i] = phR;

          arr.push({
            weight: 0,
            reps: 0,
            done: false,
            placeholderWeight: phW,
            placeholderReps: phR,
          });
        }
      }

      if (setsCount < arr.length) {
        arr.splice(setsCount);
      }

      return arr;
    });
  }, [setsCount, exercise.defaultWeight, exercise.reps]);

  const handleWeightChange = (index: number, value: string) => {
    // Allow empty string to clear the field
    if (value.trim() === "") {
      setSets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], weight: 0 };
        return next;
      });
      return;
    }

    const weightNum = parseFloat(value);
    if (isNaN(weightNum) || weightNum < 0) return;
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], weight: weightNum };
      return next;
    });
  };

  const handleRepsChange = (index: number, value: string) => {
    // Allow empty string to clear the field
    if (value.trim() === "") {
      setSets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], reps: 0 };
        return next;
      });
      return;
    }

    const repsNum = parseInt(value, 10);
    if (isNaN(repsNum) || repsNum < 0) return;
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], reps: repsNum };
      return next;
    });
  };

  // Auto-mark set as done when both weight and reps are entered
  // Create a serialized key from sets data for dependency tracking
  const setsDataKey = sets.map(s => `${s.weight}-${s.reps}`).join(',');

  useEffect(() => {
    setSets((prev) => {
      const next = prev.map((set, idx) => {
        // Only check ACTUAL weight/reps, NOT placeholders
        // This prevents auto-completing sets based on previous workout data
        const hasWeight = set.weight > 0;
        const hasReps = set.reps > 0;
        const shouldBeComplete = hasWeight && hasReps;

        // If set should be complete but isn't, mark it as done
        if (shouldBeComplete && !set.done) {
          // Start rest timer for the first newly completed set
          if (idx === 0 || prev[idx - 1]?.done) {
            setRestTimeLeft(rest);
            setRestTimerActive(true);
          }
          return { ...set, done: true };
        }

        // If set shouldn't be complete but is, unmark it
        if (!shouldBeComplete && set.done) {
          return { ...set, done: false };
        }

        return set;
      });
      return next;
    });
  }, [setsDataKey, rest]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const today = new Date().toISOString().split("T")[0];
      const todayData = await getWorkoutForExercise(user.uid, today, exerciseId);
      const exToday = todayData?.exercise;

      const existingWeight: number[] = exToday?.weight ?? [];
      const existingReps: number[] = exToday?.repsPerSet ?? [];
      const existingDone: boolean[] = exToday?.doneFlags ?? [];
      const existingSetsCount = exToday?.sets ?? 0;

      const finalLength = Math.max(sets.length, existingSetsCount);

      const mergedWeight: number[] = [];
      const mergedReps: number[] = [];
      const mergedDone: boolean[] = [];

      for (let i = 0; i < finalLength; i++) {
        const userW = sets[i]?.weight ?? 0;
        const userR = sets[i]?.reps ?? 0;
        const userD = sets[i]?.done ?? false;

        const prevW = existingWeight[i] ?? 0;
        const prevR = existingReps[i] ?? 0;
        const prevD = existingDone[i] ?? false;

        mergedWeight[i] = userW > 0 ? userW : prevW;
        mergedReps[i] = userR > 0 ? userR : prevR;
        mergedDone[i] = userD || prevD;
      }

      const trimmedLength = Math.max(
        mergedWeight.findLastIndex((w, i) => w > 0 && mergedReps[i] > 0) + 1,
        0
      );

      if (trimmedLength === 0) {
        toast.error("Complete at least one set");
        return;
      }

      const exerciseData = {
        id: exerciseId,
        exerciseId,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: trimmedLength,
        repsPerSet: mergedReps.slice(0, trimmedLength),
        weight: mergedWeight.slice(0, trimmedLength),
        doneFlags: mergedDone.slice(0, trimmedLength),
        notes: exercise.notes || "",
      };

      await upsertWorkout(user.uid, today, exerciseData, duration, rest);

      toast.success("Workout saved! 🎉");

      onWorkoutSaved({
        sets: exerciseData.weight.map((w, i) => ({
          weight: w,
          reps: exerciseData.repsPerSet[i],
          done: exerciseData.doneFlags[i],
        })),
      });

      onClose();
    } catch (err) {
      console.error("Error saving workout:", err);
      toast.error("Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  // Can save if any set has both weight and reps actually entered (not just placeholders)
  const canSave = sets.some((s) => {
    const hasWeight = s.weight > 0;
    const hasReps = s.reps > 0;
    return hasWeight && hasReps;
  });

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-[#111] rounded-xl border border-gray-800">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={modalRef}
      className="w-full bg-[#111] rounded-xl border border-gray-800 flex flex-col max-h-[85vh]"
    >
      {/* Compact Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-base font-bold text-white">{exercise.name}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Progress Bar - DOMINANT */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">
              {completedSetsCount}/{setsCount} sets
            </span>
            <span className="text-2xl font-bold text-blue-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Last Workout + Recommendation */}
        {lastWorkout && lastWorkout.weight.length > 0 && (
          <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
              <span>Last:</span>
              <span className="text-gray-400">
                {lastWorkout.sets}×{lastWorkout.weight[0]}kg×{lastWorkout.repsPerSet[0]}-{Math.max(...lastWorkout.repsPerSet)} reps
              </span>
              {lastWorkout.date && <span className="text-gray-600">({lastWorkout.date})</span>}
            </div>
            <div className="text-xs text-blue-400 font-medium">
              💡 Try: {lastWorkout.weight[0] + 2.5}kg or +1 rep for progressive overload
            </div>
          </div>
        )}

        {/* Rest Timer - Inline */}
        <AnimatePresence>
          {restTimerActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <span className="text-sm font-medium text-green-400">Rest Timer</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{formatTime(restTimeLeft)}</span>
                <button
                  onClick={() => setRestTimerActive(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sets - Compact List */}
        <div className="space-y-2">
          {sets.map((set, idx) => {
            const isComplete = set.done;
            const currentWeight = set.weight || 0;
            const currentReps = set.reps || 0;
            const displayWeight = currentWeight || set.placeholderWeight || 0;
            const displayReps = currentReps || set.placeholderReps || 0;

            // Progressive overload detection
            const lastWeight = lastWorkout?.weight?.[idx] || 0;
            const lastReps = lastWorkout?.repsPerSet?.[idx] || 0;
            const hasProgressWeight = currentWeight > 0 && currentWeight > lastWeight;
            const hasProgressReps = currentReps > 0 && currentReps > lastReps;
            const showProgress = !isComplete && (hasProgressWeight || hasProgressReps);

            return (
              <div
                key={idx}
                className={clsx(
                  "flex items-center gap-2 p-2 rounded-lg border transition-all",
                  isComplete
                    ? "bg-green-500/10 border-green-500/30"
                    : showProgress
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-gray-900/50 border-gray-800"
                )}
              >
                {/* Set Number Indicator (non-clickable) */}
                <div
                  className={clsx(
                    "flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-sm font-bold",
                    isComplete
                      ? "bg-green-500 text-white"
                      : "bg-gray-800 text-gray-400"
                  )}
                >
                  {isComplete ? "✓" : idx + 1}
                </div>

                {/* Inputs - Single Row */}
                {!isComplete ? (
                  <>
                    <input
                      type="number"
                      value={currentWeight || ""}
                      onChange={(e) => handleWeightChange(idx, e.target.value)}
                      placeholder={set.placeholderWeight?.toString() || "0"}
                      className="w-16 px-2 py-1.5 bg-gray-900 border border-gray-700 focus:border-blue-500 rounded text-white text-sm text-center focus:outline-none"
                    />
                    <span className="text-xs text-gray-600">kg</span>
                    <span className="text-gray-700">×</span>
                    <input
                      type="number"
                      value={currentReps || ""}
                      onChange={(e) => handleRepsChange(idx, e.target.value)}
                      placeholder={set.placeholderReps?.toString() || "0"}
                      className="w-12 px-2 py-1.5 bg-gray-900 border border-gray-700 focus:border-blue-500 rounded text-white text-sm text-center focus:outline-none"
                    />
                    <span className="text-xs text-gray-600">reps</span>

                    {/* Progressive Overload Indicator */}
                    {showProgress && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold text-orange-400 ml-auto"
                      >
                        🔥 PR!
                      </motion.span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-400 ml-auto">
                    {displayWeight}kg × {displayReps} reps
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Set */}
        <button
          onClick={() => setSetsCount(setsCount + 1)}
          className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>

        {/* Save Button - Always visible */}
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className={clsx(
            "w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
            saving
              ? "bg-blue-600 cursor-wait text-white"
              : canSave
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>
                {canSave
                  ? `Save Workout (${completedSetsCount}/${setsCount} sets)`
                  : "Enter weight & reps to save"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
