"use client";

import { useState, useMemo } from "react";
import workoutData from "@/data/workoutHistory.json";
import { getPRs, getExerciseChartData } from "@/lib/historyUtils";
import HistoryHeader from "./HistoryHeader";
import PRSection from "./PRSection";
import ProgressChartSection from "./ProgressChartSection";
import TimelineSection from "./TimelineSection";

export default function HistoryContainer() {
  const [selectedExercise, setSelectedExercise] = useState<string>("Squats");

  const prs = useMemo(() => getPRs(workoutData), []);
  const chartData = useMemo(
    () => getExerciseChartData(workoutData, selectedExercise),
    [selectedExercise]
  );

  const allExercises = Array.from(
    new Set(workoutData.flatMap((s) => s.exercises.map((e) => e.name)))
  );

  return (
    <main className="max-w-2xl m-2 py-6 space-y-6">
      <HistoryHeader />
      <PRSection prs={prs} />
      <ProgressChartSection
        allExercises={allExercises}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        chartData={chartData}
      />
      <TimelineSection workoutData={workoutData} />
    </main>
  );
}