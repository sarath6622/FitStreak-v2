import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ProgressChartSectionProps {
  allExercises: string[];
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  chartData: any[];
}

export default function ProgressChartSection({
  allExercises,
  selectedExercise,
  setSelectedExercise,
  chartData,
}: ProgressChartSectionProps) {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-blue-400" size={20} />
          <h2 className="font-semibold text-white">Progress</h2>
        </div>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
        >
          {allExercises.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: "#222", border: "none" }} />
            <Line type="monotone" dataKey="topWeight" stroke="#facc15" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}