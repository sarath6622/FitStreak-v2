"use client";

import { motion, AnimatePresence } from "framer-motion";
import ImprovedWorkoutLogger from "./ImprovedWorkoutLogger";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: any;
  exerciseId: string;
  onWorkoutSaved: (data: any) => void;
  completedData?: {
    setsDone?: number;
    repsDone?: number;
    totalSets?: number;
  };
}

export default function WorkoutModal({
  isOpen,
  onClose,
  exercise,
  exerciseId,
  onWorkoutSaved,
  completedData,
}: WorkoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <ImprovedWorkoutLogger
              exercise={exercise}
              exerciseId={exerciseId}
              onClose={onClose}
              onWorkoutSaved={onWorkoutSaved}
              completedData={completedData}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}