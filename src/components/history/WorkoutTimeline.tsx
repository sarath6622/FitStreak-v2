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
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-gray-300" />
        <h2 className="text-xl font-bold text-white">Timeline</h2>
      </div>

      {workouts.map((w, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl mb-4 shadow-md hover:shadow-lg transition"
        >
          {/* Date + Duration Row */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-medium">{formatDate(w.date)}</span>
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">
              {w.duration} min
            </span>
          </div>

          {/* Exercises */}
          <div className="space-y-2">
            {w.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-800/60 rounded-lg px-3 py-2"
              >
                <span className="text-white font-medium">{ex.name}</span>
                <span className="text-gray-300 font-mono text-sm">
                  {ex.weight.join(", ")} kg × {ex.repsPerSet?.join(", ")} reps
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}