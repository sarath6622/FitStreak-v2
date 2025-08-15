interface RestInputProps {
  rest: number;
  setRest: (value: number) => void;
  disabled?: boolean;
}

export default function RestInput({ rest, setRest, disabled }: RestInputProps) {
  const options = [30, 60, 90, 120];

  return (
    <div className="flex flex-row mb-4 justify-between items-center">
      <label htmlFor="rest" className="text-sm mb-1">Rest</label>
      <div className="flex items-center gap-1 mb-1">
        {options.map((sec) => (
          <button
            key={sec}
            onClick={() => setRest(sec)}
            disabled={disabled}
            className={`px-2 py-1 rounded text-xs
              ${rest === sec ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-300"}
            `}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}