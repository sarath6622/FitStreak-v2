"use client";

import { Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getMuscleGroup } from "@/lib/exerciseCategories";

interface PRSectionProps {
  prs: Record<string, number>;
}

export default function PRSection({ prs }: PRSectionProps) {
  const hasPRs = Object.keys(prs).length > 0;
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Group PRs by category using getMuscleGroup
  const grouped = Object.entries(prs).reduce<
    Record<string, { exercise: string; weight: number }[]>
  >((acc, [exercise, weight]) => {
    const category = getMuscleGroup(exercise);
    if (!acc[category]) acc[category] = [];
    acc[category].push({ exercise, weight });
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-400" size={20} />
        <h2 className="font-semibold text-white text-lg">Personal Records</h2>
      </div>

      {/* PR accordion */}
      {hasPRs ? (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="flex justify-between items-center w-full px-3 py-2 text-left"
              >
                <span className="text-gray-200 font-medium">{category}</span>
                {openCategory === category ? (
                  <ChevronDown className="text-gray-400" size={18} />
                ) : (
                  <ChevronRight className="text-gray-400" size={18} />
                )}
              </button>

              {/* Exercises inside category */}
              {openCategory === category && (
                <div className="px-3 pb-3 space-y-2 animate-fadeIn">
                  {grouped[category].map(({ exercise, weight }) => (
                    <div
                      key={exercise}
                      className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-md"
                    >
                      <span className="text-white text-sm truncate">
                        {exercise}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {weight} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">
          No PRs recorded yet. Start logging workouts!
        </p>
      )}
    </div>
  );
}