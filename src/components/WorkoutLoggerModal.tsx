"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Minus, Plus, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // For stable unique IDs
import { toast } from "sonner"; // For toast notifications
import { motion } from "framer-motion";

interface WorkoutLoggerModalProps {
  muscleGroup: string;
  exerciseName: string;
  onClose: () => void;
}

const defaultRest = 90;
const repOptions = [5, 8, 10, 12, 15];

export default function WorkoutLoggerModal({
  muscleGroup,
  exerciseName,
  onClose,
}: WorkoutLoggerModalProps) {
  const [sets, setSets] = useState(3);
  // weights and reps per set
  const [weights, setWeights] = useState<number[]>(Array(3).fill(0));
  const [repsPerSet, setRepsPerSet] = useState<number[]>(Array(3).fill(10));
  const [duration, setDuration] = useState(45);
  const [rest, setRest] = useState(defaultRest);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle ESC key to close modal
  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [escFunction]);

  // Close on clicking overlay
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Sync weights and reps array lengths with sets
  useEffect(() => {
    setWeights((current) => {
      const newWeights = [...current];
      if (sets > newWeights.length) {
        return newWeights.concat(Array(sets - newWeights.length).fill(0));
      } else if (sets < newWeights.length) {
        return newWeights.slice(0, sets);
      }

      return newWeights;
    });

    setRepsPerSet((current) => {
      const newReps = [...current];
      if (sets > newReps.length) {
        return newReps.concat(Array(sets - newReps.length).fill(10));
      } else if (sets < newReps.length) {
        return newReps.slice(0, sets);
      }

      return newReps;
    });

    // Clear weight-related errors on set length change
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

  const handleWeightChange = (index: number, value: string) => {
    const numVal = Number(value);
    setWeights((prev) => {
      const newWeights = [...prev];
      newWeights[index] = isNaN(numVal) ? 0 : numVal;
      return newWeights;
    });
    // Clear individual weight error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`weight-${index}`];
      return newErrors;
    });
  };

  const handleRepsChange = (index: number, value: string) => {
    const numVal = Number(value);
    setRepsPerSet((prev) => {
      const newReps = [...prev];
      newReps[index] = isNaN(numVal) ? 1 : numVal;
      return newReps;
    });
    // Clear individual reps error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`rep-${index}`];
      return newErrors;
    });
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
          // Save reps per set instead of uniform reps
          repsPerSet,
          weight: weights,
          completed: true,
        },
      ],
    };

    try {
      // Replace with your actual saving logic (e.g., Firestore)
      console.log("Workout Saved:", workoutData);

      toast.success("Workout saved successfully!");
      onClose();
    } catch (e) {
      toast.error("Failed to save workout. Please try again.");
      console.error(e);
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
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.25 }}
        className="bg-gray-900 rounded-xl p-6 w-80 text-white shadow-lg relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
        >
          <X size={20} />
        </button>

        <h2 id="modal-title" className="text-lg font-semibold mb-4">
          Log {exerciseName}
        </h2>

        {/* Sets */}
        <div className="flex flex-col mb-4">
          <label className="flex items-center justify-between mb-1">
            <span>Sets</span>
            <span className="text-sm text-red-400">{errors.sets}</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSets(Math.max(1, sets - 1))}
              className="bg-gray-800 p-2 rounded-full"
              aria-label="Decrease sets"
              disabled={isSaving}
            >
              <Minus size={16} />
            </button>
            <span className="font-bold">{sets}</span>
            <button
              onClick={() => setSets(sets + 1)}
              className="bg-gray-800 p-2 rounded-full"
              aria-label="Increase sets"
              disabled={isSaving}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Weight and Reps per set */}
        <div className="mb-4">
          <label className="block mb-1">Weight and Reps per set</label>
          {weights.map((weight, idx) => (
            <div key={idx} className="flex items-center mb-1 gap-2">
              <label htmlFor={`weight-${idx}`} className="w-6 text-gray-300">
                {idx + 1}.
              </label>

              <input
                id={`weight-${idx}`}
                type="number"
                min={0}
                value={weight}
                onChange={(e) => handleWeightChange(idx, e.target.value)}
                className={`flex-1 p-2 rounded-md bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none`}
                disabled={isSaving}
                aria-invalid={errors[`weight-${idx}`] ? "true" : "false"}
                aria-describedby={errors[`weight-${idx}`] ? `error-weight-${idx}` : undefined}
              />

              <select
                id={`reps-${idx}`}
                value={repsPerSet[idx]}
                onChange={(e) => handleRepsChange(idx, e.target.value)}
                className="w-16 p-2 rounded-md bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                disabled={isSaving}
                aria-label={`Reps for set ${idx + 1}`}
                aria-invalid={errors[`rep-${idx}`] ? "true" : "false"}
                aria-describedby={errors[`rep-${idx}`] ? `error-rep-${idx}` : undefined}
              >
                {repOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* Weight error */}
              {errors[`weight-${idx}`] && (
                <span
                  id={`error-weight-${idx}`}
                  className="text-xs text-red-400"
                  role="alert"
                >
                  {errors[`weight-${idx}`]}
                </span>
              )}

              {/* Reps error */}
              {errors[`rep-${idx}`] && (
                <span
                  id={`error-rep-${idx}`}
                  className="text-xs text-red-400"
                  role="alert"
                >
                  {errors[`rep-${idx}`]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between mb-6">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            id="duration"
            type="number"
            min={1}
            max={300}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-20 bg-gray-800 p-2 rounded-md text-center"
            disabled={isSaving}
            aria-invalid={errors.duration ? "true" : "false"}
            aria-describedby={errors.duration ? "error-duration" : undefined}
          />
          {errors.duration && (
            <span id="error-duration" className="text-red-400 text-xs" role="alert">
              {errors.duration}
            </span>
          )}
        </div>

        {/* Rest */}
        <div className="flex items-center justify-between mb-6">
          <label htmlFor="rest">Rest (seconds)</label>
          <input
            id="rest"
            type="number"
            min={0}
            max={600}
            value={rest}
            onChange={(e) => setRest(Number(e.target.value))}
            className="w-20 bg-gray-800 p-2 rounded-md text-center"
            disabled={isSaving}
            aria-label="Set rest time between sets in seconds"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
          aria-disabled={isSaving}
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Workout"}
        </button>
      </motion.div>
    </div>
  );
}
