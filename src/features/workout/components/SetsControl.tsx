import { Minus, Plus } from "lucide-react";

interface SetsControlProps {
  sets: number;
  setSets: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export default function SetsControl({ sets, setSets, error, disabled }: SetsControlProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      {/* Label */}
      <label className="text-xs text-gray-400">
        Sets {error && <span className="ml-2 text-red-400">{error}</span>}
      </label>

      {/* Counter */}
      <div
        className={`flex items-center gap-2 ${
          error ? "text-red-400" : "text-gray-300"
        }`}
      >
        {/* Decrement button */}
        <button
          type="button"
          aria-label="Decrease sets"
          onClick={() => setSets(Math.max(1, sets - 1))}
          className="bg-gray-800 p-1.5 rounded-full hover:bg-gray-700 active:scale-95 
                     disabled:opacity-40 disabled:cursor-not-allowed transition"
          disabled={disabled}
        >
          <Minus size={14} />
        </button>

        {/* Pill */}
        <span
          className="w-10 text-center text-sm font-medium text-white bg-gray-900 
                     rounded-full py-0.5 border border-gray-700"
        >
          {sets}
        </span>

        {/* Increment button */}
        <button
          type="button"
          aria-label="Increase sets"
          onClick={() => setSets(sets + 1)}
          className="bg-gray-800 p-1.5 rounded-full hover:bg-gray-700 active:scale-95 
                     disabled:opacity-40 disabled:cursor-not-allowed transition"
          disabled={disabled}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}