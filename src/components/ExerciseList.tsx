// src/components/ExerciseList.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

interface Exercise {
  name: string;
  muscleGroup: string;
  subGroup: string;
  equipment: string[];
  movementType: string;
  difficulty: string;
  secondaryMuscleGroups: string[];
}

interface CompletedExercise {
  setsDone: number;
  repsDone: number;
}

interface ExerciseListProps {
  muscleGroup: string;
  onSelectExercise: (exerciseName: string) => void;
  completedExercises: Record<string, CompletedExercise>;
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
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Select ${exercise.name} exercise`}
      className={`
        bg-gray-800 border rounded-xl p-4 text-white text-left transition-transform flex flex-col
        ${selected ? "border-yellow-500 scale-105 shadow-lg" : "border-gray-700 hover:border-yellow-500"}
        focus:outline-none focus:ring-2 focus:ring-yellow-500
      `}
    >
      <div className="flex justify-between items-start">
        <div className="font-semibold">{exercise.name}</div>
        {completedData && (
          <CheckCircle2
            size={20}
            className="text-green-500"
            aria-label="Completed today"
          />
        )}
      </div>

      <div className="text-sm text-gray-400">
        {exercise.subGroup} • {exercise.movementType} • {exercise.difficulty}
      </div>

      <div className="text-xs text-gray-500 mt-1">
        Equipment: {exercise.equipment.join(", ")}
      </div>

      {completedData && (
        <div className="mt-1 text-green-400 text-xs font-medium">
          Done: {completedData.setsDone} sets × {completedData.repsDone} reps
        </div>
      )}
    </button>
  );
}

export default function ExerciseList({
  muscleGroup,
  onSelectExercise,
  completedExercises,
}: ExerciseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch from Firestore when component mounts or muscleGroup changes
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const exercisesRef = collection(db, "exercises");
        const q = query(
          exercisesRef,
          where("muscleGroup", "==", muscleGroup),
          orderBy("name")
        );

        const snapshot = await getDocs(q);
        const fetched: Exercise[] = snapshot.docs.map(
          (doc) => doc.data() as Exercise
        );

        setExercises(fetched);
      } catch (err) {
        console.error("❌ Error fetching exercises:", err);
      } finally {
        setLoading(false);
      }
    };

    if (muscleGroup) {
      fetchExercises();
    }
  }, [muscleGroup]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  const handleSelect = (name: string) => {
    setSelectedExercise(name);
    onSelectExercise(name);
  };

  if (loading) {
    return <p className="text-gray-400">Loading exercises...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{muscleGroup} Exercises</h2>

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
          No exercises found for {muscleGroup}{" "}
          {searchTerm && `matching "${searchTerm}"`}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              selected={selectedExercise === exercise.name}
              onSelect={() => handleSelect(exercise.name)}
              completedData={completedExercises[exercise.name]}
            />
          ))}
        </div>
      )}
    </div>
  );
}