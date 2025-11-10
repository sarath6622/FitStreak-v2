import { WorkoutSession } from "@/features/shared/types";
import { formatDate } from "@/features/history/utils/historyUtils";
import {
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { calculate1RM } from "@/features/workout/utils/strength";
import { useState } from "react";

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

// 🎨 muscle group colors (fallback accents)
const muscleColors: Record<string, string> = {
  Chest: "bg-[var(--accent-red)]",
  Shoulders: "bg-[var(--accent-yellow)]",
  Back: "bg-[var(--accent-blue)]",
  Biceps: "bg-[var(--accent-green)]",
  Triceps: "bg-[var(--accent-purple)]",
  Legs: "bg-pink-400", // you can add --accent-pink if you want
  Core: "bg-orange-400", // or --accent-orange
  default: "bg-[var(--text-muted)]",
};

const fallbackColors = [
  "bg-[var(--accent-red)]",
  "bg-[var(--accent-yellow)]",
  "bg-[var(--accent-blue)]",
  "bg-[var(--accent-green)]",
  "bg-[var(--accent-purple)]",
  "bg-pink-400",
  "bg-orange-400",
];

// 📈 Get previous 1RM for an exercise
function getPrevious1RM(
  workouts: WorkoutSession[],
  currentIndex: number,
  exerciseName: string
): number | null {
  for (let i = currentIndex + 1; i < workouts.length; i++) {
    const prev = workouts[i].exercises.find((ex) => ex.name === exerciseName);
    if (prev) {
      return getExercise1RM(prev.weight, prev.repsPerSet || []);
    }
  }

  return null;
}

export default function WorkoutTimeline({ workouts }: Props) {
  const [openExercise, setOpenExercise] = useState<string | null>(null);

  const toggleAccordion = (exerciseId: string) => {
    setOpenExercise(openExercise === exerciseId ? null : exerciseId);
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-1 mb-3">
        <CalendarDays className="w-4 h-4 text-[var(--text-secondary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Timeline</h2>
      </div>

      {workouts.map((w, idx) => (
        <div
          key={idx}
          className="bg-[var(--card-background)] border border-[var(--card-border)] shadow-[var(--card-shadow)] p-3 rounded-xl mb-3 transition hover:shadow-lg"
        >
          {/* Date + Duration */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--text-primary)] font-medium">
              {formatDate(w.date)}
            </span>
            <span className="bg-[var(--surface-hover)] text-[var(--text-secondary)] text-[11px] px-1.5 py-0.5 rounded-full">
              {w.duration} min
            </span>
          </div>

          {/* Exercises summary */}
          <div className="space-y-1">
            {w.exercises.map((ex, i) => {
              const oneRM = getExercise1RM(ex.weight, ex.repsPerSet || []);
              const prev1RM = getPrevious1RM(workouts, idx, ex.name);

              // trend calc
              let trend = null;
              if (prev1RM !== null) {
                const diff = oneRM - prev1RM;
                if (diff > 0) {
                  trend = (
                    <span className="flex items-center text-[var(--accent-green)] text-xs ml-2">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{diff}kg
                    </span>
                  );
                } else if (diff < 0) {
                  trend = (
                    <span className="flex items-center text-red-400 text-xs ml-2">
                      <ArrowDownRight className="w-3 h-3 mr-0.5" /> {diff}kg
                    </span>
                  );
                } else {
                  trend = (
                    <span className="flex items-center text-[var(--text-muted)] text-xs ml-2">
                      <Minus className="w-3 h-3 mr-0.5" /> 0
                    </span>
                  );
                }
              }

              const colorClass =
                muscleColors[ex.muscleGroup || ""] ||
                fallbackColors[i % fallbackColors.length];

              const exerciseId = `${idx}-${i}`;
              const isOpen = openExercise === exerciseId;

              return (
                <div key={i} className="border-b border-[var(--card-border)] last:border-0">
                  {/* Row */}
                  <div
                    onClick={() => toggleAccordion(exerciseId)}
                    className="grid grid-cols-[60%_20%_20%] items-center py-1 cursor-pointer hover:bg-[var(--surface-hover)] rounded-lg px-2"
                  >
                    {/* Col 1: exercise */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                      <span className="text-sm text-[var(--text-primary)] truncate">
                        {ex.name}
                      </span>
                    </div>

                    {/* Col 2: trend */}
                    <div className="flex justify-center whitespace-nowrap">
                      {trend ? (
                        <div className="flex items-center gap-0.5 text-xs">
                          {trend}
                        </div>
                      ) : (
                        <span className="text-xs text-transparent">--</span>
                      )}
                    </div>

                    {/* Col 3: 1RM */}
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                      <span className="text-xs text-[var(--text-secondary)] font-mono">
                        1RM{" "}
                        <span className="font-bold text-[var(--text-primary)]">
                          {oneRM > 0 ? `${oneRM}kg` : "-"}
                        </span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </div>
                  </div>

                  {/* Accordion content */}
                  {isOpen && (
                    <div className="pl-6 pr-2 py-2 space-y-1 text-xs text-[var(--text-secondary)]">
                      {/* Full exercise name */}
                      <div className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                        {ex.name}
                      </div>

                      {/* Sets/reps */}
                      {ex.weight.map((wVal, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex justify-between border-b border-[var(--card-border)] last:border-0 pb-1"
                        >
                          <span>Set {sIdx + 1}</span>
                          <span>
                            {wVal}kg × {ex.repsPerSet?.[sIdx] || 0} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}