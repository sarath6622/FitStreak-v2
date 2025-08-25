"use client";

import { CheckCircle2, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import SetsControl from "@/components/WorkoutLogger/SetsControl";
import WeightRepsInput from "@/components/WorkoutLogger/WeightRepsInput";
import {
  upsertWorkout,
  getWorkoutForExercise,
  getLastWorkoutForExercise,
} from "@/services/workoutService";
import { auth } from "@/firebase";
import { toast } from "sonner";
import clsx from "clsx";

interface Exercise {
  name: string;
  muscleGroup: string;
  sets?: number;
  reps?: string;           // might be "8-12" etc.
  defaultWeight?: number;  // AI suggestion
  notes?: string;
}

type SetEntry = {
  weight: number; // actual value (0 means empty)
  reps: number;   // actual value (0 means empty)
  done: boolean;
  placeholderWeight?: number;
  placeholderReps?: number;
};

export default function WorkoutLogger({
  exercise,
  onClose,
  onWorkoutSaved,
  completedData,
}: {
  exercise: Exercise;
  onClose: () => void;
  onWorkoutSaved: (data: { sets: { weight: number; reps: number; done: boolean }[] }) => void;
  completedData?: {
    setsDone?: number;
    repsDone?: number;
    totalSets?: number;
  };
}) {
  // ---------- helpers ----------
  const parseReps = (val?: string): number => {
    if (!val) return 0;
    // accept strictly numeric; ignore ranges like "8-12" -> 0 (so placeholder shows instead)
    const trimmed = String(val).trim();
    return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : 0;
  };

  // ---------- state ----------
  const [setsCount, setSetsCount] = useState<number>(exercise.sets ?? 1);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [rest, setRest] = useState(90);
  const [duration, setDuration] = useState(45);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // keep placeholders for resize logic
  const placeholdersRef = useRef<{ weight: number[]; reps: number[] }>({ weight: [], reps: [] });

  // modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // ---------- fetch/init ----------
  useEffect(() => {
    const fetchExistingData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const [todayData, lastData] = await Promise.all([
        getWorkoutForExercise(user.uid, today, exercise.name),
        getLastWorkoutForExercise(user.uid, exercise.name),
      ]);

      const exToday = todayData?.exercise; // may be undefined
      const exLast = lastData?.exercise;   // may be undefined

      // decide length
      const initialCount = Math.max(
        exToday?.sets ?? 0,
        exercise.sets ?? 0,
        exLast?.sets ?? 0,
        1
      );

      const aiWeight = exercise.defaultWeight ?? 0;
      const aiReps = parseReps(exercise.reps);

      // Build placeholder arrays with priority: AI > last > 0
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

      // Build the working set values:
      // Value priority when re-opening:
      // 1) today's logged values (if exist)
      // 2) otherwise EMPTY (0) so placeholder is visible
      const nextSets: SetEntry[] = [];
      for (let i = 0; i < initialCount; i++) {
        const loggedW = exToday?.weight?.[i];
        const loggedR = exToday?.repsPerSet?.[i];
        const loggedDone = exToday?.doneFlags?.[i] ?? false;

        nextSets.push({
          weight: (typeof loggedW === "number" && loggedW > 0) ? loggedW : 0, // empty → show placeholder
          reps: (typeof loggedR === "number" && loggedR > 0) ? loggedR : 0,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.name, exercise.defaultWeight, exercise.reps, exercise.sets]);

  // ---------- keep arrays in sync when user changes sets count ----------
  useEffect(() => {
    setSets((prev) => {
      const arr = [...prev];

      // grow
      if (setsCount > arr.length) {
        for (let i = arr.length; i < setsCount; i++) {
          const phW = placeholdersRef.current.weight[i] ?? (exercise.defaultWeight ?? 0);
          const phR = placeholdersRef.current.reps[i] ?? parseReps(exercise.reps);

          // ensure placeholders arrays stay long enough
          placeholdersRef.current.weight[i] = phW;
          placeholdersRef.current.reps[i] = phR;

          arr.push({
            weight: 0, // empty so placeholder shows
            reps: 0,
            done: false,
            placeholderWeight: phW,
            placeholderReps: phR,
          });
        }
      }

      // shrink
      if (setsCount < arr.length) {
        arr.splice(setsCount);
      }

      return arr;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setsCount]);

  // ---------- handlers ----------
  const handleWeightChange = (index: number, value: string) => {
    const weightNum = value.trim() === "" ? 0 : parseFloat(value);
    if (isNaN(weightNum) || weightNum < 0) return;
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], weight: weightNum };
      return next;
    });
  };

  const handleRepsChange = (index: number, value: string) => {
    const repsNum = value.trim() === "" ? 0 : parseInt(value, 10);
    if (isNaN(repsNum) || repsNum < 0) return;
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], reps: repsNum };
      return next;
    });
  };

  const toggleDone = (setIndex: number) => {
    setSets((prev) => {
      const next = [...prev];
      next[setIndex] = { ...next[setIndex], done: !next[setIndex].done };
      return next;
    });
  };

