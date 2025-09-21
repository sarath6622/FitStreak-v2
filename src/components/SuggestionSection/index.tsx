"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MuscleGroupSelector from "./MuscleGroupSelector";
import DurationSelector from "./DurationSelector";
import WorkoutPlanDisplay from "./WorkoutPlanDisplay";
import GenerateButton from "./GenerateButton";
import WorkoutPreviewModal from "@/components/workout/WorkoutPreviewModal";
import { Sparkles } from "lucide-react";
import AILoader from "../AILoader";

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
}

interface MuscleSummary {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
}

export default function SuggestionSection({ userId }: SuggestionSectionProps) {
  const [muscleSummaries, setMuscleSummaries] = useState<MuscleSummary[]>([]);
  const [muscleGroup, setMuscleGroup] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("60 min");
  const [workoutPlan, setWorkoutPlan] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  const router = useRouter();

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
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate workout.");
    } finally {
      setLoading(false);
    }
  };

  // save + navigate
  const handleStartWorkout = async (overwrite = false) => {
    if (!userId || workoutPlan.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/save-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          muscleGroups: muscleGroup,
          workoutPlan,
          overwrite,
        }),
      });

      const data = await res.json();

      if (data.exists) {
        // workout already exists → show overwrite modal
        setShowOverwriteModal(true);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Failed to save workout");

      // ✅ navigate after save
      router.replace("/workouts/todays-workouts");
    } catch (err: any) {
      setError(err.message || "Failed to save workout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pt-6 bg-[var(--card-background)] border-[var(--card-border)] rounded-2xl shadow-lg border">
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

      {loading && <AILoader />}

      <MuscleGroupSelector
        value={muscleGroup}
        onChange={setMuscleGroup}
        summaries={muscleSummaries}
      />

      <DurationSelector value={duration} onChange={setDuration} />
      <GenerateButton onClick={handleGenerate} loading={loading} />

      {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}

      {/* Preview Modal */}
      {showPreview && workoutPlan.length > 0 && (
        <WorkoutPreviewModal
          title="Your Generated Workout"
          plans={[
            {
              id: "generated",
              createdAt: { seconds: Math.floor(Date.now() / 1000) },
              exercises: workoutPlan,
            },
          ]}
          onConfirm={() => handleStartWorkout(false)}
          onClose={() => {
            setShowPreview(false);
            setWorkoutPlan([]);
          }}
        />
      )}

      {/* Overwrite Confirmation Modal */}
      {showOverwriteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-light)] rounded-xl w-[400px] p-6 space-y-4 shadow-lg border border-[var(--card-border)]">
            <h2 className="text-lg font-semibold text-white">Overwrite Workout?</h2>
            <p className="text-sm text-yellow-00">
              ⚠️ You already have a workout for today. If you continue, your existing
              workout will be <span className="font-semibold">overwritten</span>.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowOverwriteModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartWorkout(true)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}