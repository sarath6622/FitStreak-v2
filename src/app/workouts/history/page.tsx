"use client";

import { useState, useMemo } from "react";
import workoutData from "@/data/workoutHistory.json";
import { Filter, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Navbar from "@/components/Navbar";

import { toast } from "sonner";

toast.success("Operation successful!");
toast.error("Oops! Something went wrong.");
toast("This is a basic toast");
// -------------------- Types --------------------
interface Exercise {
  exerciseId: number;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number[];
  rest: number;
  intensity: string;
  completed: boolean;
}

interface WorkoutSession {
  date: string;
  duration: number;
  notes: string;
  exercises: Exercise[];
}

// -------------------- Utilities --------------------
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const getPRs = (history: WorkoutSession[]): Record<string, number> => {
  const prs: Record<string, number> = {};
  history.forEach((session) => {
    session.exercises.forEach((ex) => {
      const maxWeight = Math.max(...ex.weight);
      if (!prs[ex.name] || maxWeight > prs[ex.name]) {
        prs[ex.name] = maxWeight;
      }
    });
  });
  return prs;
};

const getExerciseChartData = (
  history: WorkoutSession[],
  exerciseName: string
) => {
  return history
    .filter((session) =>
      session.exercises.some((ex) => ex.name === exerciseName)
    )
    .map((session) => {
      const ex = session.exercises.find((e) => e.name === exerciseName)!;
      return {
        date: formatDate(session.date),
        topWeight: Math.max(...ex.weight),
      };
    });
};

// -------------------- Component --------------------
export default function HistoryPage() {
  const [selectedExercise, setSelectedExercise] = useState<string>("Squats");

  const prs = useMemo(() => getPRs(workoutData as WorkoutSession[]), []);
  const chartData = useMemo(
    () => getExerciseChartData(workoutData as WorkoutSession[], selectedExercise),
    [selectedExercise]
  );

  const allExercises = Array.from(
    new Set(
      (workoutData as WorkoutSession[]).flatMap((s) =>
        s.exercises.map((e) => e.name)
      )
    )
  );

  return (
    <main className="max-w-2xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white px-2">Workout History</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} /> Filter
        </Button>
      </div>

      {/* Exercise Progress Chart */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-400" size={20} />
            <h2 className="font-semibold text-white">Progress</h2>
          </div>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
          >
            {allExercises.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none" }}
              />
              <Line
                type="monotone"
                dataKey="topWeight"
                stroke="#facc15"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </main>
  );
}