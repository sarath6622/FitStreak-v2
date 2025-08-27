// src/types/index.ts
export interface Exercise {
  id: string;             // Firestore doc ID
  exerciseId: string;     // ✅ use string consistently (for selects + backend)
  name: string;
  muscleGroup: string;
  subGroup: string;
  sets: number;
  reps: number | string;  // ✅ reps can sometimes be "8-12"
  repsPerSet: number[];
  weight: number[];
  rest: number;
  intensity: string;
  completed: boolean;

  movementType?: string;
  difficulty?: string;
  secondaryMuscleGroups?: string[];
  equipment?: string[];
  notes?: string;
}

export interface WorkoutSession {
  date: string;
  duration: number;
  notes: string;
  exercises: Exercise[];
}