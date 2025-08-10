"use client";

import { Lightbulb, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ExerciseList from "@/components/ExerciseList";
import WorkoutLoggerModal from "./WorkoutLoggerModal";

export default function WorkoutPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const suggestedMuscles = ["Shoulders", "Biceps", "Core"];
  const muscleGroups = [
    "Chest",
    "Legs",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Core",
  ];
  const completed = {
  "Barbell Bench Press": { setsDone: 3, repsDone: 10 },
  "Incline Dumbbell Press": { setsDone: 4, repsDone: 8 },
};

  return (
<>
  <div className="max-w-md mx-auto px-4 py-6 space-y-6 bg-black min-h-screen">
    {/* Sticky Header */}
<header
  className="sticky top-16 z-40 bg-black py-3 px-4 backdrop-blur-md"
  aria-label="Workout page header"
>
      <div className="flex items-center justify-between">
        {selectedMuscle ? (
          <button
            onClick={() =>
              selectedExercise ? setSelectedExercise(null) : setSelectedMuscle(null)
            }

            className="text-gray-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft size={18} /> Back
          </button>
        ) : (
          <h1 className="text-xl font-bold text-white">Workouts</h1>
        )}
      </div>
    </header>

    {/* Content below header with padding-top */}
    <div className="pt-4">
      {/* 1️⃣ Muscle group selection */}
      {!selectedMuscle && (
        <>
          {/* Suggested Section */}
          <section className="p-4 rounded-xl bg-gradient-to-r from-yellow-300/80 to-yellow-400/80 backdrop-blur-sm shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-800" />
              <span className="font-semibold text-yellow-900 text-sm">
                Suggested for you
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedMuscles.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className="rounded-full px-4 py-2 bg-yellow-500 text-black font-medium shadow hover:bg-yellow-400 transition"
                >
                  {muscle}
                </button>
              ))}
            </div>
          </section>

          {/* All Muscle Groups */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              All Muscle Groups
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {muscleGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedMuscle(group)}
                  className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-xl py-6 text-lg font-semibold text-white shadow-md active:scale-95 hover:border-yellow-500 transition-transform"
                >
                  {group}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* 2️⃣ Exercise list */}
      {selectedMuscle && !selectedExercise && (
        <ExerciseList
          muscleGroup={selectedMuscle}
          onSelectExercise={(exercise) => setSelectedExercise(exercise)}
          completedExercises={completed}
        />
      )}
    </div>
  </div>

  {/* 3️⃣ Workout Logger Modal */}
  {selectedExercise && (
    <WorkoutLoggerModal
      muscleGroup={selectedMuscle!}
      exerciseName={selectedExercise}
      onClose={() => setSelectedExercise(null)}
    />
  )}
</>
  );
}