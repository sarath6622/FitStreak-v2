"use client";

import { Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import clsx from 'clsx';
// import { sum } from "firebase/firestore"; // This import is not used

interface SuggestionSectionProps {
  userId: string;
  onSelect: (muscle: string) => void;
}

interface MuscleSummary {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
}

interface WorkoutPlan {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

function getColorClass(daysAgo: number, selected: boolean) {
  if (daysAgo >= 5)
    return selected
      ? "bg-red-600 text-white ring-2 ring-red-300"
      : "bg-red-100 text-red-800 hover:bg-red-200";
  if (daysAgo >= 2)
    return selected
      ? "bg-yellow-500 text-gray-900 ring-2 ring-yellow-300"
      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  return selected
    ? "bg-gray-500 text-white ring-2 ring-gray-300"
    : "bg-gray-100 text-gray-800 hover:bg-gray-200";
}

export default function SuggestionSection({ userId, onSelect }: SuggestionSectionProps) {
  const [muscleSummaries, setMuscleSummaries] = useState<MuscleSummary[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(60); // Default to 60 minutes
  const [status, setStatus] = useState<"idle" | "analyzing" | "generating" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const availableDurations = [30, 45, 60, 90, 120];

  async function fetchMuscleAnalysis() {
    if (!userId) return;
    setStatus("analyzing");
    setError(null);
    try {
      const res = await fetch("/api/analyze-muscles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to fetch muscle summary");
      const data = await res.json();

      let summaries;
      if (typeof data.summary === 'string') {
        summaries = JSON.parse(data.summary);
      } else {
        summaries = data.summary;
      }

      setMuscleSummaries(summaries);
      console.log(summaries);
      
      // Cache the result in localStorage
      localStorage.setItem("muscleSummary", JSON.stringify(summaries));
      localStorage.setItem("muscleSummaryDate", new Date().toDateString());
    } catch (err: any) {
      console.error("Failed to fetch muscle summary", err);
      setError(err.message || "Failed to analyze workout history.");
      setMuscleSummaries([]);
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    // Try to read from localStorage first
    const cached = localStorage.getItem("muscleSummary");
    const cachedDate = localStorage.getItem("muscleSummaryDate");
    const today = new Date().toDateString();

    if (cached && cachedDate === today) {
      setMuscleSummaries(JSON.parse(cached));
    } else {
      // If no valid cache, fetch from API
      fetchMuscleAnalysis();
    }
  }, [userId]);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) => {
      const updated = prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle];
      setWorkoutPlan(null);
      return updated;
    });
  };

  const startWorkout = async () => {
    if (!userId || !workoutPlan) return;
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/save-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          muscleGroups: selectedMuscles,
          workoutPlan,
        }),
      });
      if (!res.ok) throw new Error("Failed to save workout");
      onSelect(selectedMuscles.join(", "));
    } catch (err: any) {
      console.error("[Save Workout]", err);
      setError(err.message || "Failed to save workout.");
    } finally {
      setStatus("idle");
    }
  };

  const generateWorkout = async () => {
    if (selectedMuscles.length === 0) return;
    setStatus("generating");
    setWorkoutPlan(null);
    setError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          muscleGroups: selectedMuscles,
          duration: selectedDuration,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate workout plan.");
      const data = await res.json();
      const parsedPlan: WorkoutPlan[] = JSON.parse(data.recommendation);
      setWorkoutPlan(parsedPlan);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate workout plan.");
    } finally {
      setStatus("idle");
    }
  };

  const isGenerating = status === "generating";
  const isAnalyzing = status === "analyzing";
  const isSaving = status === "saving";
  const canGenerate = selectedMuscles.length > 0 && !isGenerating && !isAnalyzing;

  return (
    <div className="max-w-md mx-auto p-5 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
      <h2 className="flex items-center text-blue-400 font-semibold text-lg mb-4">
        Suggested for You
        {/* Re-Analyze Button (outside the pills) */}
        <button
          onClick={fetchMuscleAnalysis}
          disabled={isAnalyzing}
          className={clsx(
            "ml-auto px-3 py-1 rounded-full text-sm font-medium transition-all",
            "bg-gray-700 text-gray-300 hover:bg-gray-600",
            { "opacity-50 cursor-not-allowed": isAnalyzing }
          )}
        >
          {isAnalyzing ? "Analyzing..." : "Re-Analyze"}
        </button>
      </h2>

      {/* Muscle Group Pills */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">
          Choose Muscle Groups
        </h4>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg">
          {isAnalyzing ? (
            <p className="text-blue-300 text-sm animate-pulse">Analyzing workout history...</p>
          ) : (
            muscleSummaries
              .filter((m) => m.daysAgo !== 0)
              .map((m) => {
                const selected = selectedMuscles.includes(m.muscleGroup);
                return (
                  <button
                    key={m.muscleGroup}
                    onClick={() => toggleMuscle(m.muscleGroup)}
                    disabled={isGenerating || isAnalyzing}
                    className={clsx(
                      "px-3 py-1 rounded-full text-sm font-medium transition-all",
                      selected
                        ? "bg-blue-600 text-white ring-2 ring-blue-300 scale-105"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                    title={`Last trained ${m.daysAgo} day${m.daysAgo === 1 ? "" : "s"} ago (${m.lastTrained})`}
                  >
                    {m.muscleGroup}
                    <span className="opacity-70 text-xs ml-1">– {m.daysAgo}d</span>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* Planned duration pills */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">
          Choose Duration
        </h4>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg">
          {availableDurations.map((min) => {
            const selected = selectedDuration === min;
            return (
              <button
                key={min}
                onClick={() => setSelectedDuration(min)}
                className={clsx(
                  "px-3 py-1 rounded-full text-sm font-medium transition-all",
                  selected
                    ? "bg-blue-600 text-white ring-2 ring-blue-300 scale-105"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
                title={`${min} minutes`}
              >
                {min} min
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateWorkout}
        disabled={!canGenerate}
        className={clsx(
          "mt-2 mb-2 w-full py-2 rounded font-semibold flex items-center justify-center gap-1 transition-all",
          "disabled:opacity-40",
          isGenerating
            ? "bg-blue-500 text-white"
            : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
        )}
      >
        {isGenerating ? (
          <>
            <Sparkles className="w-4 h-4 animate-pulse" />
            Generating workout for {selectedMuscles.length} muscle{selectedMuscles.length > 1 ? "s" : ""}...
          </>
        ) : workoutPlan ? (
          <>
            <Sparkles className="w-4 h-4" />
            Generate workout again
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate workout
          </>
        )}
      </button>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}

      {/* Workout Plan Display */}
      {workoutPlan && (
        <div className="bg-gray-800 rounded-lg p-4 shadow text-gray-100 mb-3">
          <h3 className="text-blue-300 font-semibold text-base mb-2">
            Workout plan for {selectedMuscles.join(", ")}:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {workoutPlan.map(({ name, sets, reps, notes }, idx) => (
              <li key={idx} className="space-y-1">
                <span className="font-semibold text-blue-200">{name}</span> –{" "}
                {sets} sets × {reps}
                {notes && <em className="ml-1 text-gray-400">({notes})</em>}
              </li>
            ))}
          </ul>
          <button
            onClick={startWorkout}
            disabled={saving}
            className="mt-4 px-4 py-2 rounded font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-md transition disabled:opacity-50 w-full text-sm"
          >
            {saving ? "Starting workout..." : "Start Workout"}
          </button>
        </div>
      )}
    </div>
  );
}