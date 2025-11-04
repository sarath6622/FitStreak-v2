"use client";
import { updateDoc, getDoc } from "firebase/firestore";

import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import { ArrowLeft } from "lucide-react";
import SwipeableCard from "../SwipeableCard";
import EditExerciseModal from "@/components/EditExerciseModal";
import { Exercise } from "@/types";
import { toast } from "sonner";
import ExerciseCard from "./ExerciseCard";
import ExerciseSkeleton from "./ExerciseSkeleton";
import WorkoutModal from "./WorkoutModal";
import ImprovedWorkoutCompletionMeter from "./ImprovedWorkoutCompletionMeter";
import RestTimer from "./RestTimer";
import { useRouter } from "next/navigation";
import { updateUserStreak } from "@/services/streakService";
import { doc, setDoc } from "firebase/firestore";

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
  const [searchTerm] = useState("");
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

    // Find the index of the exercise being edited
    const exerciseIndex = exercises.findIndex(ex => ex.name === exerciseToEdit.name);
    if (exerciseIndex === -1) {
      toast.error("Exercise not found");
      return;
    }

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

  async function handleDelete(exercise: Exercise) {
    if (!user) return;

    const dateStr = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/delete-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          dateStr,
          planId: plan.id,
          exerciseId: exercise.exerciseId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete exercise");
      }

      // ✅ update local state from API response
      setExercises(data.exercises);

      // ✅ cleanup completed state
      setCompletedExercises((prev) => {
        const copy = { ...prev };
        delete copy[exercise.name];
        return copy;
      });

      toast.success(`Deleted exercise: ${exercise.name}`);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete exercise");
    }
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
        console.log(completed);
        
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const handleWorkoutSaved = async (
    exerciseId: string,
    data: { sets: { weight: number; reps: number; done: boolean }[] }
  ) => {
    console.log("Workout saved for", exerciseId, data);

    const ex = exercises.find((e) => e.exerciseId === exerciseId);
    const key = ex?.name || exerciseId;

    // Local state update
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

    const user = auth.currentUser;
    if (!user) return;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // ✅ Update streaks
    await updateUserStreak(user.uid, today);

    // ✅ Update exercise index
    const indexRef = doc(db, "users", user.uid, "exerciseIndex", exerciseId);
    const snap = await getDoc(indexRef);

    if (snap.exists()) {
      // Get old history and prepend today if not already first
      const prev = snap.data().history || [];
      const newHistory = prev[0] === today ? prev : [today, ...prev];

      await updateDoc(indexRef, { history: newHistory });
    } else {
      // First time logging this exercise
      await setDoc(indexRef, { history: [today] });
    }
  };
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  return (
    <div className="space-y-4">

<header className="sticky top-0 z-40 flex items-center justify-between bg-[var(--card-background)] px-3 py-2 border-b border-[var(--card-border)] shadow-sm">
  <div className="flex items-center gap-2">
    <button
      onClick={() => router.push("/workouts?from=today")}
      className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] py-1 px-2 rounded-full transition"
    >
      <ArrowLeft size={16} className="bg-[var(--surface-dark)]" />
    </button>
    <h2 className="text-lg font-semibold text-white">
      Today&apos;s Workout
    </h2>
  </div>
</header>

      <ImprovedWorkoutCompletionMeter
        completedExercises={completedExercises}
        planExercises={exercises}
        userId={user?.uid || ""}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExerciseSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredExercises.map((exercise, index) => {
            const completedData = completedExercises[exercise.name]; // 🔑 lookup by name
            const uniqueKey = exercise.exerciseId || exercise.id || `${exercise.name}-${index}`;

            return (
              <SwipeableCard
                key={uniqueKey}
                onEdit={() => handleEdit(exercise)}
                onDelete={() => handleDelete(exercise)}
              >
                <ExerciseCard
                  exercise={exercise}
                  selected={selectedExercise === uniqueKey}
                  onSelect={() => setSelectedExercise(uniqueKey)}
                  completedData={completedData}
                />
              </SwipeableCard>
            );
          })}
        </div>
      )}

      {/* workout modal */}
      {selectedExercise && (() => {
        // Find exercise by uniqueKey (exerciseId, id, or name-index)
        const selectedEx = filteredExercises.find((ex, idx) => {
          const key = ex.exerciseId || ex.id || `${ex.name}-${idx}`;
          return key === selectedExercise;
        });

        if (!selectedEx) return null;

        return (
          <WorkoutModal
            isOpen={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
            exerciseId={selectedEx.exerciseId || selectedEx.id || selectedExercise}
            exercise={selectedEx}
            onWorkoutSaved={(data) => handleWorkoutSaved(selectedEx.exerciseId || selectedEx.id || selectedExercise, data)}
          />
        );
      })()}

      {/* edit modal */}
      {exerciseToEdit && (
        <EditExerciseModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setExerciseToEdit(null);
          }}
          exercise={exerciseToEdit}
          onSave={handleSave}
        />
      )}

      {/* Rest Timer - Floating Action Button */}
      <RestTimer defaultDuration={90} />
    </div>
  );
}