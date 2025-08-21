"use client";

import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
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
  totalSets: number;
}

interface WorkoutGroupProps {
  plan: {
    id: string;
    muscleGroup: string;
    exercises: Exercise[];
  };
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
    bg-gray-800 border rounded-2xl p-4 text-white text-left transition-transform
    ${selected ? "border-yellow-500 scale-105 shadow-lg" : "border-gray-700 hover:border-yellow-500"}
    focus:outline-none focus:ring-2 focus:ring-yellow-500 flex flex-col gap-3
  `}
>
  {/* Title + Completed */}
  <div className="flex justify-between items-center">
    <span className="font-semibold text-base">{exercise.name}</span>
    {completedData && (
      <CheckCircle2 size={20} className="text-green-500" aria-label="Completed today" />
    )}
  </div>

  {/* Sets × Reps */}
  <div className="inline-block px-2 py-1 text-yellow-400 bg-yellow-400/10 rounded-lg text-sm font-medium">
    {exercise.sets} × {exercise.reps}
  </div>

  {/* Key info in one line */}
  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
    <span>{exercise.muscleGroup}</span>
    <span>• {exercise.subGroup}</span>
    <span>• {exercise.movementType}</span>
  </div>

  {/* Meta as badges */}
  <div className="flex flex-wrap gap-2 mt-1">
    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
      {exercise.difficulty}
    </span>
    {exercise.secondaryMuscleGroups?.length > 0 && (
      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
        {exercise.secondaryMuscleGroups.join(", ")}
      </span>
    )}
    {exercise.equipment?.length > 0 && (
      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
        {exercise.equipment.join(", ")}
      </span>
    )}
  </div>

  {/* Completion info */}
  {completedData && (
    <div className="text-green-400 text-xs font-medium">
      Done: {completedData.setsDone} sets
    </div>
  )}
</button>
  );
}

export default function WorkoutGroup({ plan }: WorkoutGroupProps) {
  const [user, setUser] = useState<User | null>(null);
  const [completedExercises, setCompletedExercises] = useState<
    Record<string, CompletedExercise>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // 🔑 Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const completed = await getCompletedExercisesForToday(
          firebaseUser.uid,
          today
        );
        setCompletedExercises(completed);
      }
    });

    return () => unsubscribe();
  }, []);

    const refreshCompletedExercises = async () => {
  if (!user) return;
  const today = new Date().toISOString().split("T")[0];
  const completed = await getCompletedExercisesForToday(user.uid, today);
  setCompletedExercises(completed);
};

const handleWorkoutSaved = (
  exerciseName: string,
  data: { sets: { weight: number; reps: number; done: boolean }[] }
) => {
  setCompletedExercises(prev => ({
    ...prev,
    [exerciseName]: {
      setsDone: data.sets.filter(s => s.done || s.weight > 0).length,
      repsDone: data.sets.reduce((acc, s) => acc + ((s.done || s.weight > 0) ? s.reps : 0), 0),
      totalSets: data.sets.length,
    },
  }));
};

  // 🔎 Filter by search
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

      {/* ✅ Modal */}
{selectedExercise && (
  <WorkoutModal
    isOpen={!!selectedExercise}
    onClose={() => setSelectedExercise(null)}
    exercise={plan.exercises.find((ex) => ex.name === selectedExercise)}
    onWorkoutSaved={(data) =>
      handleWorkoutSaved(selectedExercise, data)
    }

  />
)}
    </div>
  );
}