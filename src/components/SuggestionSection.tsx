"use client";

import { Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
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
  muscleGroup: string;
  subGroup: string;
  equipment: string[];
  movementType: string;
  difficulty: string;
  secondaryMuscleGroups: string[];
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
  const [loading, setLoading] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    async function fetchMuscleAnalysis() {
      setLoading(true);
      setAnalysisLoading(true);
      try {
        const res = await fetch("/api/analyze-muscles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        let summaries: MuscleSummary[] = [];
        try {
          summaries = JSON.parse(data.summary);
        } catch {
          console.error("Failed to parse muscle summary from AI");
        }

        setMuscleSummaries(summaries);
      } catch (err) {
        console.error("Failed to fetch muscle summary", err);
        setMuscleSummaries([]);
      }

      setLoading(false);
      setAnalysisLoading(false);
    }

    fetchMuscleAnalysis();
  }, [userId]);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) => {
      const updated = prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle];

      // Clear previous plan & reset flag when selection changes
      setHasGenerated(false);
      setWorkoutPlan(null);

      return updated;
    });
  };

  const startWorkout = async () => {
    if (!userId || !workoutPlan || selectedMuscles.length === 0) return;
    setSaving(true);
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
    } catch (error) {
      console.error("[Save Workout]", error);
    }

    setSaving(false);
  };

  const generateWorkout = async () => {
    if (!userId) return;
    setLoading(true);
    setWorkoutPlan(null);
    setHasGenerated(true);
    setGenerationLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, muscleGroups: selectedMuscles }), // <-- send an array
      });
      const data = await res.json();
      const parsedPlan: WorkoutPlan[] = JSON.parse(data.recommendation);
      setWorkoutPlan(parsedPlan);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
    setGenerationLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-5 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
      <h2 className="flex align-center text-blue-400 font-semibold text-lg mb-4">Suggested for You</h2>

      {/* Muscle Group Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {muscleSummaries
          .filter((m) => m.daysAgo !== 0)
          .map((m) => (
            <button
              key={m.muscleGroup}
              onClick={() => toggleMuscle(m.muscleGroup)}
              disabled={loading}
              className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-transparent focus:outline-none transition-all
                ${getColorClass(m.daysAgo, selectedMuscles.includes(m.muscleGroup))}
${selectedMuscles.includes(m.muscleGroup) ? "scale-105" : "scale-100"}
              `}
              title={`Last trained ${m.daysAgo} day${m.daysAgo === 1 ? "" : "s"} ago (${m.lastTrained})`}
            >
              {m.muscleGroup}
              <span className="opacity-70 text-xs ml-1">– {m.daysAgo}d</span>
            </button>
          ))}
      </div>
      <button
        onClick={generateWorkout}
        disabled={selectedMuscles.length === 0 || generationLoading || analysisLoading}
        className={`
    mt-2 mb-2 w-full py-2 rounded font-semibold flex items-center justify-center gap-1 transition-all
    disabled:opacity-40
    ${generationLoading
            ? "bg-blue-500 text-white"
            : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
          }`}
      >
        {generationLoading ? (
          <>
            <Sparkles className="w-4 h-4 animate-pulse" />
            Generating workout for {selectedMuscles.length} muscle
            {selectedMuscles.length > 1 ? "s" : ""}...
          </>
        ) : hasGenerated ? (
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

      {/* Loading Indicator */}
      {generationLoading && (
        <p className="text-blue-300 text-sm text-center mb-4 animate-pulse">
          Generating your workout plan...
        </p>
      )}

      {/* Workout Plan */}
      {workoutPlan && (
        <div className="bg-gray-800 rounded-lg p-4 shadow text-gray-100 mb-3">
          <h3 className="text-blue-300 font-semibold text-base mb-2">
            Workout plan for {selectedMuscles.join(", ")}:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {workoutPlan.map(
              (
                {
                  name,
                  sets,
                  reps,
                  notes,
                  subGroup,
                  equipment,
                  movementType,
                  difficulty,
                  secondaryMuscleGroups,
                },
                idx
              ) => (
                <li key={idx} className="space-y-1">
                  <span className="font-semibold text-blue-200">{name}</span> –{" "}
                  {sets} sets × {reps}
                  {notes && <em className="ml-1 text-gray-400">({notes})</em>}

                </li>
              )
            )}
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

      {/* No Plan Message */}
      {analysisLoading && (
        <p className="text-blue-300 text-sm text-center mb-4 animate-pulse">
          Analyzing workout history...
        </p>
      )}
      {hasGenerated && !loading && !workoutPlan && selectedMuscles.length > 0 && (
        <p className="italic text-gray-400 text-sm text-center">
          No workout plan available for {selectedMuscles.join(", ")}.
        </p>
      )}
    </div>
  );
}