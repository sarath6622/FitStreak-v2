// src/components/history/PRSection.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface PRSectionProps {
  prs: Record<string, number>;
}

export default function PRSection({ prs }: PRSectionProps) {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          <h2 className="font-semibold text-white">Personal Records</h2>
        </div>

        {/* PR list */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(prs).map(([exercise, weight]) => (
            <div
              key={exercise}
              className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded-lg"
            >
              <span className="text-white text-sm">{exercise}</span>
              <span className="text-yellow-400 font-bold">{weight} kg</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}