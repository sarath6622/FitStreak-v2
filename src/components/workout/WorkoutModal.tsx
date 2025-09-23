"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import WorkoutLogger from "./WorkoutLogger";

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
  }; // 👈 now optional
}

export default function WorkoutModal({
  isOpen,
  onClose,
  exercise,
  exerciseId,
  onWorkoutSaved,
  completedData,
}: WorkoutModalProps) {
  console.log("completedData from workoutModal" , completedData);
  return (
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-black border border-gray-800 m-1 rounded-2xl shadow-xl w-full max-w-md p-3 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">
              Log {exercise.name}
            </h2>

            {/* Workout Logger */}
            <WorkoutLogger
              exercise={exercise}
              exerciseId={exerciseId}
              onClose={onClose}
              onWorkoutSaved={onWorkoutSaved}
              completedData={completedData} // ✅ safe, may be undefined or partial
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}