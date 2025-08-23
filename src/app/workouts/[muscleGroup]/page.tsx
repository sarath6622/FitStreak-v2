"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import ExerciseList from "@/components/ExerciseList";
import WorkoutLoggerModal from "@/components/WorkoutLogger/WorkoutLoggerModal";

type CompletedMap = Record<string, { setsDone: number; repsDone: number }>;

export default function MuscleGroupPage() {
  const params = useParams();
  const muscleGroup = decodeURIComponent(String(params.muscleGroup || ""));
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const fetchCompletedForToday = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setCompleted({});
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const data = await getCompletedExercisesForToday(user.uid, today);
    setCompleted(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompletedForToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muscleGroup]);

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-6 bg-black min-h-screen">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/workouts"
            className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-2"
          >
            <span aria-hidden>←</span> Back
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading Exercises...</span>
          </div>
        ) : (
          <ExerciseList
            muscleGroup={muscleGroup}
            onSelectExercise={(exercise) => setSelectedExercise(exercise)}
            completedExercises={completed}
          />
        )}
      </div>

      {selectedExercise && (
        <WorkoutLoggerModal
          muscleGroup={muscleGroup}
          exerciseName={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onWorkoutSaved={fetchCompletedForToday}
        />
      )}
    </>
  );
}