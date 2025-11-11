"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import WorkoutPreviewBody from "./WorkoutPreviewBody";

export default function WorkoutPreviewModal({
  isOpen = true,
  title = "Preview Workout",
  plans,
  onConfirm,
  onClose,
  children,
  selectedMuscles = [],
  duration = "60 min",
}: {
  isOpen?: boolean;
  title?: string;
  plans: { muscleGroup: string; exercises: { name: string; sets: number; reps: number | string }[] }[];
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  children?: React.ReactNode;
  selectedMuscles?: string[];
  duration?: string;
}) {
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[520px] max-w-[92vw] rounded-3xl border border-white/10 bg-[var(--card-background)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden mt-8">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-[var(--card-border)]">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        {plans.map((plan) => (
          <WorkoutPreviewBody
            key={plan.id}
            exercises={plan.exercises}
            selectedMuscles={selectedMuscles}
            duration={duration}
          />
        ))}

        {/* Footer - Improved Button Hierarchy */}
        <div className="px-5 py-4 border-t border-[var(--card-border)] flex gap-3 bg-[var(--surface-dark)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <div className="flex-1" />

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {/* Spinner */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0"
                }`}
            >
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </span>

            {/* Button Text */}
            <span
              className={`transition-opacity duration-300 flex items-center gap-2 ${loading ? "opacity-0" : "opacity-100"
                }`}
            >
              <Check className="w-4 h-4" />
              Save Workout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}