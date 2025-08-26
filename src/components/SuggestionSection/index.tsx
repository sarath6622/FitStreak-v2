"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";   // <-- import router
import MuscleGroupSelector from "./MuscleGroupSelector";
import DurationSelector from "./DurationSelector";
import WorkoutPlanDisplay from "./WorkoutPlanDisplay";
import GenerateButton from "./GenerateButton";
import { Sparkles } from "lucide-react";

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

interface SuggestionSectionProps {
  userId: string;
  onSelect?: (muscle: string) => void; // optional callback
}

interface MuscleSummary {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
}

export default function SuggestionSection({ userId, onSelect }: SuggestionSectionProps) {
  const [muscleSummaries, setMuscleSummaries] = useState<MuscleSummary[]>([]);
  const [muscleGroup, setMuscleGroup] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("60 min");
  const [workoutPlan, setWorkoutPlan] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // ✅ initialize router

  // fetch muscle analysis (cached)
  async function fetchMuscleAnalysis() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-muscles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to fetch muscle summary");

      const data = await res.json();
      const summaries =
        typeof data.summary === "string" ? JSON.parse(data.summary) : data.summary;

      setMuscleSummaries(summaries);
      console.log("Summaries",summaries);
      
      localStorage.setItem("muscleSummary", JSON.stringify(summaries));
      localStorage.setItem("muscleSummaryDate", new Date().toDateString());
    } catch (err: any) {
      setError(err.message || "Failed to analyze workout history.");
      setMuscleSummaries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cached = localStorage.getItem("muscleSummary");
    const cachedDate = localStorage.getItem("muscleSummaryDate");
    const today = new Date().toDateString();

    if (cached && cachedDate === today) {
      setMuscleSummaries(JSON.parse(cached));
    } else {
      fetchMuscleAnalysis();
    }
  }, [userId]);

  // generate workout
  const handleGenerate = async () => {
    if (muscleGroup.length === 0 || !duration) return;
    setLoading(true);
    setWorkoutPlan([]);
    setError(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, muscleGroups: muscleGroup, duration }),
      });
      if (!res.ok) throw new Error("Failed to generate workout plan.");

      const data = await res.json();
      const parsed =
        typeof data.recommendation === "string"
          ? JSON.parse(data.recommendation)
          : data.recommendation;

      setWorkoutPlan(parsed || []);
    } catch (err: any) {
      setError(err.message || "Failed to generate workout.");
    } finally {
      setLoading(false);
    }
  };

  // save + navigate
  const handleStartWorkout = async () => {
    if (!userId || workoutPlan.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/save-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, muscleGroups: muscleGroup, workoutPlan }),
      });
      if (!res.ok) throw new Error("Failed to save workout");

      // ✅ navigate after save
      router.push("/workouts/todays-workouts");
    } catch (err: any) {
      setError(err.message || "Failed to save workout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-md font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-300" />
        Workout Suggestions
        <button
          onClick={fetchMuscleAnalysis}
          disabled={loading}
          className="ml-auto px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          Re-Analyze
        </button>
      </h2>

      <MuscleGroupSelector
        value={muscleGroup}
        onChange={(groups) => {
          setMuscleGroup(groups);
          if (onSelect && groups.length === 1) {
            onSelect(groups[0]);
          }
        }}
        summaries={muscleSummaries}
      />

      <DurationSelector value={duration} onChange={setDuration} />
      <GenerateButton onClick={handleGenerate} loading={loading} />

      {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}

      {workoutPlan.length > 0 && (
        <div className="mt-6">
          <WorkoutPlanDisplay plan={workoutPlan} />
          <button
            onClick={handleStartWorkout}
            disabled={saving}
            className="mt-4 w-full py-2 rounded font-semibold bg-blue-500 text-white hover:bg-blue-600 shadow-md disabled:opacity-50"
          >
            {saving ? "Starting workout..." : "Start Workout"}
          </button>
        </div>
      )}
    </div>
  );
}