"use client";

import { Trophy } from "lucide-react";

interface PRSectionProps {
  prs: Record<string, number>;
}

export default function PRSection({ prs }: PRSectionProps) {
  const hasPRs = Object.keys(prs).length > 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-400" size={20} />
        <h2 className="font-semibold text-white text-lg">Personal Records</h2>
      </div>

      {/* PR list or empty message */}
      {hasPRs ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(prs).map(([exercise, weight]) => (
            <div
              key={exercise}
              className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded-md"
            >
              <span className="text-white text-sm truncate">{exercise}</span>
              <span className="text-yellow-400 font-bold">{weight} kg</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No PRs recorded yet. Start logging workouts!</p>
      )}
    </div>
  );
}