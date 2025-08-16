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
import { upsertWorkout, getWorkoutForExercise } from "@/services/workoutService";

interface WorkoutLoggerModalProps {
  muscleGroup: string;
  exerciseName: string;
  onClose: () => void;
  onWorkoutSaved?: () => void;
}

const defaultRest = 90;
const repOptions = [5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50];

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
  const [autoConfirmFlags, setAutoConfirmFlags] = useState<boolean[]>([]);
  const [forceRemount, setForceRemount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ESC close
  const escFunction = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", escFunction);
    return () => document.removeEventListener("keydown", escFunction);
  }, [escFunction]);

  // Close on overlay click
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Fetch workout from DB
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

        // autoConfirm = true for DB-loaded rows
        const flagsFromDb = Array((ex.sets || 1)).fill(true);
        setAutoConfirmFlags(flagsFromDb);
        setForceRemount(true);

        console.log("[DB FETCH] loaded weights:", ex.weight, "flags:", flagsFromDb);
      }

      setIsLoading(false);
    };
    fetchExistingData();
  }, [exerciseName]);

  // Reset the forceRemount flag after remounting once
  useEffect(() => {
    if (forceRemount) {
      console.log("[REMOUNT] forcing remount of WeightRepsInput");
      setForceRemount(false);
    }
  }, [forceRemount]);

  // Ensure arrays sync with number of sets
  useEffect(() => {
    setWeights((cur) =>
      sets > cur.length ? [...cur, ...Array(sets - cur.length).fill(0)] : cur.slice(0, sets)
    );
    setRepsPerSet((cur) =>
      sets > cur.length ? [...cur, ...Array(sets - cur.length).fill(10)] : cur.slice(0, sets)
    );
    // Clear errors on change of set count
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith("weight-") || k.startsWith("rep-")) delete copy[k];
      });
      return copy;
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

  // Handle saving
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix form errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in to save workouts.");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      await upsertWorkout(user.uid, today, {
        exerciseId: uuidv4(),
        name: exerciseName,
        muscleGroup,
        sets,
        repsPerSet,
        weight: weights,
        completed: true,
      }, duration, rest);

      toast.success("Workout saved successfully!");
      if (onWorkoutSaved) onWorkoutSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // add new set + disable auto confirm for that row
  const addNewSet = () => {
    setSets((s) => s + 1);
    setWeights((prev) => {
      const next = [...prev, 0];
      return next;
    });
    setRepsPerSet((prev) => [...prev, 10]);
    setAutoConfirmFlags((prev) => {
      const next = [...prev, false];
      console.log("[ADD SET] new weights:", next, "flags:", next);
      return next;
    });
  };

  console.log("[RENDER] forceRemount =", forceRemount);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <span className="text-white">Loading...</span>
      </div>
    );
  }

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
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Log {exerciseName}</h2>

        <SetsControl
          sets={sets}
          setSets={addNewSet}
          error={errors.sets}
          disabled={isSaving}
        />

        <WeightRepsInput
          key={forceRemount ? weights.join("-") : undefined}
          weights={weights}
          repsPerSet={repsPerSet}
          errors={errors}
          repOptions={repOptions}
          disabled={isSaving}
          initialAutoConfirmFlags={autoConfirmFlags}
          onWeightChange={(i, v) => {
            const next = [...weights];
            next[i] = isNaN(Number(v)) ? 0 : Number(v);
            setWeights(next);
          }}
          onRepsChange={(i, v) => {
            const next = [...repsPerSet];
            next[i] = isNaN(Number(v)) ? 1 : Number(v);
            setRepsPerSet(next);
          }}
        />

        <DurationInput duration={duration} setDuration={(v) => setDuration(Number(v))} />
        <RestInput rest={rest} setRest={(v) => setRest(Number(v))} />

        <button
          disabled={isSaving}
          onClick={handleSave}
          className={`
    w-full
    flex items-center justify-center gap-2
    py-3
    rounded-lg
    font-semibold
    transition-colors
    ${isSaving
              ? "bg-yellow-400 text-black opacity-70 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-400 text-black"}
  `}
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Workout"}
        </button>
      </motion.div>
    </div>
  );
}