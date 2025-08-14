// src/types/index.ts
export interface Exercise {
  exerciseId: number;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  repsPerSet: number[];
  weight: number[];
  rest: number;
  intensity: string;
  completed: boolean;
}

export interface WorkoutSession {
  date: string;
  duration: number;
  notes: string;
  exercises: Exercise[];
}