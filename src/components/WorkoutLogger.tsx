"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import SetsControl from "@/components/WorkoutLogger/SetsControl"; // Adjust path if necessary
import WeightRepsInput from "@/components/WorkoutLogger/WeightRepsInput"; // Adjust path if necessary

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
}: {
  exercise: Exercise;
  onClose: () => void;
  onWorkoutSaved: (data: { sets: { weight: number; reps: number; done: boolean }[] }) => void;
}) {
  const [setsCount, setSetsCount] = useState(exercise.sets);
  const [sets, setSets] = useState<{ weight: number; reps: number; done: boolean }[]>([]);
  const [rest, setRest] = useState(90);
  const [duration, setDuration] = useState(45);

  // Sync sets array length to setsCount
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

  // Handlers for the WeightRepsInput component
  const handleWeightChange = (index: number, value: string) => {
    const weightNum = value.trim() === "" ? 0 : parseFloat(value);
    if (isNaN(weightNum) || weightNum < 0) return; // ignore invalid input
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], weight: weightNum };
    setSets(newSets);
  };

  const handleRepsChange = (index: number, value: string) => {
    const repsNum = value.trim() === "" ? 0 : parseInt(value);
    if (isNaN(repsNum) || repsNum < 0) return; // ignore invalid input
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], reps: repsNum };
    setSets(newSets);
  };

  const toggleDone = (setIndex: number) => {
    const newSets = [...sets];
    newSets[setIndex].done = !newSets[setIndex].done;
    setSets(newSets);
  };

  const handleSave = () => {
    onWorkoutSaved({ sets });
    onClose();
  };

  // Prepare arrays for WeightRepsInput props
  const weights = sets.map((s) => s.weight);
  const repsPerSet = sets.map((s) => s.reps);

  // Errors can be passed here if you want to validate inputs; keep empty now
  const errors: { [key: string]: string } = {};

  // For reps input, since you want a simple input instead of picker, 
  // we will substitute the picker part with a normal input in WeightRepsInput,
  // so for now pass repOptions but it won't be used.

 const repOptions: number[] = [];
 // For compatibility, unused here

  return (
    <div className="space-y-4 m-2 p-2">

      {/* Target display */}
      <p className="text-xs text-gray-400 mb-4">
        Target: {setsCount} sets × {exercise.reps} reps
      </p>

      {/* Sets count control */}
      <SetsControl sets={setsCount} setSets={setSetsCount} />

      {/* Weight and reps input with check confirm */}
      <WeightRepsInput
        weights={weights}
        repsPerSet={repsPerSet}
        onWeightChange={handleWeightChange}
        onRepsChange={handleRepsChange}
        errors={errors}
        repOptions={repOptions}
        disabled={false}
        initialAutoConfirmFlags={sets.map(() => false)}
      />

      {/* Done toggle buttons are inside WeightRepsInput check marks, no need to duplicate */}

      {/* Rest Selection */}
      <div className="mt-4">
        <p className="text-xs text-white mb-2">Rest</p>
        <div className="flex gap-2">
          {[30, 60, 90, 120].map((r) => (
            <button
              key={r}
              onClick={() => setRest(r)}
              className={`px-3 py-1 text-xs rounded text-white ${
                rest === r ? "bg-yellow-500 text-black" : "bg-gray-700"
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
              className={`px-3 py-1 text-xs rounded text-white ${
                duration === d ? "bg-yellow-500 text-black" : "bg-gray-700"
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full mt-2 py-2 rounded-lg bg-yellow-500 text-black font-medium flex items-center justify-center gap-2"
      >
        <Save size={18} />
        Save Workout
      </button>
    </div>
  );
}
