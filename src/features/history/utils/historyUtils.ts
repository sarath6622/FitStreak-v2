import type { WorkoutSession } from "@/features/shared/types";

export function calculatePRs(workouts: WorkoutSession[]) {
  const prs: Record<string, number> = {};

  workouts.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      const weights = Array.isArray(ex.weight) ? ex.weight : []; // ✅ guard
      weights.forEach((w, idx) => {
        const reps = ex.repsPerSet?.[idx] ?? 0;

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
      const weights = Array.isArray(ex.weight) ? ex.weight : []; // ✅ guard
      const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
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
      if (!ex) return null;

      const weights = Array.isArray(ex.weight) ? ex.weight : []; // ✅ guard
      return {
        date: formatDate(session.date),
        topWeight: weights.length > 0 ? Math.max(...weights) : 0,
        volume: weights.reduce(
          (sum, w, i) => sum + w * (ex.repsPerSet?.[i] ?? 0),
          0
        ),
      };
    })
    .filter(Boolean);
};