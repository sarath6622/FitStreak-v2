import clsx from "clsx";
import { Check } from "lucide-react";
import { recoveryTimes } from "@/lib/recoveryTimes";

interface MuscleSummary {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
}

interface MuscleGroupSelectorProps {
  value: string[];
  onChange: (val: string[]) => void;
  summaries?: MuscleSummary[];
}

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Abs",
  "Full Body",
];

function getRecoveryStatus(group: string, daysAgo: number) {
  const recoveryDays = recoveryTimes[group] || 3;

  if (daysAgo >= recoveryDays + 3) {
    return { status: "overdue", label: "Overdue", color: "bg-red-500", progress: 100, order: 1 };
  } else if (daysAgo >= recoveryDays) {
    return { status: "ready", label: "Ready", color: "bg-green-500", progress: 100, order: 3 };
  } else {
    const daysLeft = recoveryDays - daysAgo;
    const progress = Math.floor((daysAgo / recoveryDays) * 100);
    return {
      status: "resting",
      label: `Resting (${daysLeft}d left)`,
      color: "bg-yellow-500",
      progress,
      order: 2,
    };
  }
}

export default function MuscleGroupSelector({
  value,
  onChange,
  summaries,
}: MuscleGroupSelectorProps) {
  const toggleGroup = (group: string) => {
    if (value.includes(group)) {
      onChange(value.filter((g) => g !== group));
    } else {
      onChange([...value, group]);
    }
  };

  // build enriched data with status
  const enriched = muscleGroups.map((group) => {
    const summary = summaries?.find((s) => s.muscleGroup === group);
    const recovery = summary ? getRecoveryStatus(group, summary.daysAgo) : null;
    return { group, summary, recovery };
  });

  // sort by urgency
  const sorted = enriched.sort((a, b) => {
    if (!a.recovery || !b.recovery) return 0;
    if (a.recovery.order !== b.recovery.order) {
      return a.recovery.order - b.recovery.order;
    }
    // if both are resting, sort by fewer days left first
    if (a.recovery.status === "resting" && b.recovery.status === "resting") {
      return a.recovery.progress - b.recovery.progress;
    }
    return 0;
  });

  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 tracking-wide">
        Choose Muscle Groups
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map(({ group, summary, recovery }) => {
          const selected = value.includes(group);

          return (
            <div
              key={group}
              onClick={() => toggleGroup(group)}
              className={clsx(
                "relative p-4 rounded-xl cursor-pointer transition-all shadow-sm hover:scale-[1.02]",
                selected
                  ? "bg-[var(--accent-blue)]/10 ring-2 ring-[var(--accent-blue-ring)]"
                  : "bg-[var(--surface-dark)]"
              )}
            >
              {/* Checkmark when selected */}
              {selected && (
                <div className="absolute top-2 right-2 bg-[var(--accent-blue)] rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-medium text-sm text-white">{group}</span>
                {recovery && (
                  <>
                    <span className={clsx("text-xs font-semibold", recovery.color.replace("bg", "text"))}>
                      {recovery.label}
                    </span>
                    {summary && (
                      <span className="text-[11px] text-gray-400">
                        Last trained: {summary.daysAgo}d ago
                      </span>
                    )}

                    {/* Tiny progress bar */}
                    <div className="mt-1 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={clsx("h-1.5 rounded-full", recovery.color)}
                        style={{ width: `${recovery.progress}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}