"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkoutReminderBanner() {
  const [show, setShow] = useState(false);
  const [hasWorkoutToday, setHasWorkoutToday] = useState(false);
  const [todaysPlan, setTodaysPlan] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkWorkoutStatus = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      // Check if user has logged workout today
      const workoutRef = doc(db, "users", user.uid, "workouts", today);
      const workoutSnap = await getDoc(workoutRef);

      if (workoutSnap.exists()) {
        const data = workoutSnap.data();

        // Check if there are any incomplete exercises
        const hasIncompleteExercises = data.exercises?.some(
          (ex: { weight?: number[] }) => !ex.weight || ex.weight.length === 0
        );

        if (hasIncompleteExercises || !data.exercises?.length) {
          setHasWorkoutToday(false);

          // Get today's planned workout
          const plansRef = collection(workoutRef, "plans");
          const plansSnap = await getDocs(plansRef);

          if (!plansSnap.empty) {
            const plan = plansSnap.docs[0];
            setTodaysPlan(plan.data().muscleGroup || "workout");
          }
        } else {
          setHasWorkoutToday(true);
        }
      } else {
        setHasWorkoutToday(false);

        // Try to get planned workout
        const plansRef = collection(workoutRef, "plans");
        const plansSnap = await getDocs(plansRef);

        if (!plansSnap.empty) {
          const plan = plansSnap.docs[0];
          setTodaysPlan(plan.data().muscleGroup || "workout");
        }
      }

      // Check if dismissed today
      const dismissedKey = `workout-reminder-dismissed-${today}`;
      const wasDismissed = localStorage.getItem(dismissedKey);

      if (!wasDismissed && !hasWorkoutToday) {
        // Show banner after a delay
        setTimeout(() => setShow(true), 2000);
      }
    };

    checkWorkoutStatus();

    // Re-check every 5 minutes
    const interval = setInterval(checkWorkoutStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [hasWorkoutToday]);

  const handleDismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`workout-reminder-dismissed-${today}`, "true");
    setShow(false);
    setDismissed(true);
  };

  const handleStartWorkout = () => {
    setShow(false);
    router.push("/workouts/todays-workouts");
  };

  if (hasWorkoutToday || dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-16 left-0 right-0 z-40 px-4"
        >
          <div className="max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl border border-blue-500/50 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">
                  Time to Workout! 💪
                </h3>
                <p className="text-white/90 text-xs mt-0.5">
                  {todaysPlan
                    ? `Your ${todaysPlan} workout is waiting`
                    : "Start your workout for today"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartWorkout}
                  className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  Start
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-1 bg-white/30"
              onAnimationComplete={handleDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
