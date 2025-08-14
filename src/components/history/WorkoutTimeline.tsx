import { WorkoutSession } from "@/types";
import { formatDate } from "@/lib/historyUtils";

interface Props {
  workouts: WorkoutSession[];
}

export default function WorkoutTimeline({ workouts }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Timeline</h2>
      {workouts.map((w, idx) => (
        <div key={idx} className="bg-gray-900 p-4 rounded-lg mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">{formatDate(w.date)}</span>
            <span className="text-gray-400">{w.duration} min</span>
          </div>
          {w.exercises.map((ex, i) => (
            <div key={i} className="flex justify-between text-sm border-t border-gray-700 pt-1 mt-1">
              <span>{ex.name}</span>
              <span>
                {ex.weight.join(", ")} kg x {ex.repsPerSet?.join(", ")} reps
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}