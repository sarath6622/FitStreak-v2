"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/firebase";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import ExerciseList from "@/components/ExerciseList";
import { Loader2, Sparkles } from "lucide-react";
import WorkoutModal from "@/components/workout/WorkoutModal";

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
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <Sparkles className="w-8 h-8 animate-spin text-blue-400" />
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
        <WorkoutModal
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exercise={{ name: selectedExercise, muscleGroup }} // pass object since WorkoutModal expects exercise
          onWorkoutSaved={fetchCompletedForToday}
          completedData={
            completed[selectedExercise]
              ? {
                setsDone: completed[selectedExercise].setsDone,
                repsDone: completed[selectedExercise].repsDone,
                totalSets: 0, // 🔹 adjust if you store total sets somewhere
              }

              : undefined
          }

        />
      )}
    </>
  );
}