"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  total: number;
  goal: number;
}

export default function CaloriesRing({ total, goal }: Props) {
  const data = [
    { name: "Eaten", value: total },
    { name: "Remaining", value: Math.max(goal - total, 0) },
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
                  fill={entry.name === "Eaten" ? "url(#eatenGradient)" : "#1f2937"}
                />
              ))}
            </Pie>
            <defs>
              <linearGradient id="eatenGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm">Calories</p>
      <p className="text-xs text-gray-400">{total}/{goal} kcal</p>
    </div>
  );
}