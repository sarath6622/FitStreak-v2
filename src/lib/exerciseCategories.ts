// src/lib/exerciseCategories.ts
import exercises from "@/data/exercises.json";

export interface ExerciseMeta {
  name: string;
  muscleGroup: string;
  subGroup: string;
  equipment: string[];
  movementType: string;
  difficulty: string;
  secondaryMuscleGroups: string[];
}

// Build a map for quick lookup
export const exerciseMetaMap: Record<string, ExerciseMeta> = Object.fromEntries(
  exercises.map((ex) => [ex.name, ex])
);

// Utility: get category (muscle group) for an exercise
export function getMuscleGroup(exerciseName: string): string {
  return exerciseMetaMap[exerciseName]?.muscleGroup || "Other";
}

// Utility: get full metadata
export function getExerciseMeta(exerciseName: string): ExerciseMeta | null {
  return exerciseMetaMap[exerciseName] || null;
}