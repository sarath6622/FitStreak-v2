import clsx from "clsx";

interface DurationSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const durations = [ "45 min", "60 min", "90 min", "120 min"];

export default function DurationSelector({
  value,
  onChange,
}: DurationSelectorProps) {
  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide">
        Workout Duration
      </h4>
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--surface-dark)] border border-[var(--card-border)] rounded-lg">
        {durations.map((d) => {
          const selected = value === d;
          return (
            <button
              key={d}
              onClick={() => onChange(d)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                selected
                  ? "bg-[var(--accent-blue)] text-[var(--text-primary)] ring-2 ring-[var(--accent-blue-ring)] scale-105"
                  : "bg-[var(--surface-light)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
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