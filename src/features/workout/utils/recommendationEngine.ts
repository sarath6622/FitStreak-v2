// utils/recommendationEngine.ts
import { WorkoutExerciseHistoryItem } from "@/features/shared/services/workoutService";

export function recommendNextMuscleGroups(history: WorkoutExerciseHistoryItem[]): string[] {
  const ALL_MUSCLES = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core"];

  if (!history || history.length === 0) {
    return ALL_MUSCLES;
  }

  const trainedRecently = new Set(history.map(item => item.muscleGroup));

  const untrained = ALL_MUSCLES.filter(muscle => !trainedRecently.has(muscle));

  const mostRecent = history[0]?.muscleGroup;
  const avoidMostRecent = (group: string) => group !== mostRecent;

  let recommendations = untrained.length
    ? untrained.filter(avoidMostRecent)
    : ALL_MUSCLES.filter(avoidMostRecent);

  if (recommendations.length === 0) {
    recommendations = ALL_MUSCLES.filter(avoidMostRecent);
  }

  return recommendations.slice(0, 3);
}