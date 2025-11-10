import clsx from "clsx";
import { Check, Info } from "lucide-react";
import { recoveryTimes } from "@/features/workout/utils/recoveryTimes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/shared/ui/tooltip";

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
];

function getRecoveryStatus(group: string, daysAgo: number) {
  const recoveryDays = recoveryTimes[group] || 3;

  // Recovered and ready to train (past optimal recovery)
  if (daysAgo >= recoveryDays) {
    const weeksOverdue = Math.floor((daysAgo - recoveryDays) / 7);

    // If it's been more than 2 weeks past recovery, suggest prioritizing
    if (weeksOverdue >= 2) {
      return {
        status: "priority",
        label: "Priority",
        description: "Consider training soon",
        color: "bg-amber-500",
        textColor: "text-amber-400",
        borderColor: "border-amber-500/30",
        bgGradient: "from-amber-500/10 to-amber-500/5",
        progress: 100,
        order: 1
      };
    }

    return {
      status: "ready",
      label: "Ready",
      description: "Fully recovered",
      color: "bg-blue-500",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgGradient: "from-blue-500/10 to-blue-500/5",
      progress: 100,
      order: 2
    };
  } else {
    // Still recovering
    const daysLeft = recoveryDays - daysAgo;
    const progress = Math.floor((daysAgo / recoveryDays) * 100);
    return {
      status: "recovering",
      label: "Recovering",
      description: `${daysLeft}d until recovered`,
      color: "bg-gray-500",
      textColor: "text-gray-400",
      borderColor: "border-gray-700",
      bgGradient: "from-gray-800 to-gray-900",
      progress,
      order: 3,
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

  // sort by urgency: Priority → Ready → Recovering
  const sorted = enriched.sort((a, b) => {
    if (!a.recovery || !b.recovery) return 0;
    if (a.recovery.order !== b.recovery.order) {
      return a.recovery.order - b.recovery.order;
    }
    // if both are recovering, sort by highest progress first
    if (a.recovery.status === "recovering" && b.recovery.status === "recovering") {
      return b.recovery.progress - a.recovery.progress;
    }
    return 0;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-sm font-semibold text-gray-300 tracking-wide">
          Select Muscle Groups
        </h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-500 hover:text-gray-300 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm">
                Select one or more muscle groups. Priority muscles haven&apos;t been trained in 2+ weeks.
                Recovering muscles are still resting.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map(({ group, summary, recovery }) => {
          const selected = value.includes(group);

          return (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={clsx(
                "relative p-4 rounded-xl transition-all duration-200 text-left",
                "border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black",
                "hover:scale-[1.02] active:scale-[0.98]",
                selected
                  ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-500/5 shadow-lg shadow-blue-500/20"
                  : recovery
                  ? `border-transparent bg-gradient-to-br ${recovery.bgGradient} ${recovery.borderColor} hover:border-gray-700`
                  : "border-gray-800 bg-gray-900 hover:border-gray-700"
              )}
              aria-pressed={selected}
              aria-label={`${group} muscle group, ${recovery?.label || 'Unknown status'}`}
            >
              {/* Checkmark when selected */}
              {selected && (
                <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1.5 shadow-lg">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-[15px] text-white">
                  {group}
                </span>

                {recovery && (
                  <>
                    <span className={clsx("text-xs font-medium", recovery.textColor)}>
                      {recovery.label}
                    </span>
                    {summary && (
                      <span className="text-[11px] text-gray-500">
                        {summary.daysAgo === 0 ? "Today" :
                         summary.daysAgo === 1 ? "Yesterday" :
                         `${summary.daysAgo}d ago`}
                      </span>
                    )}

                    {/* Recovery progress bar */}
                    <div className="mt-2 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          recovery.color
                        )}
                        style={{ width: `${recovery.progress}%` }}
                        role="progressbar"
                        aria-valuenow={recovery.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Recovery progress"
                      />
                    </div>
                  </>
                )}

                {!recovery && (
                  <span className="text-xs text-gray-500">No data yet</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-400" />
          <span>{value.length} muscle group{value.length > 1 ? 's' : ''} selected</span>
        </div>
      )}
    </div>
  );
}
