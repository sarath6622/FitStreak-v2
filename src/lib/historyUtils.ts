// src/lib/historyUtils.ts
import type { WorkoutSession } from "@/types";

export function calculatePRs(workouts: WorkoutSession[]) {
  const prs: Record<string, number> = {};

  workouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      ex.weight.forEach((w, idx) => {
        const reps = ex.repsPerSet?.[idx] ?? 0;

        // PR = highest weight used for any set (regardless of reps)
        if (!prs[ex.name] || w > prs[ex.name]) {
          prs[ex.name] = w;
        }
      });
    });
  });

  return prs;
}

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const getPRs = (history: WorkoutSession[]): Record<string, number> => {
  const prs: Record<string, number> = {};
  history.forEach((session) => {
    session.exercises.forEach((ex) => {
      const maxWeight = Math.max(...ex.weight);
      if (!prs[ex.name] || maxWeight > prs[ex.name]) {
        prs[ex.name] = maxWeight;
      }
    });
  });
  return prs;
};

export const getExerciseChartData = (
  history: WorkoutSession[],
  exerciseName: string
) => {
  return history
    .filter((session) =>
      session.exercises.some((ex) => ex.name === exerciseName)
    )
    .map((session) => {
      const ex = session.exercises.find((e) => e.name === exerciseName);
      if (!ex) return null; // safety check

      return {
        date: formatDate(session.date),
        topWeight: Math.max(...ex.weight),
        volume: ex.weight.reduce((sum, w) => sum + w * ex.reps, 0),
      };
    })
    .filter(Boolean); // remove nulls
};