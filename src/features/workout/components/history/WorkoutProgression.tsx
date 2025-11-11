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
import ExerciseDropdown from "./ExerciseDropdown";
import { Check, ChevronDown } from "lucide-react";

interface Props {
  workouts: WorkoutSession[];
  defaultExercise?: string | null;
}

export default function WorkoutProgression({ workouts, defaultExercise }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(
    defaultExercise || null
  );
  const [dateRange, setDateRange] = useState<string>("all");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const dateRangeOptions = [
    { value: "all", label: "All time" },
    { value: "14d", label: "14 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
  ];

  const getDateRangeLabel = (value: string) => {
    return dateRangeOptions.find((opt) => opt.value === value)?.label || "All time";
  };

  useEffect(() => {
    if (!selectedExercise && defaultExercise) {
      setSelectedExercise(defaultExercise);
    }
  }, [defaultExercise, selectedExercise]);

  // 🏋️ Filter workouts by date range
  const filteredWorkouts = useMemo(() => {
    if (dateRange === "all") return workouts;

    const now = new Date();
    let startDate: Date | null = null;

    if (dateRange === "14d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 13);
    } else if (dateRange === "30d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
    } else if (dateRange === "90d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 89);
    }

    if (!startDate) return workouts;

    return workouts.filter((w) => {
      const workoutDate = new Date(w.date);
      workoutDate.setHours(0, 0, 0, 0);
      startDate!.setHours(0, 0, 0, 0);
      return workoutDate >= startDate! && workoutDate <= now;
    });
  }, [workouts, dateRange]);

  // 🏋️ Default = last logged exercise from filtered workouts
  const lastExercise = useMemo(() => {
    if (filteredWorkouts.length === 0) return null;
    const last = filteredWorkouts[0]; // assuming sorted desc by date
    return last.exercises[0]?.name || null;
  }, [filteredWorkouts]);

  const exerciseName = selectedExercise || lastExercise;

  // 🔍 Build history for this exercise from filtered workouts
  const history = useMemo(() => {
    if (!exerciseName) return [];

    return filteredWorkouts
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
  }, [filteredWorkouts, exerciseName]);

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

  // 📝 exercise list from filtered workouts
  const exerciseOptions = useMemo(
    () => [...new Set(filteredWorkouts.flatMap((w) => w.exercises.map((ex) => ex.name)))],
    [filteredWorkouts]
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
    <Card className="bg-black border border-[var(--card-border)] rounded-2xl p-3 text-[var(--text-primary)] shadow-md mb-4">
      <CardContent className="p-0 space-y-2.5">
        {/* Header */}
        <div>
          <h2 className="text-sm font-bold">
            Progression
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Track your 1RM & PR over time</p>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-[1fr_auto] gap-2">
          {/* Exercise Search */}
          <ExerciseDropdown
            value={exerciseName}
            options={exerciseOptions}
            onSelect={(val) => setSelectedExercise(val)}
            placeholder="Search exercise..."
          />

          {/* Date Range Filter */}
          <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
            <PopoverTrigger asChild>
              <button
                className="h-10 px-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-white rounded-xl text-xs font-medium hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm whitespace-nowrap flex items-center gap-2 min-w-[110px] justify-between"
                aria-label="Select date range"
              >
                <span>{getDateRangeLabel(dateRange)}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ${
                    dateRangeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[170px] p-2 bg-[#0a0f1e] border border-blue-500/30 shadow-2xl rounded-xl"
              align="end"
            >
              <div className="flex flex-col gap-0.5">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value);
                      setDateRangeOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer rounded-lg transition-all duration-150 ${
                      dateRange === option.value
                        ? "bg-blue-500/20 text-blue-300 font-semibold"
                        : "text-gray-300 hover:bg-blue-500/10 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {dateRange === option.value && (
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Stat Cards - Compact */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
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

        {/* Chart */}
        {history.length > 0 ? (
          <>
            {/* Empty state helper for single data point */}
            {history.length === 1 && (
              <div className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 flex items-start gap-2">
                <span className="text-xs">💡</span>
                <span>Complete more workouts to see your progress trend over time</span>
              </div>
            )}

            <div className="w-full h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                    tickMargin={5}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "8px 10px"
                    }}
                    labelStyle={{ color: "#60a5fa", fontWeight: 600, marginBottom: "4px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="oneRM"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={renderOneRMDot}
                    name="1RM (Est Max)"
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pr"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={renderPRDot}
                    name="PR (Heaviest)"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Legend */}
            <div className="flex gap-4 text-[10px] text-[var(--text-muted)] justify-center border-t border-[var(--card-border)] pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                <span>1RM (Estimated Max)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                <span>PR (Heaviest Lift)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[130px] text-[var(--text-muted)] text-sm bg-gray-900/30 rounded-lg border border-gray-800">
            <span className="text-3xl mb-2">💪</span>
            <p className="text-xs text-center font-medium">
              No history for <span className="text-white">{exerciseName}</span>
            </p>
            <p className="text-[10px] mt-1.5 text-center opacity-70 px-4">
              Complete a workout to start tracking your strength progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}