import { WorkoutSession } from "@/features/shared/types";
import { calculate1RM } from "@/features/workout/utils/strength";
import { differenceInDays, isSameWeek, isSameMonth } from "date-fns";

interface Props {
  workouts: WorkoutSession[];
}

// 📌 Helper: get streak
function getStreak(workouts: WorkoutSession[]) {
  if (workouts.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let current = 1;
  let streak = 1;

  for (let i = 1; i < workouts.length; i++) {
    const prev = new Date(workouts[i - 1].date);
    const curr = new Date(workouts[i].date);
    const diff = differenceInDays(prev, curr);

    if (diff === 1) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }

  current = streak;
  return { current, longest };
}

// 📌 Helper: muscle group distribution
function getMuscleDistribution(workouts: WorkoutSession[]) {
  const dist: Record<string, number> = {};
  workouts.forEach((w) =>
    w.exercises.forEach((e) => {
      const vol = e.weight.reduce(
        (sum, wVal, i) => sum + wVal * (e.repsPerSet?.[i] || 0),
        0
      );
      dist[e.muscleGroup] = (dist[e.muscleGroup] || 0) + vol;
    })
  );
  return dist;
}

// 📌 Helper: best lifts (by 1RM)
function getBestLifts(workouts: WorkoutSession[]) {
  const best: Record<string, number> = {};
  workouts.forEach((w) =>
    w.exercises.forEach((e) => {
      e.weight.forEach((wVal, i) => {
        const reps = e.repsPerSet?.[i] || 0;
        const est = calculate1RM(wVal, reps);
        if (!best[e.name] || est > best[e.name]) best[e.name] = est;
      });
    })
  );
  return best;
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

  const streaks = getStreak(workouts);
  const muscleDist = getMuscleDistribution(workouts);
  const bestLifts = getBestLifts(workouts);

  const topMuscle =
    Object.entries(muscleDist).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // pick top 3 lifts by 1RM
  const topLifts = Object.entries(bestLifts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // workouts this month
  const now = new Date();
  const thisMonthWorkouts = workouts.filter((w) =>
    isSameMonth(new Date(w.date), now)
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 📊 Consistency */}
      <div className="bg-gray-800 p-4 rounded-lg text-center col-span-2">
        <p className="text-lg font-bold">{totalWorkouts}</p>
        <p className="text-gray-400 text-sm">Total Workouts</p>
        <p className="text-xs text-gray-500">
          {thisMonthWorkouts} this month • Current streak:{" "}
          <span className="text-white">{streaks.current}</span> 🔥 • Longest:{" "}
          {streaks.longest}
        </p>
      </div>

      {/* 💪 Training Load */}
      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-lg font-bold">{totalVolume} kg</p>
        <p className="text-gray-400 text-sm">Total Volume</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-lg font-bold">{topMuscle}</p>
        <p className="text-gray-400 text-sm">Most Trained Muscle</p>
      </div>

      {/* 🏋️ Best Lifts */}
      <div className="bg-gray-800 p-4 rounded-lg text-center col-span-2">
        <p className="text-gray-400 text-sm mb-1">Top Lifts (1RM)</p>
        {topLifts.length > 0 ? (
          <ul className="text-sm text-white space-y-1">
            {topLifts.map(([name, rm]) => (
              <li key={name}>
                <span className="font-medium">{name}:</span> {rm} kg
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-xs">No data yet</p>
        )}
      </div>
    </div>
  );
}