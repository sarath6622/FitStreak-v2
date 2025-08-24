"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import SetsControl from "@/components/WorkoutLogger/SetsControl";
import WeightRepsInput from "@/components/WorkoutLogger/WeightRepsInput";
import { upsertWorkout, getWorkoutForExercise } from "@/services/workoutService";
import { auth } from "@/firebase";
import { get } from "http";
import { toast } from "sonner";

interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string; // from plan
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
  completedData?: { setsDone: number; repsDone: number; totalSets: number };
}) {
  const [setsCount, setSetsCount] = useState(exercise.sets);
  const [sets, setSets] = useState<{ weight: number; reps: number; done: boolean }[]>([]);
  const [rest, setRest] = useState(90);
  const [duration, setDuration] = useState(45);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Prefetch existing workout for this exercise
  useEffect(() => {
    const fetchExistingData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      const workoutData = await getWorkoutForExercise(user.uid, today, exercise.name);
      console.log(workoutData);

      if (workoutData && workoutData.exercise) {
        const ex = workoutData.exercise;
        setSetsCount(ex.sets || exercise.sets);
        setSets(
          Array.from({ length: ex.sets || exercise.sets }, (_, i) => {
            const weight = ex.weight?.[i] ?? exercise.defaultWeight ?? 0;
            const reps = ex.repsPerSet?.[i] ?? (parseInt(exercise.reps) || 0);

            return {
              weight,
              reps,
              done: weight > 0 ? true : (ex.doneFlags?.[i] ?? false),
            };
          })
        );
        setDuration(workoutData.duration || 45);
        setRest(workoutData.rest || 90);
      } else {
        // fallback: initialize from plan
        setSets(
          Array.from({ length: exercise.sets }, () => ({
            weight: exercise.defaultWeight || 0,
            reps: parseInt(exercise.reps) || 0,
            done: false,
          }))
        );
      }

      setLoading(false);
    };

    fetchExistingData();
  }, [exercise]);

  // Sync sets array length if user changes count
  useEffect(() => {
    setSets((prev) => {
      const newSets = [...prev];
      if (setsCount > prev.length) {
        for (let i = prev.length; i < setsCount; i++) {
          newSets.push({
            weight: exercise.defaultWeight || 0,
            reps: parseInt(exercise.reps) || 0,
            done: false,
          });
        }
      } else if (setsCount < prev.length) {
        newSets.splice(setsCount);
      }

      return newSets;
    });
  }, [setsCount, exercise.defaultWeight, exercise.reps]);

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

    toast.success("Workout saved successfully! ⚡️");

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

  return (
    <div className="space-y-4 m-2 p-2">
      <p className="text-xs text-gray-400 mb-4">
        Target: {setsCount} sets × {exercise.reps} reps
      </p>

      <SetsControl sets={setsCount} setSets={setSetsCount} />
      {completedData && (
        <p className="text-green-400 text-xs mb-2">
          Progress: {completedData.setsDone}/{completedData.totalSets} sets done
          ({completedData.repsDone} reps)
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
      />

      {/* Rest Selection */}
      <div className="mt-4">
        <p className="text-xs text-white mb-2">Rest</p>
        <div className="flex gap-2">
          {[30, 60, 90, 120].map((r) => (
            <button
              key={r}
              onClick={() => setRest(r)}
              className={`px-3 py-1 text-xs rounded text-white ${rest === r ? "bg-yellow-500 text-black" : "bg-gray-700"
                }`}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="mt-4">
        <p className="text-xs text-gray-400 mb-2">Duration</p>
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1 text-xs rounded text-white ${duration === d ? "bg-yellow-500 text-black" : "bg-gray-700"
                }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-2 py-2 rounded-lg bg-yellow-500 text-black font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Workout"}
      </button>
    </div>
  );
}