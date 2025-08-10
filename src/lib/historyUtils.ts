export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const getPRs = (history) => {
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

export const getExerciseChartData = (history, exerciseName: string) => {
  return history
    .filter((session) => session.exercises.some((ex) => ex.name === exerciseName))
    .map((session) => {
      const ex = session.exercises.find((e) => e.name === exerciseName);
      return {
        date: formatDate(session.date),
        topWeight: Math.max(...ex.weight),
        volume: ex.weight.reduce((sum, w) => sum + w * ex.reps, 0),
      };
    });
};