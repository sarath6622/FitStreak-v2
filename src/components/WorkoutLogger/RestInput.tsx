interface RestInputProps {
  rest: number;
  setRest: (value: number) => void;
  disabled?: boolean;
}

export default function RestInput({ rest, setRest, disabled }: RestInputProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <label htmlFor="rest">Rest (seconds)</label>
      <input
        id="rest"
        type="number"
        min={0}
        max={600}
        value={rest}
        onChange={(e) => setRest(Number(e.target.value))}
        className="w-20 bg-gray-800 p-2 rounded-md text-center"
        disabled={disabled}
      />
    </div>
  );
}