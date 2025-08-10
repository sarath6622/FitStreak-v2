// components/history/PRSection.tsx
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const getPRs = (history) => {
  const prs: Record<string, number> = {};
  history.forEach((session) => {
    session.exercises.forEach((ex) => {
      const maxWeight = Math.max(...ex.weight);
      if (!prs[ex.name] || maxWeight > prs[ex.name]) {
        prs[ex.name] = maxWeight;
      }
    });
  });
  return prs;
};

export default function PRSection({ workoutHistory }) {
  const prs = getPRs(workoutHistory);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="text-yellow-500" size={20} />
          <h2 className="font-semibold text-white">Personal Records</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(prs).map(([name, weight]) => (
            <div key={name} className="bg-gray-800 p-3 rounded-lg">
              <p className="text-white font-medium">{name}</p>
              <p className="text-yellow-500 text-sm">{weight} kg</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}