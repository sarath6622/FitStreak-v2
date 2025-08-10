"use client";

import { useState } from "react";
import { X, Minus, Plus, Save } from "lucide-react";

interface WorkoutLoggerModalProps {
  muscleGroup: string;
  exerciseName: string;
  onClose: () => void;
}

export default function WorkoutLoggerModal({
  muscleGroup,
  exerciseName,
  onClose,
}: WorkoutLoggerModalProps) {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);

  const handleSave = () => {
    const workoutData = {
      date: new Date().toISOString().split("T")[0],
      duration: 45,
      notes: "",
      exercises: [
        {
          exerciseId: Date.now(),
          name: exerciseName,
          muscleGroup,
          sets,
          reps,
          weight: Array(sets).fill(0),
          rest: 90,
          intensity: "Moderate",
          completed: true,
        },
      ],
    };
    console.log("Workout Saved:", workoutData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-6 w-80 text-white shadow-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Log {exerciseName}
        </h2>

        {/* Sets */}
        <div className="flex items-center justify-between mb-4">
          <span>Sets</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSets(Math.max(1, sets - 1))}
              className="bg-gray-800 p-2 rounded-full"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold">{sets}</span>
            <button
              onClick={() => setSets(sets + 1)}
              className="bg-gray-800 p-2 rounded-full"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Reps */}
        <div className="flex items-center justify-between mb-6">
          <span>Reps</span>
          <select
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            className="bg-gray-800 p-2 rounded-md"
          >
            {[5, 8, 10, 12, 15].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2"
        >
          <Save size={18} /> Save Workout
        </button>
      </div>
    </div>
  );
}