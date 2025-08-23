"use client";

import { Lightbulb, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getCompletedExercisesForToday } from "@/services/workoutService";
import ExerciseList from "@/components/ExerciseList";
import WorkoutLoggerModal from "@/components/WorkoutLogger/WorkoutLoggerModal";
import SuggestionSection from "../SuggestionSection";
import TodaysWorkouts from "../TodaysWorkouts";
import Link from "next/link";

export default function WorkoutPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, { setsDone: number; repsDone: number }>>({});
  const [suggestedMuscles, setSuggestedMuscles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const muscleGroups = [
    "Chest", "Legs", "Back", "Shoulders", "Biceps", "Triceps", "Core", "Glutes"
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
      <div className="max-w-md mx-auto px-4 py-6 space-y-8 bg-black min-h-screen">

        {/* Content */}
        <div className="space-y-1">
          {/* Suggested Section */}
          {!selectedMuscle && (
            <><div className="bg-gray-900 rounded-xl shadow-md mb-6">
              <SuggestionSection
                userId={auth.currentUser?.uid || ""}
                onSelect={(m) => {
                  setSelectedMuscle(m);
                  fetchWorkoutData(); // <- this refetches data after save!
                } } />

            </div>
               {/* Today's Workouts */}
              <Link href="/workouts/todays-workouts">
                <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer backdrop-blur-md">
                  <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Today's Workouts
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    View your logged plans for today and keep track of progress effortlessly.
                  </p>
                </section>
              </Link>

            <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 backdrop-blur-md mt-6">
              <h2 className="text-lg font-semibold text-white mb-4 tracking-wide">
                All Muscle Groups
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {muscleGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedMuscle(group)}
                    className="bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl py-4 px-3 
                     text-sm font-medium shadow-md transition-all border border-white/10
                     hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm"
                  >
                    {group}
                  </button>
                ))}
              </div>
            </section>
            </>
          )}

          {/* Exercise List */}
          {selectedMuscle && !selectedExercise && (
            loading ? (
              <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading Exercises...</span>
              </div>
            ) : (
              <>
                <ExerciseList
                  muscleGroup={selectedMuscle}
                  onSelectExercise={(exercise) => setSelectedExercise(exercise)}
                  completedExercises={completed} />
              </>
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