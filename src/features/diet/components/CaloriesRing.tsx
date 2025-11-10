"use client";
import React from "react";

interface Props {
  total: number;
  goal: number;
}

export default function CaloriesProgressBar({ total, goal }: Props) {
  const percentage = Math.min((total / goal) * 100, 100);

  // Motivational messages depending on progress
  const getMessage = () => {
    if (percentage === 0) return "Let's get started 💪";
    if (percentage < 25) return "Great start, keep it up 🚀";
    if (percentage < 50) return "Halfway there, stay strong ⚡";
    if (percentage < 75) return "You're doing awesome 🔥";
    if (percentage < 100) return "Almost at your goal! 🏆";
    return "Goal achieved! 🎉";
  };

  return (
    <div className="bg-[#0d0f1a]/60 backdrop-blur-md rounded-2xl p-4 border border-gray-800 text-white flex flex-col items-center w-full">
      {/* Progress bar */}
      <div className="w-full bg-gray-800/50 rounded-xl h-6 overflow-hidden relative">
        <div
          className="h-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        {/* Glow Effect */}
        <div
          className="absolute top-0 left-0 h-full rounded-xl opacity-40 blur-md bg-gradient-to-r from-purple-400 to-blue-400"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Numbers */}
      <p className="mt-3 text-sm">
        {total} / {goal} kcal
      </p>

      {/* Motivational message */}
      <p className="text-xs text-gray-400 mt-1">{getMessage()}</p>
    </div>
  );
}