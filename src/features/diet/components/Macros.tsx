"use client";

interface Macro {
  name: string;
  value: number;
  goal: number;
  color: string; // expected: var(--accent-xxx)
}

interface Props {
  data: Macro[];
  waterIntake: number;
  waterGoal: number;
}

export default function Macros({ data, waterIntake, waterGoal }: Props) {
  return (
    <div className="bg-[--card-background] border border-[--card-border] rounded-2xl p-4 shadow-[--card-shadow] backdrop-blur-md text-[--text-primary]">
      {/* Header */}
      <p className="text-sm font-semibold mb-4">Macros</p>

      {/* Macro Progress Bars */}
      <div className="space-y-4">
        {data.map((m, i) => {
          const percent = Math.min((m.value / m.goal) * 100, 100);

          return (
            <div key={i}>
              {/* Labels */}
              <div className="flex justify-between text-xs text-[--text-muted] mb-1">
                <span>{m.name}</span>
                <span className="tabular-nums">
                  {m.value}/{m.goal} g
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[--surface-dark] overflow-hidden relative">
                {/* Glow track */}
                <div
                  className="absolute inset-0 opacity-30 blur-sm rounded-full"
                  style={{
                    width: `${percent}%`,
                    background: `linear-gradient(90deg, ${m.color}, ${m.color})`,
                  }}
                />
                {/* Fill */}
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background: `linear-gradient(90deg, ${m.color}, ${m.color})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Details */}
      <details className="mt-4 group">
        <summary className="cursor-pointer text-xs text-[--text-muted] hover:text-[--text-secondary] flex items-center justify-between">
          More details
          <span className="transition-transform group-open:rotate-180">⌃</span>
        </summary>

        <div className="mt-3 p-3 rounded-xl bg-[--surface-dark] border border-[--card-border] text-xs text-[--text-secondary] space-y-1">
          <p className="flex justify-between">
            <span>Fiber</span>
            <span>12 / 25 g</span>
          </p>
          <p className="flex justify-between">
            <span>Sugar</span>
            <span>30 / 50 g</span>
          </p>
          <p className="flex justify-between">
            <span>Water</span>
            <span>
              {waterIntake} / {waterGoal} ml
            </span>
          </p>
        </div>
      </details>
    </div>
  );
}