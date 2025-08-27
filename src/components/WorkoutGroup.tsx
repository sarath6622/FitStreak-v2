"use client";

import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import { CheckCircle2 } from "lucide-react";
import WorkoutModal from "./WorkoutModal";
import SwipeableCard from "./SwipeableCard";
import EditExerciseModal from "@/components/EditExerciseModal"; // ✅ new import
import { Exercise } from "@/types";
import { toast } from "sonner";

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
  const progress =
    completedData && exercise.sets > 0
      ? Math.min(
        100,
        Math.round((completedData.setsDone / exercise.sets) * 100)
      )
      : 0;

  const secondary = exercise.secondaryMuscleGroups ?? [];
  const equipment = exercise.equipment ?? [];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Select ${exercise.name} exercise`}
      className={`
        relative w-full bg-gray-800 border rounded-xl p-2 text-white text-left transition-transform
        ${selected ? "border-yellow-500 scale-105 shadow-lg" : "border-gray-700 hover:border-yellow-500"}
        focus:outline-none focus:ring-2 focus:ring-yellow-500 flex flex-col gap-2
      `}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{exercise.name}</span>
          <span className="px-2 py-0.5 text-yellow-400 bg-yellow-400/10 rounded-md text-xs font-medium">
            {exercise.sets} × {exercise.reps}
          </span>
        </div>
        {progress === 100 && (
          <CheckCircle2
            size={16}
            className="text-green-500"
            aria-label="Completed today"
          />
        )}
      </div>

      <div className="text-xs text-gray-400">
        {exercise.muscleGroup} • {exercise.subGroup} • {exercise.movementType} ̑
      </div>

      <div className="flex flex-wrap gap-1 text-[11px] mt-1">
        <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
          {exercise.difficulty}
        </span>

        {secondary.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {secondary.join(", ")}
          </span>
        )}

        {equipment.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {equipment.join(", ")}
          </span>
        )}
      </div>

      {completedData && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {completedData.setsDone}/{exercise.sets} sets completed
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

  // 🆕 keep exercises in state so we can edit/delete
  const [exercises, setExercises] = useState<Exercise[]>(plan.exercises);

  // 🆕 edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  function handleEdit(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setEditOpen(true);
  }

async function handleSave(updatedExercise: Exercise) {
  if (!user) return;

  const dateStr = new Date().toISOString().split("T")[0];
  const exerciseIndex = exercises.findIndex(
    (ex) => ex.name === exerciseToEdit?.name
  );
  if (exerciseIndex === -1) return;

  const oldExercise = exercises[exerciseIndex];

  // ✅ Optimistically update local state
  setExercises((prev) =>
    prev.map((ex, idx) => (idx === exerciseIndex ? updatedExercise : ex))
  );

  try {
    const res = await fetch("/api/edit-exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        dateStr,
        planId: plan.id,
        exerciseIndex,
        updatedExercise,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to save exercise");
    }

    // 🔔 show toast with diff
    const changes: string[] = [];
    if (oldExercise.name !== updatedExercise.name) {
      changes.push(`Name: "${oldExercise.name}" → "${updatedExercise.name}"`);
    }

    if (oldExercise.muscleGroup !== updatedExercise.muscleGroup) {
      changes.push(
        `Muscle Group: "${oldExercise.muscleGroup}" → "${updatedExercise.muscleGroup}"`
      );
    }

    if (oldExercise.sets !== updatedExercise.sets) {
      changes.push(`Sets: ${oldExercise.sets} → ${updatedExercise.sets}`);
    }

    if (oldExercise.reps !== updatedExercise.reps) {
      changes.push(`Reps: ${oldExercise.reps} → ${updatedExercise.reps}`);
    }

    toast.success(`Exercise updated: ${updatedExercise.name}`, {
      description: changes.length
        ? changes.join(" • ")
        : "No major fields changed",
    });
  } catch (err) {
    console.error("Save failed:", err);

    // ❌ Rollback on failure
    setExercises((prev) =>
      prev.map((ex, idx) => (idx === exerciseIndex ? oldExercise : ex))
    );

    toast.error("Failed to save exercise");
  } finally {
    setEditOpen(false);
    setExerciseToEdit(null);
  }
}

  function handleDelete(exercise: Exercise) {
    setExercises((prev) => prev.filter((ex) => ex.name !== exercise.name));
    // TODO: remove from Firestore here
  }

  // 🔑 subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const today = new Date().toISOString().split("T")[0];
        const completed = await getCompletedExercisesForToday(
          firebaseUser.uid,
          today
        );
        setCompletedExercises(completed);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleWorkoutSaved = (
    exerciseName: string,
    data: { sets: { weight: number; reps: number; done: boolean }[] }
  ) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseName]: {
        setsDone: data.sets.filter((s) => s.done || s.weight > 0).length,
        repsDone: data.sets.reduce(
          (acc, s) =>
            acc + (s.done || s.weight > 0 ? s.reps : 0),
          0
        ),
        totalSets: data.sets.length,
      },
    }));
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

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
            <SwipeableCard
              key={exercise.name}
              onEdit={() => handleEdit(exercise)}
              onDelete={() => handleDelete(exercise)}
            >
              <ExerciseCard
                exercise={exercise}
                selected={selectedExercise === exercise.name}
                onSelect={() => setSelectedExercise(exercise.name)}
                completedData={completedExercises[exercise.name]}
              />
            </SwipeableCard>
          ))}
        </div>
      )}

      {/* workout modal (logging sets/reps) */}
      {selectedExercise && (
        <WorkoutModal
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exercise={exercises.find((ex) => ex.name === selectedExercise)}
          onWorkoutSaved={(data) =>
            handleWorkoutSaved(selectedExercise, data)
          }

          completedData={completedExercises[selectedExercise]}
        />
      )}

      {/* edit modal (editing exercise info) */}
      {exerciseToEdit && (
        <EditExerciseModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          exercise={exerciseToEdit}
          onSave={handleSave}
        />
      )}
    </div>
  );
}