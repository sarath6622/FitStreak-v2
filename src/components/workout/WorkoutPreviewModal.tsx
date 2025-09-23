"use client";

import { useState } from "react";
import { X } from "lucide-react";
import WorkoutPreviewBody from "./WorkoutPreviewBody";

export default function WorkoutPreviewModal({
  isOpen = true,
  title = "Preview Workout",
  plans,
  onConfirm,
  onClose,
  children,
}: {
  isOpen?: boolean;
  title?: string;
  plans: any[];
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[480px] max-w-[92vw] rounded-3xl border border-white/10 bg-[var(--card-background)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        {plans.map((plan) => (
          <WorkoutPreviewBody key={plan.id} exercises={plan.exercises} />
        ))}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--card-border)] flex gap-3 bg-[var(--surface-dark)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-[var(--text-primary)] font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-dark)] text-white font-semibold shadow-md transition flex items-center justify-center gap-2 relative overflow-hidden"
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
              className={`transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"
                }`}
            >
              Confirm
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}