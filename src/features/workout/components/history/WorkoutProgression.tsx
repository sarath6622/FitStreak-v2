"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkoutSession } from "@/features/shared/types";
import { calculate1RM } from "@/features/workout/utils/strength";
import { Card, CardContent } from "@/features/shared/ui/card";
import StatCard from "@/features/shared/components/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/features/shared/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/features/shared/ui/command";
import ExerciseDropdown from "./ExerciseDropdown";

interface Props {
  workouts: WorkoutSession[];
  defaultExercise?: string | null;
}

export default function WorkoutProgression({ workouts, defaultExercise }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(
    defaultExercise || null
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!selectedExercise && defaultExercise) {
      setSelectedExercise(defaultExercise);
    }
  }, [defaultExercise, selectedExercise]);

  // 🏋️ Default = last logged exercise
  const lastExercise = useMemo(() => {
    if (workouts.length === 0) return null;
    const last = workouts[0]; // assuming sorted desc by date
    return last.exercises[0]?.name || null;
  }, [workouts]);

  const exerciseName = selectedExercise || lastExercise;

  // 🔍 Build history for this exercise
  const history = useMemo(() => {
    if (!exerciseName) return [];

    return workouts
      .map((w) => {
        const ex = w.exercises.find((e) => e.name === exerciseName);
        if (!ex) return null;

        const oneRM = ex.weight.map((wVal, i) =>
          calculate1RM(wVal, ex.repsPerSet?.[i] || 0)
        );
        const max1RM = oneRM.length ? Math.max(...oneRM) : 0;
        const bestPR = ex.weight.length ? Math.max(...ex.weight) : 0;

        return {
          date: new Date(w.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          oneRM: max1RM,
          pr: bestPR,
        };
      })
      .filter((item): item is { date: string; oneRM: number; pr: number } =>
        Boolean(item)
      )
      .reverse();
  }, [workouts, exerciseName]);

  // 📊 calculate deltas
  const prChange =
    history.length > 1
      ? ((history[history.length - 1].pr - history[0].pr) / history[0].pr) * 100
      : 0;

  const oneRMChange =
    history.length > 1
      ? ((history[history.length - 1].oneRM - history[0].oneRM) /
          history[0].oneRM) *
        100
      : 0;

  // 📝 exercise list
  const exerciseOptions = useMemo(
    () => [...new Set(workouts.flatMap((w) => w.exercises.map((ex) => ex.name)))],
    [workouts]
  );

  // 🎯 highlight latest point in the chart
  const latestIndex = history.length > 0 ? history.length - 1 : -1;
  const latestPoint = latestIndex >= 0 ? history[latestIndex] : null;
  const renderOneRMDot = (props: any) => {
    const { cx, cy, index } = props;
    const isLatest = index === latestIndex;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isLatest ? 5 : 2}
        fill={isLatest ? 'var(--accent-green)' : 'var(--accent-green)'}
        stroke={isLatest ? '#fff' : 'none'}
        strokeWidth={isLatest ? 2 : 0}
      />
    );
  };
  const renderPRDot = (props: any) => {
    const { cx, cy, index } = props;
    const isLatest = index === latestIndex;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isLatest ? 5 : 2}
        fill={isLatest ? 'var(--accent-blue)' : 'var(--accent-blue)'}
        stroke={isLatest ? '#fff' : 'none'}
        strokeWidth={isLatest ? 2 : 0}
      />
    );
  };

  return (
    <Card className="bg-black border border-[var(--card-border)] rounded-2xl p-4 text-[var(--text-primary)] shadow-md mb-6">
      <CardContent className="p-0 space-y-4">
        {/* Header + Dropdown (shows current exercise inside the input) */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-base font-semibold">
            Progression{" "}
            <span className="text-[var(--text-muted)] text-xs">(1RM & PR)</span>
          </h2>

          <ExerciseDropdown
            value={exerciseName}
            options={exerciseOptions}
            onSelect={(val) => setSelectedExercise(val)}
            placeholder="Search exercise..."
          />
        </div>

        {/* Stat Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="1RM"
              value={`${history[history.length - 1].oneRM}kg`}
              change={oneRMChange}
              color="text-[var(--accent-green)]"
            />
            <StatCard
              label="PR"
              value={`${history[history.length - 1].pr}kg`}
              change={prChange}
              color="text-[var(--accent-blue)]"
            />
          </div>
        )}

        {/* Legends */}
        <div className="flex gap-6 text-xs text-[var(--text-muted)] mt-1">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-[var(--accent-green)]"></span>
            1RM
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-[var(--accent-blue)]"></span>
            PR
          </div>
          {/* removed separate current badge; input shows current selection */}
        </div>

        {/* Chart */}
        {history.length > 0 ? (
          <div className="w-full h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={history}
                margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--card-border)"
                />
                {latestPoint && (
                  <ReferenceLine
                    x={latestPoint.date}
                    stroke="rgba(255,255,255,0.2)"
                    strokeDasharray="3 3"
                  />
                )}
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-dark)",
                    border: "1px solid var(--card-border)",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                  }}
                  labelStyle={{ color: "var(--accent-highlight)" }}
                />
                <Line
                  type="monotone"
                  dataKey="oneRM"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  dot={renderOneRMDot}
                  name="1RM"
                />
                <Line
                  type="monotone"
                  dataKey="pr"
                  stroke="var(--accent-blue)"
                  strokeWidth={2}
                  dot={renderPRDot}
                  name="PR"
                />
                {latestPoint && (
                  <ReferenceDot
                    x={latestPoint.date}
                    y={latestPoint.oneRM}
                    r={6}
                    fill="transparent"
                    stroke="#fff"
                    strokeWidth={2}
                    label={{ value: exerciseName || 'Current', position: 'top', fill: 'var(--text-secondary)', fontSize: 10 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] text-[var(--text-muted)] text-sm">
            <span className="text-2xl mb-2">💪</span>
            No history found for{" "}
            <span className="font-semibold text-[var(--text-secondary)]">
              {exerciseName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}