"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  intake: number;
  goal: number;
}

export default function WaterRing({ intake, goal }: Props) {
  const data = [
    { name: "Drank", value: intake },
    { name: "Remaining", value: Math.max(goal - intake, 0) },
  ];

  return (
    <div className="bg-[#0d0f1a]/60 backdrop-blur-md rounded-2xl p-4 border border-gray-800 text-white flex flex-col items-center">
      <div className="w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={6}
              cornerRadius={10}
              stroke="none"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.name === "Drank" ? "url(#waterGradient)" : "#1f2937"}
                />
              ))}
            </Pie>
            <defs>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm">Water</p>
      <p className="text-xs text-gray-400">{intake}/{goal} ml</p>
    </div>
  );
}