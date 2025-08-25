import { WorkoutSession } from "@/types";
import { formatDate } from "@/lib/historyUtils";
import { CalendarDays } from "lucide-react";
import { calculate1RM } from "@/utils/strength"; // new util

interface Props {
  workouts: WorkoutSession[];
}

// helper: best 1RM per exercise
function getExercise1RM(weights: number[], reps: number[]): number {
  let max1RM = 0;
  for (let i = 0; i < weights.length; i++) {
    const est = calculate1RM(weights[i], reps[i]);
    if (est > max1RM) max1RM = est;
  }

  return max1RM;
}

// 🎨 muscle group colors
const muscleColors: Record<string, string> = {
  Chest: "bg-red-400",
  Shoulders: "bg-yellow-400",
  Back: "bg-blue-400",
  Biceps: "bg-green-400",
  Triceps: "bg-purple-400",
  Legs: "bg-pink-400",
  Core: "bg-orange-400",
  default: "bg-gray-400",
};

// fallback colors if no muscleGroup
const fallbackColors = [
  "bg-red-400",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-orange-400",
];

export default function WorkoutTimeline({ workouts }: Props) {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-1 mb-3">
        <CalendarDays className="w-4 h-4 text-gray-300" />
        <h2 className="text-lg font-semibold text-white">Timeline</h2>
      </div>

      {workouts.map((w, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-xl mb-3 shadow hover:shadow-md transition"
        >
          {/* Date + Duration */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white font-medium">
              {formatDate(w.date)}
            </span>
            <span className="bg-gray-700 text-gray-200 text-[11px] px-1.5 py-0.5 rounded-full">
              {w.duration} min
            </span>
          </div>

          {/* Exercises summary */}
          <div className="space-y-1">
            {w.exercises.map((ex, i) => {
              const oneRM = getExercise1RM(ex.weight, ex.repsPerSet || []);
              const colorClass =
                muscleColors[ex.muscleGroup || ""] ||
                fallbackColors[i % fallbackColors.length];

              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0"
                >
                  {/* Left: bullet + name */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                    <span className="text-sm text-white">{ex.name}</span>
                  </div>

                  {/* Right: 1RM */}
                  <span className="text-xs text-gray-300 font-mono">
                    1RM{" "}
                    <span className="font-bold text-white">
                      {oneRM > 0 ? `${oneRM}kg` : "-"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}