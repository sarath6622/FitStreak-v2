interface DurationInputProps {
  duration: number;
  setDuration: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export default function DurationInput({
  duration,
  setDuration,
  error,
  disabled,
}: DurationInputProps) {
  return (
<div className="flex flex-row mb-4 justify-between items-center">
  <label htmlFor="duration" className="text-sm mb-1">Duration</label>
  <div className="flex items-center gap-1 mb-1">
    {[15, 30, 45, 60].map((d) => (
      <button
        key={d}
        onClick={() => setDuration(d)}
        className={`px-2 py-1 rounded
          text-xs
          ${duration === d ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-300"}
        `}
      >
        {d}m
      </button>
    ))}
  </div>
  {error && <span className="text-red-400 text-xs">{error}</span>}
</div>
  );
}