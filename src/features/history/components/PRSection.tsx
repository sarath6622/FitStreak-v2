"use client";

import { Trophy, ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import { useState } from "react";
import { getMuscleGroup } from "@/features/workout/utils/exerciseCategories";

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
    <div
      className="rounded-2xl p-5 shadow-lg bg-[var(--card-background)] border border-[var(--card-border)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy style={{ color: "var(--accent-yellow)" }} size={22} />
        <h2
          className="font-semibold text-xl tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
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
                className="rounded-xl overflow-hidden backdrop-blur-md border border-[var(--card-border)]"
                
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex justify-between items-center w-full px-4 py-3 text-left"
                >
                  <span
                    className="font-medium flex items-center gap-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Dumbbell size={16} style={{ color: "var(--accent-purple)" }} />
                    {category}
                  </span>
                  {isOpen ? (
                    <ChevronDown style={{ color: "var(--text-muted)" }} size={18} />
                  ) : (
                    <ChevronRight style={{ color: "var(--text-muted)" }} size={18} />
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
                        className="flex justify-between items-center px-3 py-2 rounded-lg"
                        style={{ background: "var(--surface-light)" }}
                      >
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {exercise}
                        </span>
                        <span
                          className="font-semibold text-sm px-2 py-0.5 rounded-md"
                          style={{
                            color: "var(--accent-yellow)",
                            background: "var(--surface-dark)",
                          }}
                        >
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
        <p
          className="text-sm italic"
          style={{ color: "var(--text-muted)" }}
        >
          No PRs recorded yet. Start logging workouts!
        </p>
      )}
    </div>
  );
}