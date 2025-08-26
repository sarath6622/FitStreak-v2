"use client";

import { Trophy, ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import { useState } from "react";
import { getMuscleGroup } from "@/lib/exerciseCategories";

interface PRSectionProps {
  prs: Record<string, number>;
}

export default function PRSection({ prs }: PRSectionProps) {
  const hasPRs = Object.keys(prs).length > 0;
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Group PRs by category
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
    <div className="bg-gradient-to-b from-[#0d0f1a] to-[#161a2b] border border-gray-700 rounded-2xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="text-yellow-400 drop-shadow" size={22} />
        <h2 className="font-semibold text-white text-xl tracking-wide">
          Personal Records
        </h2>
      </div>

      {/* Accordion */}
      {hasPRs ? (
        <div className="space-y-2">
          {categories.map((category) => {
            const isOpen = openCategory === category;
            return (
              <div
                key={category}
                className="rounded-xl border border-gray-700 overflow-hidden bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex justify-between items-center w-full px-4 py-3 text-left"
                >
                  <span className="text-gray-100 font-medium flex items-center gap-2">
                    <Dumbbell size={16} className="text-purple-400" />
                    {category}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="text-gray-400 transition-transform" size={18} />
                  ) : (
                    <ChevronRight className="text-gray-400 transition-transform" size={18} />
                  )}
                </button>

                {/* Exercises */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-4 pb-3 space-y-2">
                    {grouped[category].map(({ exercise, weight }) => (
                      <div
                        key={exercise}
                        className="flex justify-between items-center bg-gray-700/50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-white text-sm font-medium truncate">
                          {exercise}
                        </span>
                        <span className="text-yellow-300 font-semibold text-sm bg-gray-800 px-2 py-0.5 rounded-md">
                          {weight} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">
          No PRs recorded yet. Start logging workouts!
        </p>
      )}
    </div>
  );
}