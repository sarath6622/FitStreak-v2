import { Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface WeightRepsInputProps {
  weights: number[];
  repsPerSet: number[];
  onWeightChange: (index: number, value: string) => void;
  onRepsChange: (index: number, value: string) => void;
  errors: { [key: string]: string };
  disabled?: boolean;
  onRowConfirm?: (index: number) => void;
  initialAutoConfirmFlags?: boolean[];
  repOptions?: number[];
}

export default function WeightRepsInput({
  weights,
  repsPerSet,
  onWeightChange,
  onRepsChange,
  errors,
  disabled,
  onRowConfirm,
  initialAutoConfirmFlags,
}: WeightRepsInputProps) {
  const [confirmedRows, setConfirmedRows] = useState<boolean[]>([]);
  const [autoConfirmFlags, setAutoConfirmFlags] = useState<boolean[]>(
    initialAutoConfirmFlags || []
  );
  const prevWeights = useRef<number[]>([]);
  const hasInit = useRef(false);

  useEffect(() => {
    setConfirmedRows((prev) => {
      const updated = [...prev];
      const flags = [...autoConfirmFlags];

      weights.forEach((w, i) => {
        const prevW = prevWeights.current[i];
        if (flags[i] === undefined) {
          flags[i] = false;
        }

        if (!hasInit.current) {
          updated[i] = flags[i] && w > 0;
        } else {
          if (updated[i] && w !== prevW) {
            updated[i] = false;
          } else if (!updated[i] && flags[i] && w > 0) {
            updated[i] = true;
          }
        }
      });

      prevWeights.current = [...weights];
      if (flags.length !== autoConfirmFlags.length) {
        setAutoConfirmFlags(flags);
      }

      hasInit.current = true;
      return updated;
    });
  }, [weights, autoConfirmFlags]);

  const toggleConfirm = (idx: number) => {
    setConfirmedRows((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });

    // disable auto confirm so it doesn't instantly re-lock
    setAutoConfirmFlags((prev) => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });

    if (onRowConfirm) onRowConfirm(idx);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-white">
        Weight and Reps per set
      </label>

      <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 text-xs font-medium text-gray-400 mb-2">
        <span className="text-center">Set</span>
        <span className="text-center">Weight</span>
        <span className="text-center">Reps</span>
        <span className="text-center">✓</span>
      </div>

      {weights.map((weight, idx) => {
        const showPicker = !confirmedRows[idx];

        return (
          <div
            key={idx}
            className={`mb-2 rounded-lg p-1 ${
              confirmedRows[idx]
                ? "bg-green-900/40 border border-green-500"
                : "border border-yellow-400/50"
            }`}
          >
            <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
              <span className="text-center text-white text-sm">{idx + 1}</span>

              {/* Weight (numeric input) */}
              {showPicker ? (
                <div className="flex flex-col items-center w-full align-center">
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      placeholder="0"
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-md text-center text-white py-1 w-1/2"
                      value={weight === 0 ? "" : weight}
                      onChange={(e) => onWeightChange(idx, e.target.value)}
                      disabled={disabled}
                    />
                    <span className="text-xs text-gray-300">kg</span>
                  </div>
                </div>
              ) : (
                <span className="text-center text-white">{weight} kg</span>
              )}

              {/* Reps input replaces the picker */}
              {showPicker ? (
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  className="bg-gray-800 border border-gray-600 rounded-md text-center py-1 w-full text-white text-xs"
                  value={repsPerSet[idx] === 0 ? "" : repsPerSet[idx]}
                  onChange={(e) => onRepsChange(idx, e.target.value)}
                  disabled={disabled}
                />
              ) : (
                <span className="text-center text-white">{repsPerSet[idx]}</span>
              )}

              <button
                type="button"
                onClick={() => toggleConfirm(idx)}
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  confirmedRows[idx]
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
