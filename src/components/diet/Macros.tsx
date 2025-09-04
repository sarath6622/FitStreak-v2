"use client";

interface Macro {
  name: string;
  value: number;
  goal: number;
  color: string;
}

interface Props {
  data: Macro[];
  waterIntake: number;
  waterGoal: number;
}

export default function Macros({ data, waterIntake, waterGoal }: Props) {
  return (
    <div className="bg-[#0d0f1a]/60 backdrop-blur-md rounded-2xl p-4 border border-gray-800 text-white">
      <p className="text-sm font-medium mb-3">Macros</p>
      {data.map((m, i) => {
        const percent = Math.min((m.value / m.goal) * 100, 100);
        return (
          <div key={i} className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{m.name}</span>
              <span>{m.value}/{m.goal} g</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full"
                style={{ width: `${percent}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        );
      })}
      <details className="mt-2 text-xs text-gray-400">
        <summary className="cursor-pointer">More details</summary>
        <div className="mt-2 space-y-2">
          <p>Fiber: 12/25 g</p>
          <p>Sugar: 30/50 g</p>
          <p>Water: {waterIntake}/{waterGoal} ml</p>
        </div>
      </details>
    </div>
  );
}