const handleSave = async () => {
  try {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const today = new Date().toISOString().split("T")[0];

    const todayData = await getWorkoutForExercise(user.uid, today, exercise.name);
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

    // ✅ Trim trailing rows only if completely empty
    const trimmedLength = Math.max(
      mergedWeight.findLastIndex((w, i) => w > 0 && mergedReps[i] > 0) + 1,
      0
    );

    // 🚨 Stop if literally nothing to save
    if (trimmedLength === 0) {
      toast.error("Please enter at least one set before saving ❌");
      return;
    }

    const exerciseData = {
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: trimmedLength,
      repsPerSet: mergedReps.slice(0, trimmedLength),
      weight: mergedWeight.slice(0, trimmedLength),
      doneFlags: mergedDone.slice(0, trimmedLength),
      notes: exercise.notes || "",
    };

    await upsertWorkout(user.uid, today, exerciseData, duration, rest);

    toast.success("Workout saved successfully!", {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });

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
    toast.error("Failed to save workout ❌");
  } finally {
    setSaving(false);
  }
};

  // ---------- render ----------
  if (loading) {
    return <p className="text-white text-sm">Loading workout data...</p>;
  }

  const errors: Record<string, string> = {};
  const repOptions: number[] = [];
  const baseButtonClasses =
    "px-3 py-1 text-sm rounded transition-colors duration-200 text-white";

  return (
    <div
      ref={modalRef}
      className="w-full max-w-sm mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700 space-y-4"
    >
      <SetsControl sets={setsCount} setSets={setSetsCount} />

      {exercise.sets && exercise.reps && (
        <p className="text-xs text-gray-400 mb-4">
          Target: {setsCount} sets × {exercise.reps}
        </p>
      )}

      {completedData && completedData.totalSets !== undefined && completedData.totalSets > 0 && (
        <p className="text-green-400 text-xs mb-2">
          {`Progress: ${completedData.setsDone ?? 0}/${completedData.totalSets} sets`}
          {completedData.repsDone !== undefined ? ` (${completedData.repsDone} reps)` : ""}
        </p>
      )}

      <WeightRepsInput
        weights={sets.map((s) => s.weight)}
        repsPerSet={sets.map((s) => s.reps)}
        onWeightChange={handleWeightChange}
        onRepsChange={handleRepsChange}
        errors={errors}
        repOptions={repOptions}
        disabled={false}
        initialAutoConfirmFlags={sets.map((s) => s.done)}
        placeholderWeights={sets.map((s) => s.placeholderWeight ?? 0)}
        placeholderReps={sets.map((s) => s.placeholderReps ?? 0)}
        onRowConfirm={(idx) => {
          // keep your existing toggle logic
          setSets((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], done: !next[idx].done };
            return next;
          });
        }}
      />

      {/* Rest */}
      <div>
        <p className="text-sm text-white mb-2 font-semibold">Rest</p>
        <div className="flex flex-wrap gap-2">
          {[30, 60, 90, 120].map((r) => (
            <button
              key={r}
              onClick={() => setRest(r)}
              className={clsx(baseButtonClasses, {
                "bg-yellow-500 text-black shadow-md hover:bg-yellow-600": rest === r,
                "bg-gray-700 hover:bg-gray-600": rest !== r,
              })}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm text-gray-400 mb-2 font-semibold">Duration</p>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={clsx(baseButtonClasses, {
                "bg-yellow-500 text-black shadow-md hover:bg-yellow-600": duration === d,
                "bg-gray-700 hover:bg-gray-600": duration !== d,
              })}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-lg bg-yellow-500 text-black font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-yellow-600 disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Workout"}
      </button>
    </div>
  );
}