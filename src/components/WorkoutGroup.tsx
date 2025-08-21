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
  // compute progress (0–100)
  const progress =
    completedData && completedData.totalSets > 0
      ? Math.min(
          100,
          Math.round((completedData.setsDone / completedData.totalSets) * 100)
        )
      : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Select ${exercise.name} exercise`}
      className={`
        bg-gray-800 border rounded-xl p-2 text-white text-left transition-transform
        ${selected ? "border-yellow-500 scale-105 shadow-lg" : "border-gray-700 hover:border-yellow-500"}
        focus:outline-none focus:ring-2 focus:ring-yellow-500 flex flex-col gap-2
      `}
    >
      {/* Title + Sets/Reps + Completed */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{exercise.name}</span>
          <span className="px-2 py-0.5 text-yellow-400 bg-yellow-400/10 rounded-md text-xs font-medium">
            {exercise.sets} × {exercise.reps}
          </span>
        </div>
        {completedData && (
          <CheckCircle2 size={16} className="text-green-500" aria-label="Completed today" />
        )}
      </div>

      {/* Meta info */}
      <div className="text-xs text-gray-400">
        {exercise.muscleGroup} • {exercise.subGroup} • {exercise.movementType}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 text-[11px] mt-1">
        <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
          {exercise.difficulty}
        </span>
        {exercise.secondaryMuscleGroups?.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {exercise.secondaryMuscleGroups.join(", ")}
          </span>
        )}
        {exercise.equipment?.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {exercise.equipment.join(", ")}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {completedData && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {completedData.setsDone}/{completedData.totalSets} sets completed
          </div>
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

          completedData={completedExercises[selectedExercise]} 

        />
      )}
    </div>
  );
}