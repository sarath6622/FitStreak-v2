import { WorkoutSession } from "@/types";

interface Props {
  workouts: WorkoutSession[];
}

export default function SummaryCards({ workouts }: Props) {
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce(
    (sum, w) =>
      sum +
      w.exercises.reduce(
        (exSum, ex) =>
          exSum +
          ex.weight.reduce(
            (wSum, weight, i) => wSum + weight * (ex.repsPerSet?.[i] || 0),
            0
          ),
        0
      ),
    0
  );
  const mostTrainedMuscle =
    workouts
      .flatMap((w) => w.exercises.map((e) => e.muscleGroup))
      .reduce((acc: Record<string, number>, group) => {
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {}) || {};

  const topMuscle =
    Object.entries(mostTrainedMuscle).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-lg font-bold">{totalWorkouts}</p>
        <p className="text-gray-400 text-sm">Total Workouts</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-lg font-bold">{totalVolume} kg</p>
        <p className="text-gray-400 text-sm">Total Volume</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg text-center col-span-2">
        <p className="text-lg font-bold">{topMuscle}</p>
        <p className="text-gray-400 text-sm">Most Trained Muscle</p>
      </div>
    </div>
  );
}