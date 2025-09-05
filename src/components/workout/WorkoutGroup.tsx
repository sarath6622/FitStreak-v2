"use client";

import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import SwipeableCard from "../SwipeableCard";
import EditExerciseModal from "@/components/EditExerciseModal";
import { Exercise } from "@/types";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import ExerciseCard from "./ExerciseCard";
import ExerciseSkeleton from "./ExerciseSkeleton";
import WorkoutModal from "./WorkoutModal";
import WorkoutCompletionMeter from "./WorkoutCompletionMeter";
import { useRouter } from "next/navigation";import router from "next/router"; 

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

export default function WorkoutGroup({ plan }: WorkoutGroupProps) {
  const [user, setUser] = useState<User | null>(null);
  const [completedExercises, setCompletedExercises] = useState<
    Record<string, CompletedExercise>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const router = useRouter();
  
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
  const [loading, setLoading] = useState(true);

  <ExerciseSkeleton />;

  // auth state + fetch completed logs
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

      setLoading(false);
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

      <header className="sticky top-0 z-40 flex items-center gap-3 bg-[var(--card-background)] px-3 py-2 border-b border-[var(--card-border)] shadow-sm">
        <button
          onClick={() => router.push("/workouts?from=today")}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] py-1 px-2 rounded-full transition"
        >
          <ArrowLeft size={16} className="bg-[var(--surface-dark)]" /> Back
        </button>
              <h2 className="text-lg font-semibold text-white">
        Today's {plan.muscleGroup} Plan
      </h2>
      </header>

      <WorkoutCompletionMeter
        completedExercises={completedExercises}
        planExercises={exercises}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExerciseSkeleton key={i} />
          ))}
        </div>
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