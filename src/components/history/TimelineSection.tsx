import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface TimelineSectionProps {
  workoutData: any[];
}

export default function TimelineSection({ workoutData }: TimelineSectionProps) {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="text-green-400" size={20} />
          <h2 className="font-semibold text-white">Workout Timeline</h2>
        </div>
        {workoutData.map((session) => (
          <div key={session.date} className="border-b border-gray-800 pb-2 mb-2">
            <p className="text-white font-medium">{formatDate(session.date)}</p>
            <p className="text-gray-400 text-sm">{session.muscleGroups?.join(", ") || ""}</p>
            <p className="text-gray-500 text-xs">{session.duration} min</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}