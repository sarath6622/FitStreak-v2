"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import ImprovedWorkoutLogger from "./ImprovedWorkoutLogger";
import { Exercise } from "@/features/shared/types";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
  exerciseId: string;
  onWorkoutSaved: (data: { sets: { weight: number; reps: number; done: boolean }[] }) => void;
}

export default function WorkoutModal({
  isOpen,
  onClose,
  exercise,
  exerciseId,
  onWorkoutSaved,
}: WorkoutModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mt-8"
          >
            <ImprovedWorkoutLogger
              exercise={exercise}
              exerciseId={exerciseId}
              onClose={onClose}
              onWorkoutSaved={onWorkoutSaved}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}