"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkoutSession } from "@/types";
import { calculate1RM } from "@/utils/strength";
import { Card, CardContent } from "@/components/ui/card";
import StatCard from "./StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Props {
  workouts: WorkoutSession[];
  defaultExercise?: string | null;
}

export default function WorkoutProgression({
  workouts,
  defaultExercise,
}: Props) {
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

  // 🔍 Get history for this exercise
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
    .filter((item): item is { date: string; oneRM: number; pr: number } => Boolean(item)) // ✅ type guard
    .reverse();
}, [workouts, exerciseName]);

  // 📊 calculate deltas correctly
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

  // 📝 unique exercise list
  const exerciseOptions = useMemo(
    () => [...new Set(workouts.flatMap((w) => w.exercises.map((ex) => ex.name)))],
    [workouts]
  );

  return (
    <Card className="bg-gradient-to-b from-[#0d0f1a] to-[#161a2b] border border-gray-700 rounded-2xl p-3 text-white shadow-md mb-4">
      <CardContent className="p-0 space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-base font-semibold">
            Progression <span className="text-gray-400 text-xs">(1RM & PR)</span>
          </h2>

                  {/* Stat Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-2">
            <StatCard
              label="1RM"
              value={`${history[history.length - 1].oneRM}kg`}
              change={oneRMChange}
              color="text-green-400"
            />
            <StatCard
              label="PR"
              value={`${history[history.length - 1].pr}kg`}
              change={prChange}
              color="text-blue-400"
            />
          </div>
        )}

          {/* 🚀 Searchable Popover Dropdown */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="w-full sm:w-48 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-left text-sm">
                {exerciseName || "Choose exercise"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[250px] bg-gray-900 border border-gray-700 text-white">
              <Command>
                <CommandInput placeholder="Search exercise..." />
                <CommandList className="max-h-[25vh] overflow-y-auto">
                  <CommandEmpty>No exercise found.</CommandEmpty>
                  <CommandGroup>
                    {exerciseOptions.map((name) => (
                      <CommandItem
                        key={name}
                        onSelect={() => {
                          setSelectedExercise(name);
                          setOpen(false);
                        }}
                      >
                        {name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Legends */}
        <div className="flex gap-4 text-xs text-gray-400 mb-1">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-green-400"></span> 1RM
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-blue-400"></span> PR
          </div>
        </div>

        {/* Chart */}
        {history.length > 0 ? (
          <div className="w-full h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={history}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #444",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "white" }}
                />
                <Line
                  type="monotone"
                  dataKey="oneRM"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="1RM"
                />
                <Line
                  type="monotone"
                  dataKey="pr"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="PR"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 text-sm">
            <span className="text-2xl mb-2">💪</span>
            No history found for{" "}
            <span className="font-semibold">{exerciseName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}