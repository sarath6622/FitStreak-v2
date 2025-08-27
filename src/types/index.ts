// src/types/index.ts
// src/types/index.ts
export interface Exercise {
  exerciseId: number;
  name: string;
  muscleGroup: string;
  subGroup: string;
  sets: number;
  reps: number;
  repsPerSet: number[];
  weight: number[];
  rest: number;
  intensity: string;
  completed: boolean;

  // 🆕 Add missing fields that UI is expecting
  movementType?: string;
  difficulty?: string;
  secondaryMuscleGroups?: string[];
  equipment?: string[];
}

export interface WorkoutSession {
  date: string;
  duration: number;
  notes: string;
  exercises: Exercise[];
}