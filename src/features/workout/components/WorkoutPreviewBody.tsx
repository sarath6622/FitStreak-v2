"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Activity, Info } from "lucide-react";
import clsx from "clsx";

interface Exercise {
  name: string;
  muscleGroup: string;
  subGroup?: string;
  equipment?: string[];
  movementType?: string;
  difficulty?: string;
  sets: number;
  reps?: string;
  notes?: string;
  secondaryMuscleGroups?: string[];
}

interface WorkoutPlanListCardProps {
  exercises: Exercise[];
  selectedMuscles?: string[];
  duration?: string;
}

// Equipment icons mapping
const equipmentIcons: Record<string, string> = {
  dumbbells: "🏋️",
  barbell: "💪",
  cable: "⚙️",
  bodyweight: "🧘",
  machine: "🔧",
  kettlebell: "⚖️",
  "resistance band": "🔗",
};

const getEquipmentIcon = (equipment: string[] | undefined) => {
  if (!equipment || equipment.length === 0) return "🏋️";
  const firstEquip = equipment[0]?.toLowerCase() || "";
  return equipmentIcons[firstEquip] || "🏋️";
};

export default function WorkoutPlanListCard({
  exercises,
  selectedMuscles = [],
  duration = "60 min"
}: WorkoutPlanListCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Group exercises by muscle group
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const muscle = exercise.muscleGroup || "Other";
    if (!acc[muscle]) {
      acc[muscle] = [];
    }
    acc[muscle].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  // Calculate totals
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
  const uniqueMuscles = Object.keys(groupedExercises);

  // Estimate duration (rough: 5 min per exercise)
  const estimatedMinutes = totalExercises * 5;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (!exercises || exercises.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[var(--surface-dark)] border border-[var(--card-border)]">
        <p className="text-xs text-[var(--text-muted)] italic">
          No exercises in this plan.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-4 overflow-y-auto max-h-[50vh]">
      {/* Workout Summary Header */}
      <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-1">
              {uniqueMuscles.join(", ")}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                ~{estimatedMinutes} min
              </span>
              <span>{totalExercises} exercises</span>
              <span>{totalSets} total sets</span>
            </div>
          </div>
        </div>
        {selectedMuscles.length > 0 && (
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-400">Selected:</span> {selectedMuscles.join(", ")}
          </div>
        )}
      </div>

      {/* Exercises Grouped by Muscle */}
      <div className="space-y-4">
        {Object.entries(groupedExercises).map(([muscle, exs]) => (
          <div key={muscle}>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                {muscle} ({exs.length})
              </h4>
              <div className="h-px flex-1 bg-gradient-to-l from-blue-500/50 to-transparent" />
            </div>

            <div className="space-y-2">
              {exs.map((ex) => {
                const globalIdx = exercises.indexOf(ex);
                const isExpanded = expandedIndex === globalIdx;

                return (
                  <div
                    key={globalIdx}
                    className={clsx(
                      "rounded-xl border transition-all duration-200",
                      isExpanded
                        ? "bg-blue-500/10 border-blue-500/50"
                        : "bg-[var(--surface-light)] border-[var(--card-border)] hover:border-gray-600"
                    )}
                  >
                    {/* Main Exercise Row */}
                    <button
                      onClick={() => toggleExpand(globalIdx)}
                      className="w-full p-3 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{getEquipmentIcon(ex.equipment)}</span>
                        <div className="flex-1">
                          <p className="text-[var(--text-primary)] font-medium text-sm">
                            {ex.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-blue-400 font-medium">
                              {ex.sets} sets × {ex.reps || "8-12 reps"}
                            </span>
                            {ex.difficulty && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                                {ex.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-blue-500/20">
                        <div className="pt-2 space-y-1.5 text-xs">
                          {ex.subGroup && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[80px]">Target:</span>
                              <span className="text-gray-300">{ex.subGroup}</span>
                            </div>
                          )}
                          {ex.equipment && ex.equipment.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[80px]">Equipment:</span>
                              <span className="text-gray-300">{ex.equipment.join(", ")}</span>
                            </div>
                          )}
                          {ex.movementType && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[80px]">Movement:</span>
                              <span className="text-gray-300">{ex.movementType}</span>
                            </div>
                          )}
                          {ex.secondaryMuscleGroups && ex.secondaryMuscleGroups.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[80px]">Secondary:</span>
                              <span className="text-gray-300">{ex.secondaryMuscleGroups.join(", ")}</span>
                            </div>
                          )}
                          {ex.notes && (
                            <div className="flex items-start gap-2 mt-2 p-2 rounded bg-blue-500/5">
                              <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 leading-relaxed">{ex.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}