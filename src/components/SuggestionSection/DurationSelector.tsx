import clsx from "clsx";

interface DurationSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const durations = ["15 min", "30 min", "45 min", "60 min"];

export default function DurationSelector({
  value,
  onChange,
}: DurationSelectorProps) {
  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">
        Workout Duration
      </h4>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg">
        {durations.map((d) => {
          const selected = value === d;
          return (
            <button
              key={d}
              onClick={() => onChange(d)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                selected
                  ? "bg-blue-600 text-white ring-2 ring-blue-300 scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}