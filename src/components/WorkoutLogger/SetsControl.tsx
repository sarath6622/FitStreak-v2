import { Minus, Plus } from "lucide-react";

interface SetsControlProps {
  sets: number;
  setSets: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export default function SetsControl({ sets, setSets, error, disabled }: SetsControlProps) {
  return (
    <div className="flex flex-col mb-4 text-gray-300">
      <label className="flex items-center justify-between mb-1">
        <span>Sets</span>
        <span className="text-sm text-red-400">{error}</span>
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSets(Math.max(1, sets - 1))}
          className="bg-gray-800 p-2 rounded-full"
          disabled={disabled}
        >
          <Minus size={16} />
        </button>
        <span className="font-bold">{sets}</span>
        <button
          onClick={() => setSets(sets + 1)}
          className="bg-gray-800 p-2 rounded-full"
          disabled={disabled}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}