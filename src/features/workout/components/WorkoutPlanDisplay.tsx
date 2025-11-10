import { Dumbbell, Clock, ClipboardList } from "lucide-react";

interface Exercise {
  name: string;
  muscleGroup: string;
  subGroup: string;
  equipment: string[];
  movementType: string;
  difficulty: string;
  secondaryMuscleGroups: string[];
  sets: number;
  reps: string;
  notes: string;
}

interface WorkoutPlanDisplayProps {
  plan: Exercise[];
}

export default function WorkoutPlanDisplay({ plan }: WorkoutPlanDisplayProps) {
  if (!plan.length) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 text-base italic">
          No workout plan generated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {plan.map((ex, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-gray-900 p-3 shadow hover:shadow-lg transition duration-200 border border-gray-700"
        >
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-100 mb-1 truncate">
            {ex.name}
          </h3>

          {/* Meta info */}
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            {ex.muscleGroup} • {ex.movementType} • {ex.difficulty}
          </p>

          {/* Sets/Reps */}
          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
            <span className="font-medium">Sets/Reps:</span>{" "}
            {ex.sets} × {ex.reps}
          </div>

          {/* Notes */}
          {ex.notes && (
            <div className="flex items-start gap-1 text-xs text-gray-400">
              <span className="line-clamp-2">{ex.notes}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}