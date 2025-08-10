// src/lib/historyUtils.ts
import type { WorkoutSession } from "@/types";

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