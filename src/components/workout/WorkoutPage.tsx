"use client";

import { Lightbulb, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import ExerciseList from "@/components/ExerciseList";
import WorkoutLoggerModal from "@/components/WorkoutLogger/WorkoutLoggerModal";

export default function WorkoutPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, { setsDone: number; repsDone: number }>>({});
  const [suggestedMuscles, setSuggestedMuscles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const muscleGroups = [
    "Chest", "Legs", "Back", "Shoulders", "Biceps", "Triceps", "Core"
  ];

const fetchWorkoutData = async () => {
  setLoading(true);
  const user = auth.currentUser;
  if (!user) {
    setCompleted({});
    setSuggestedMuscles(muscleGroups.slice(0, 3));
    setLoading(false);
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const data = await getCompletedExercisesForToday(user.uid, today);
  setCompleted(data);

  // --- Fetch last 7 days history for suggestions ---
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const workoutsRef = collection(db, "users", user.uid, "workouts");
  const q = query(
    workoutsRef,
    where("date", ">=", sevenDaysAgo.toISOString().split("T")[0]),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  const workouts = snapshot.docs.map(doc => doc.data());

  const counts: Record<string, number> = {};
  muscleGroups.forEach(m => counts[m] = 0);

  workouts.forEach(workout => {
    workout.exercises.forEach((ex: any) => {
      if (counts[ex.muscleGroup] !== undefined) {
        counts[ex.muscleGroup]++;
      }
    });
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => a[1] - b[1])
    .map(([muscle]) => muscle);

  setSuggestedMuscles(sorted.slice(0, 3));
  setLoading(false);
};

useEffect(() => {
  fetchWorkoutData();
}, []);

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6 bg-black min-h-screen">
        {/* Sticky Header */}
        <header className="z-40 bg-black px-3 py-0.5 backdrop-blur-md">
          <div className="flex items-center justify-between ">
            {selectedMuscle ? (
              <button
                onClick={() =>
                  selectedExercise ? setSelectedExercise(null) : setSelectedMuscle(null)
                }

                className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <h1 className="text-lg font-semibold text-white leading-none">Workouts</h1>
            )}
          </div>
        </header>

        <div className="pt-4">
          {/* Suggested Section */}
          {!selectedMuscle && (
            <>
              {/* Suggested Section */}
              <section className="p-3 rounded-lg bg-yellow-400/20 border border-yellow-500/30 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-400 text-sm">
                    Suggested for you
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedMuscles.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscle(muscle)}
                      className="rounded-full px-3 py-1.5 bg-yellow-500 text-black text-sm font-medium shadow hover:bg-yellow-400 transition"
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </section>

              {/* All Muscle Groups */}
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">
                  All Muscle Groups
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedMuscle(group)}
                      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl py-4 text-sm font-semibold text-white shadow hover:border-yellow-500 border border-gray-700 transition"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Exercise list */}
          {selectedMuscle && !selectedExercise && (
            loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <ExerciseList
                muscleGroup={selectedMuscle}
                onSelectExercise={(exercise) => setSelectedExercise(exercise)}
                completedExercises={completed}
              />
            )
          )}
        </div>
      </div>

      {/* Workout Logger Modal */}
      {selectedExercise && (
  <WorkoutLoggerModal
    muscleGroup={selectedMuscle!}
    exerciseName={selectedExercise}
    onClose={() => setSelectedExercise(null)}
    onWorkoutSaved={fetchWorkoutData} // NEW
  />
)}
    </>
  );
}