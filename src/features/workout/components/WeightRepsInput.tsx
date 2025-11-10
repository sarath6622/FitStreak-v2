import { Check, Pencil } from "lucide-react";
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
    placeholderWeights?: number[];
  placeholderReps?: number[];
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
  placeholderWeights,   // ⬅️ include here
  placeholderReps,      // ⬅️ include here
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
  <div className="mb-2">
    {/* Header */}
    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-400 mb-1 text-center">
      <span className="w-full">Set</span>
      <span className="w-full">Weight</span>
      <span className="w-full">Reps</span>
      <span className="w-full">✓</span>
    </div>

    {/* Rows */}
    <div className="max-h-48 overflow-y-auto space-y-1">
      {weights.map((weight, idx) => {
        const isConfirmed = confirmedRows[idx];
        const showPicker = !isConfirmed;

        return (
          <div
            key={idx}
            className={`rounded-md p-0.5 text-center ${
              isConfirmed
                ? "bg-green-900/20 border border-green-700"
                : "border border-yellow-400/50"
            }`}
          >
            <div className="grid grid-cols-4 gap-2 items-center">
              {/* Set Number */}
              <span className="text-white text-sm w-full">{idx + 1}</span>

              {showPicker ? (
                <>
                  {/* Weight */}
<input
  type="number"
  inputMode="decimal"
  step="0.5"
  min="0"
  placeholder={String(
    (placeholderWeights && placeholderWeights[idx]) ?? 0
  )}
  className="w-full bg-gray-800 border border-gray-600 rounded 
             text-center text-white py-0.5 text-sm"
  value={weight === 0 ? "" : weight}
  onChange={(e) => onWeightChange(idx, e.target.value)}
  disabled={disabled}
/>

<input
  type="number"
  inputMode="numeric"
  min="0"
  placeholder={String(
    (placeholderReps && placeholderReps[idx]) ?? 0
  )}
  className="w-full bg-gray-800 border border-gray-600 rounded 
             text-center text-white py-0.5 text-sm"
  value={repsPerSet[idx] === 0 ? "" : repsPerSet[idx]}
  onChange={(e) => onRepsChange(idx, e.target.value)}
  disabled={disabled}
/>

                  {/* Confirm */}
                  <button
                    type="button"
                    onClick={() => toggleConfirm(idx)}
                    className="w-full h-6 rounded flex items-center justify-center 
                               bg-gray-700 text-gray-300"
                  >
                    <Check size={11} strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-white text-sm w-full">{weight}</span>
                  <span className="text-white text-sm w-full">
                    {repsPerSet[idx]}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleConfirm(idx)}
                    className="w-full text-blue-400 hover:text-blue-300 flex items-center justify-center"
                  >
                    <Pencil size={11} />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}