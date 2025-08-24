"use client";

import { CheckCircle2, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SetsControl from "@/components/WorkoutLogger/SetsControl";
import WeightRepsInput from "@/components/WorkoutLogger/WeightRepsInput";
import { upsertWorkout, getWorkoutForExercise, getLastWorkoutForExercise } from "@/services/workoutService";
import { auth } from "@/firebase";
import { toast } from "sonner";
import clsx from 'clsx';

interface Exercise {
  name: string;
  muscleGroup: string;
  sets?: number;
  reps?: string;
  defaultWeight?: number;
  notes?: string;
}

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
  const [setsCount, setSetsCount] = useState(exercise.sets ?? 1);
  const [sets, setSets] = useState<{ weight: number; reps: number; done: boolean }[]>([]);
  const [rest, setRest] = useState(90);
  const [duration, setDuration] = useState(45);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reference to the modal's container to detect outside clicks
  const modalRef = useRef<HTMLDivElement>(null);

  // Prefetch existing workout for this exercise
useEffect(() => {
  const fetchExistingData = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // 1. Try today's workout
    const workoutData = await getWorkoutForExercise(user.uid, today, exercise.name);

    if (workoutData && workoutData.exercise) {
      // ✅ Preserve today’s saved workout
      const ex = workoutData.exercise;
      const initialSetsCount = ex.sets || exercise.sets || 1;
      setSetsCount(initialSetsCount);
      setSets(
        Array.from({ length: initialSetsCount }, (_, i) => {
          const weight = ex.weight?.[i] ?? exercise.defaultWeight ?? 0;
          const reps =
            ex.repsPerSet?.[i] ?? (exercise.reps ? parseInt(exercise.reps) : 0);
          return {
            weight,
            reps,
            done: weight > 0 || (ex.doneFlags?.[i] ?? false),
          };
        })
      );
      setDuration(workoutData.duration || 45);
      setRest(workoutData.rest || 90);
    } else {
      // 2. No workout for today → fetch last workout
      const lastWorkoutData = await getLastWorkoutForExercise(user.uid, exercise.name);

      if (lastWorkoutData && lastWorkoutData.exercise) {
        const ex = lastWorkoutData.exercise;
        const initialSetsCount = exercise.sets || ex.sets || 1;
        setSetsCount(initialSetsCount);

        setSets(
          Array.from({ length: initialSetsCount }, (_, i) => {
            const placeholderWeight =
              ex.weight?.[i] ?? exercise.defaultWeight ?? 0;
            const placeholderReps =
              ex.repsPerSet?.[i] ??
              (exercise.reps ? parseInt(exercise.reps) : 0);

            return {
              // Editable for today
              weight: exercise.defaultWeight || 0,
              reps: exercise.reps ? parseInt(exercise.reps) : 0,
              done: false,
              // Placeholders from last workout
              placeholderWeight,
              placeholderReps,
            };
          })
        );
      } else {
        // 3. Fallback to defaults
        setSets(
          Array.from({ length: exercise.sets ?? 1 }, () => ({
            weight: exercise.defaultWeight || 0,
            reps: exercise.reps ? parseInt(exercise.reps) : 0,
            done: false,
          }))
        );
      }
    }

    setLoading(false);
  };

  fetchExistingData();
}, [exercise, exercise.defaultWeight, exercise.reps, exercise.sets]);

  // Sync sets array length if user changes count
  useEffect(() => {
    setSets((prev) => {
      const newSets = [...prev];
      if (setsCount > prev.length) {
        for (let i = prev.length; i < setsCount; i++) {
          newSets.push({
            weight: exercise.defaultWeight || 0,
            reps: exercise.reps ? parseInt(exercise.reps) : 0,
            done: false,
          });
        }
      } else if (setsCount < prev.length) {
        newSets.splice(setsCount);
      }

      return newSets;
    });
  }, [setsCount, exercise.defaultWeight, exercise.reps, exercise.sets]);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  const handleWeightChange = (index: number, value: string) => {
    const weightNum = value.trim() === "" ? 0 : parseFloat(value);
    if (isNaN(weightNum) || weightNum < 0) return;
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], weight: weightNum };
    setSets(newSets);
  };

  const handleRepsChange = (index: number, value: string) => {
    const repsNum = value.trim() === "" ? 0 : parseInt(value);
    if (isNaN(repsNum) || repsNum < 0) return;
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], reps: repsNum };
    setSets(newSets);
  };

  const toggleDone = (setIndex: number) => {
    const newSets = [...sets];
    newSets[setIndex].done = !newSets[setIndex].done;
    setSets(newSets);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const today = new Date().toISOString().split("T")[0];

      const exerciseData = {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: sets.length,
        repsPerSet: sets.map((s) => s.reps),
        weight: sets.map((s) => s.weight),
        doneFlags: sets.map((s) => s.done),
        notes: exercise.notes || "",
      };

      await upsertWorkout(user.uid, today, exerciseData, duration, rest);

      toast.success("Workout saved successfully!", {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });

      onWorkoutSaved({ sets });
      onClose();
    } catch (err) {
      console.error("Error saving workout:", err);
      toast.error("Failed to save workout ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-white text-sm">Loading workout data...</p>;
  }

  const weights = sets.map((s) => s.weight);
  const repsPerSet = sets.map((s) => s.reps);
  const errors: { [key: string]: string } = {};
  const repOptions: number[] = [];

  const baseButtonClasses = "px-3 py-1 text-sm rounded transition-colors duration-200 text-white";

  return (
    <div
      ref={modalRef}
      className="w-full max-w-sm mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700 space-y-4"
    >
      <SetsControl sets={setsCount} setSets={setSetsCount} />

      {/* Show target only if both values exist */}
      {exercise.sets && exercise.reps && (
        <p className="text-xs text-gray-400 mb-4">
          Target: {setsCount} sets × {exercise.reps} reps
        </p>
      )}

      {completedData && completedData.totalSets !== undefined && completedData.totalSets > 0 && (
        <p className="text-green-400 text-xs mb-2">
          {`Progress: ${completedData.setsDone ?? 0}/${completedData.totalSets} sets`}
          {completedData.repsDone !== undefined
            ? ` (${completedData.repsDone} reps)`
            : ""}
        </p>
      )}

      <WeightRepsInput
        weights={weights}
        repsPerSet={repsPerSet}
        onWeightChange={handleWeightChange}
        onRepsChange={handleRepsChange}
        errors={errors}
        repOptions={repOptions}
        disabled={false}
        initialAutoConfirmFlags={sets.map((s) => s.done)}
        placeholderWeights={sets.map((s: any) => s.placeholderWeight ?? 0)}
        placeholderReps={sets.map((s: any) => s.placeholderReps ?? 0)}
      />

      {/* Rest Selection */}
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

      {/* Duration Selection */}
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
