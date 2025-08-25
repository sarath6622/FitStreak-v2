import { WorkoutSession } from "@/types";
import { formatDate } from "@/lib/historyUtils";
import { CalendarDays } from "lucide-react"; // icon

interface Props {
  workouts: WorkoutSession[];
}

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
          {/* Date + Duration Row */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white font-medium">{formatDate(w.date)}</span>
            <span className="bg-gray-700 text-gray-200 text-[11px] px-1.5 py-0.5 rounded-full">
              {w.duration} min
            </span>
          </div>

          {/* Exercises */}
          <div className="space-y-1">
            {w.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-800/60 rounded-md px-2 py-1"
              >
                <span className="text-sm text-white">{ex.name}</span>
                <span className="text-gray-300 font-mono text-xs">
                  {ex.weight.join(", ")}kg × {ex.repsPerSet?.join(", ")} reps
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}