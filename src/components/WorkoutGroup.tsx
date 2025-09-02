"use client";

import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import { CheckCircle2 } from "lucide-react";
import WorkoutModal from "./WorkoutModal";
import SwipeableCard from "./SwipeableCard";
import EditExerciseModal from "@/components/EditExerciseModal";
import { Exercise } from "@/types";
import { toast } from "sonner";
import { Search } from "lucide-react";

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
    relative w-full rounded-xl p-3 text-white text-left transition-all
    bg-[#0d0f1a]/60 backdrop-blur-md border border-gray-800 shadow-sm
    hover:border-yellow-400/70 hover:shadow-[0_0_8px_rgba(234,179,8,0.25)]
    ${selected ? "border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] scale-[1.01]" : ""}
    focus:outline-none focus:ring-1 focus:ring-yellow-500/40 flex flex-col gap-1.5
  `}
>
  {/* Top Row */}
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-1.5">
      <span className="font-medium text-sm">{exercise.name}</span>
      <span className="px-1.5 py-0.5 text-yellow-400 bg-yellow-400/10 rounded-md text-[10px] font-medium">
        {exercise.sets} × {exercise.reps}
      </span>
    </div>
    {progress === 100 && (
      <CheckCircle2
        size={14}
        className="text-green-400"
        aria-label="Completed today"
      />
    )}
  </div>

  {/* Sub Info */}
  <div className="text-[11px] text-gray-400 truncate">
    {exercise.muscleGroup} • {exercise.subGroup} • {exercise.movementType}
  </div>

  {/* Tags */}
  <div className="flex flex-wrap gap-1 text-[10px] mt-0.5">
    <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-gray-400">
      {exercise.difficulty}
    </span>

    {secondary.length > 0 && (
      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-gray-400">
        {secondary.join(", ")}
      </span>
    )}

    {equipment.length > 0 && (
      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-gray-400">
        {equipment.join(", ")}
      </span>
    )}
  </div>

  {/* Progress */}
  {completedData && (
    <div className="mt-1">
      <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-0.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5">
        {completedData.setsDone}/{exercise.sets} sets
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

  const [exercises, setExercises] = useState<Exercise[]>(plan.exercises);

  const [editOpen, setEditOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  function handleEdit(exercise: Exercise) {
    setExerciseToEdit(exercise);
    setEditOpen(true);
  }

  async function handleSave(updatedExercise: Exercise) {
    if (!user || !exerciseToEdit) return;

    const dateStr = new Date().toISOString().split("T")[0];
    const oldName = exerciseToEdit.name; // 🔑 use name for lookup

    try {
      const res = await fetch("/api/edit-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          dateStr,
          planId: plan.id,
          oldName,
          updatedExercise,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save exercise");
      }

      // ✅ update exercises from API
      setExercises(data.exercises);

      // ✅ re-fetch completions to update progress bars immediately
      const fresh = await getCompletedExercisesForToday(user.uid, dateStr);
      setCompletedExercises(fresh);

      toast.success(`Exercise updated: ${updatedExercise.name}`);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save exercise");
    } finally {
      setEditOpen(false);
      setExerciseToEdit(null);
    }
  }

  function handleDelete(exercise: Exercise) {
    setExercises((prev) => prev.filter((ex) => ex.exerciseId !== exercise.exerciseId));
    // TODO: remove from Firestore here
  }

  // Keep exercises in sync if parent plan changes
  useEffect(() => {
    setExercises(plan.exercises);
  }, [plan.id, plan.exercises]);

  // auth state + completed logs
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
    exerciseId: string,
    data: { sets: { weight: number; reps: number; done: boolean }[] }
  ) => {
    const ex = exercises.find((e) => e.exerciseId === exerciseId);
    const key = ex?.name || exerciseId; // 🔑 key by name
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: {
        setsDone: data.sets.filter((s) => s.done || s.weight > 0).length,
        repsDone: data.sets.reduce(
          (acc, s) => acc + (s.done || s.weight > 0 ? s.reps : 0),
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

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="search"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 p-2 rounded-md bg-[#0d0f1a]/60 border border-gray-800 text-white focus:outline-none focus:border-yellow-500"
          aria-label="Search exercises"
        />
      </div>

      {filteredExercises.length === 0 ? (
        <p className="text-gray-400">
          No exercises found for {plan.muscleGroup}{" "}
          {searchTerm && `matching "${searchTerm}"`}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredExercises.map((exercise) => {
            const completedData = completedExercises[exercise.name]; // 🔑 lookup by name

            return (
              <SwipeableCard
                key={exercise.exerciseId}
                onEdit={() => handleEdit(exercise)}
                onDelete={() => handleDelete(exercise)}
              >
                <ExerciseCard
                  exercise={exercise}
                  selected={selectedExercise === exercise.exerciseId}
                  onSelect={() => setSelectedExercise(exercise.exerciseId)}
                  completedData={completedData}
                />
              </SwipeableCard>
            );
          })}
        </div>
      )}

      {/* workout modal */}
      {selectedExercise && (
        <WorkoutModal
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exercise={exercises.find((ex) => ex.exerciseId === selectedExercise)}
          onWorkoutSaved={(data) => handleWorkoutSaved(selectedExercise, data)}
          completedData={(() => {
            const ex = exercises.find((e) => e.exerciseId === selectedExercise);
            return ex ? completedExercises[ex.name] : undefined; // 🔑 lookup by name
          })()}
        />
      )}

      {/* edit modal */}
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