"use client";

import { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import WorkoutModal from "./WorkoutModal";

interface Exercise {
  name: string;
  muscleGroup: string;
  subGroup: string;
  equipment: string[];
  movementType: string;
  difficulty: string;
  secondaryMuscleGroups: string[];
  sets: number;
  reps: string;
  notes?: string;
}

interface CompletedExercise {
  setsDone: number;
  repsDone: number;
}

interface WorkoutGroupProps {
  plan: {
    id: string;
    muscleGroup: string;
    exercises: Exercise[];
  };
  completedExercises?: Record<string, CompletedExercise>;
}

function ExerciseCard({
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
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Select ${exercise.name} exercise`}
      className={`
        bg-gray-800 border rounded-xl p-4 text-white text-left transition-transform flex flex-col
        ${selected ? "border-yellow-500 scale-105 shadow-lg" : "border-gray-700 hover:border-yellow-500"}
        focus:outline-none focus:ring-2 focus:ring-yellow-500
      `}
    >
      {/* Title + Completion */}
      <div className="flex justify-between items-start">
        <div className="font-semibold text-base">{exercise.name}</div>
        {completedData && (
          <CheckCircle2
            size={20}
            className="text-green-500"
            aria-label="Completed today"
          />
        )}
      </div>

      {/* Sets & Reps Overview */}
      <div className="text-sm text-yellow-400 mt-1 font-medium">
        {exercise.sets} sets × {exercise.reps} reps
      </div>

      {/* Key details */}
      <div className="text-sm text-gray-400 mt-1">
        {exercise.muscleGroup} • {exercise.subGroup} • {exercise.movementType}
      </div>

      <div className="text-xs text-gray-500">
        Difficulty: {exercise.difficulty}
      </div>

      {/* Secondary muscles */}
      {exercise.secondaryMuscleGroups?.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Secondary: {exercise.secondaryMuscleGroups.join(", ")}
        </div>
      )}

      {/* Equipment */}
      {exercise.equipment?.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Equipment: {exercise.equipment.join(", ")}
        </div>
      )}

      {/* Completed workout info */}
      {completedData && (
        <div className="mt-2 text-green-400 text-xs font-medium">
          Done: {completedData.setsDone} sets × {completedData.repsDone} reps
        </div>
      )}
    </button>
  );
}

export default function WorkoutGroup({
  plan,
  completedExercises = {},
}: WorkoutGroupProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // 🔑 Use plan.exercises from Firestore
  const filteredExercises = useMemo(() => {
    return (plan.exercises as Exercise[]).filter((exercise) => {
      const exerciseName = exercise?.name ?? "";
      return exerciseName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [plan.exercises, searchTerm]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">
        Today's {plan.muscleGroup} Workout
      </h2>

      <input
        type="search"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
        aria-label="Search exercises"
      />

      {filteredExercises.length === 0 ? (
        <p className="text-gray-400">
          No exercises found for {plan.muscleGroup}{" "}
          {searchTerm && `matching "${searchTerm}"`}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              selected={selectedExercise === exercise.name}
              onSelect={() => setSelectedExercise(exercise.name)}
              completedData={completedExercises[exercise.name]}
            />
          ))}
        </div>
      )}

      {/* ✅ Show modal instead of inline logger */}
      {selectedExercise && (
  <WorkoutModal
    isOpen={!!selectedExercise}
    onClose={() => setSelectedExercise(null)}
    exercise={plan.exercises.find((ex) => ex.name === selectedExercise)} // pass full exercise object
  />
)}
    </div>
  );
}