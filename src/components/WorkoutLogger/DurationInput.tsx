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
    <div className="flex items-center justify-between mb-6">
      <label htmlFor="duration">Duration (minutes)</label>
      <input
        id="duration"
        type="number"
        min={1}
        max={300}
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="w-20 bg-gray-800 p-2 rounded-md text-center"
        disabled={disabled}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}