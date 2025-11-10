"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, X } from "lucide-react";

interface RestTimerProps {
  defaultDuration?: number; // in seconds
}

export default function RestTimer({ defaultDuration = 90 }: RestTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    // Play a simple beep sound (you can add a custom audio file)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback if audio playback is blocked
      });
    }
    // Vibrate if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const startTimer = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration);
    setIsRunning(true);
    setIsOpen(true);
  };

  const togglePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = selectedDuration > 0 ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0;
  const isComplete = timeLeft === 0;

  return (
    <>
      {/* Floating Timer Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all"
      >
        <Timer className="w-6 h-6" />
      </motion.button>

      {/* Timer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f0f0f] via-[#111827] to-[#1f2937] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-400" />
                  Rest Timer
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Timer Display */}
              <div className="relative mb-6">
                {/* Circular Progress */}
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className={isComplete ? "text-green-500" : "text-blue-500"}
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100),
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>

                  {/* Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-5xl font-bold ${
                        isComplete ? "text-green-500" : "text-white"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                    {isComplete && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-green-400 text-sm font-semibold mt-2"
                      >
                        Rest Complete!
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className={`p-4 rounded-full ${
                    isRunning
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-all shadow-lg`}
                  aria-label={isRunning ? "Pause" : "Play"}
                >
                  {isRunning ? (
                    <Pause className="w-6 h-6" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6" fill="currentColor" />
                  )}
                </button>
              </div>

              {/* Quick Duration Buttons */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Quick Set
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => startTimer(duration)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDuration === duration && timeLeft > 0
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {duration}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden audio element for notification */}
              <audio ref={audioRef} preload="auto">
                {/* Simple data URI beep sound */}
                <source
                  src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKM0fPTgjMGHm7A7+OZTA8MU6jo7rdmGgo9k9nx0383Ci1rte7qoU0ODkW55fG9YhYHO5bY8tN+MQcqe8jv4JpKDQxQpuPwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==>"
                  type="audio/wav"
                />
              </audio>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
