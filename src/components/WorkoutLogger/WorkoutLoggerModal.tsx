"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { motion } from "framer-motion";

import SetsControl from "@/components/WorkoutLogger/SetsControl";
import WeightRepsInput from "@/components/WorkoutLogger/WeightRepsInput";
import DurationInput from "@/components/WorkoutLogger/DurationInput";
import RestInput from "@/components/WorkoutLogger/RestInput";

import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { upsertWorkout } from "@/services/workoutService";
import { getWorkoutForExercise } from "@/services/workoutService";

interface WorkoutLoggerModalProps {
  muscleGroup: string;
  exerciseName: string;
  onClose: () => void;
  onWorkoutSaved?: () => void; // NEW
}

const defaultRest = 90;
const repOptions = [5, 8, 10, 12, 15, 20];

export default function WorkoutLoggerModal({
  muscleGroup,
  exerciseName,
  onClose,
  onWorkoutSaved,
}: WorkoutLoggerModalProps) {
  const [sets, setSets] = useState(1);
  const [weights, setWeights] = useState<number[]>([0]);
  const [repsPerSet, setRepsPerSet] = useState<number[]>([10]);
  const [duration, setDuration] = useState(45);
  const [rest, setRest] = useState(defaultRest);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ESC close
  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return () => document.removeEventListener("keydown", escFunction, false);
  }, [escFunction]);

  // Overlay click close
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      const workoutData = await getWorkoutForExercise(user.uid, today, exerciseName);

      if (workoutData && workoutData.exercise) {
        const ex = workoutData.exercise;
        setSets(ex.sets || 1);
        setWeights(ex.weight || Array(ex.sets || 1).fill(0));
        setRepsPerSet(ex.repsPerSet || Array(ex.sets || 1).fill(10));
        setDuration(workoutData.duration || 45);
        setRest(workoutData.rest || defaultRest);
      }
    };

    fetchExistingData();
  }, [exerciseName]);

  // Sync weights/reps array with sets
  useEffect(() => {
    setWeights((current) =>
      sets > current.length
        ? [...current, ...Array(sets - current.length).fill(0)]
        : current.slice(0, sets)
    );

    setRepsPerSet((current) =>
      sets > current.length
        ? [...current, ...Array(sets - current.length).fill(10)]
        : current.slice(0, sets)
    );

    // Clear related errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("weight-") || key.startsWith("rep-")) delete newErrors[key];
      });
      return newErrors;
    });
  }, [sets]);

  const validate = () => {
    const errs: typeof errors = {};
    if (sets < 1) errs.sets = "Sets must be at least 1";
    if (duration <= 0) errs.duration = "Duration must be positive";
    weights.forEach((w, i) => {
      if (w < 0) errs[`weight-${i}`] = "Weight must be zero or positive";
    });
    repsPerSet.forEach((r, i) => {
      if (r < 1) errs[`rep-${i}`] = "Reps must be at least 1";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix form errors before saving.");
      return;
    }

    setIsSaving(true);

    const workoutData = {
      date: new Date().toISOString().split("T")[0],
      duration,
      rest,
      exercises: [
        {
          exerciseId: uuidv4(),
          name: exerciseName,
          muscleGroup,
          sets,
          repsPerSet,
          weight: weights,
          completed: true,
        },
      ],
    };

    try {
  const user = auth.currentUser;
  if (!user) {
    toast.error("You must be logged in to save workouts.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  await upsertWorkout(
    user.uid,
    today,
    {
      exerciseId: uuidv4(),
      name: exerciseName,
      muscleGroup,
      sets,
      repsPerSet,
      weight: weights,
      completed: true,
    },
    duration,
    rest
  );

  toast.success("Workout saved successfully!");
  if (onWorkoutSaved) onWorkoutSaved(); // NEW LINE
  onClose();
} catch (e) {
  console.error(e);
  toast.error("Failed to save workout. Please try again.");
} finally {
  setIsSaving(false);
}
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={onOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.25 }}
        className="bg-gray-900 rounded-xl p-6 w-80 text-white shadow-lg relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Log {exerciseName}</h2>

        <SetsControl
          sets={sets}
          setSets={setSets}
          error={errors.sets}
          disabled={isSaving}
        />

        <WeightRepsInput
          weights={weights}
          repsPerSet={repsPerSet}
          onWeightChange={(i, v) =>
            setWeights((prev) => {
              const arr = [...prev];
              arr[i] = isNaN(Number(v)) ? 0 : Number(v);
              return arr;
            })
          }

          onRepsChange={(i, v) =>
            setRepsPerSet((prev) => {
              const arr = [...prev];
              arr[i] = isNaN(Number(v)) ? 1 : Number(v);
              return arr;
            })
          }

          errors={errors}
          repOptions={repOptions}
          disabled={isSaving}
        />

        <DurationInput
          duration={duration}
          setDuration={(v) => setDuration(Number(v))}
          error={errors.duration}
          disabled={isSaving}
        />

        <RestInput rest={rest} setRest={(v) => setRest(Number(v))} disabled={isSaving} />

        <button
          onClick={handleSave}
          className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={isSaving}
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Workout"}
        </button>
      </motion.div>
    </div>
  );
}