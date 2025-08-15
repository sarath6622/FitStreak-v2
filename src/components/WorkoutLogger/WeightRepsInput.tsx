import { Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Picker from "react-mobile-picker";

interface WeightRepsInputProps {
  weights: number[];
  repsPerSet: number[];
  onWeightChange: (index: number, value: string) => void;
  onRepsChange: (index: number, value: string) => void;
  errors: { [key: string]: string };
  repOptions: number[];
  disabled?: boolean;
  onRowConfirm?: (index: number) => void;
  initialAutoConfirmFlags?: boolean[];
}

export default function WeightRepsInput({
  weights,
  repsPerSet,
  onWeightChange,
  onRepsChange,
  errors,
  repOptions,
  disabled,
  onRowConfirm,
  initialAutoConfirmFlags,   // <-- make sure this is here
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

      // Initialize flag for new rows
      if (flags[i] === undefined) {
        flags[i] = false;
      }

      if (!hasInit.current) {
        // First render
        updated[i] = flags[i] && w > 0;
        console.log(
          `[INIT] row ${i}: weight=${w}, flag=${flags[i]}, confirmed=${updated[i]}`
        );
      } else {
        // Subsequent updates
        if (updated[i] && w !== prevW) {
          updated[i] = false;
          console.log(`[UPDATE] row ${i}: weight changed -> unlock`);
        } else if (!updated[i] && flags[i] && w > 0) {
          updated[i] = true;
          console.log(`[UPDATE] row ${i}: auto-confirm -> confirmed`);
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

    // user clicked ✓ => enable auto confirm for this row from now on
    setAutoConfirmFlags((prev) => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });
    console.log(
  `toggleConfirm row ${idx}: before=${confirmedRows[idx]}, autoFlag=${autoConfirmFlags[idx]}`
);

    if (onRowConfirm) onRowConfirm(idx);
  };

  const weightOptions = Array.from({ length: 201 }, (_, i) => i);

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-white">Weight and Reps per set</label>
      <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 text-xs font-medium text-gray-400 mb-2">
        <span className="text-center">Set</span>
        <span className="text-center">Weight (kg)</span>
        <span className="text-center">Reps</span>
        <span className="text-center">✓</span>
      </div>

      {weights.map((weight, idx) => {
        const showPicker = !confirmedRows[idx];
        return (
          <div
            key={idx}
            className={`mb-2 rounded-lg p-1 ${
              confirmedRows[idx] ? "bg-green-900/40 border border-green-500" : ""
            }`}
          >
            <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
              <span className="text-center text-white text-sm">{idx + 1}</span>

              {showPicker ? (
                <Picker
                  value={{ weight }}
                  onChange={(val) => onWeightChange(idx, val.weight.toString())}
                  disabled={disabled}
                  height={90}
                  itemHeight={30}
                >
                  <Picker.Column name="weight">
                    {weightOptions.map((w) => (
                      <Picker.Item key={w} value={w}>
                        <span>{w}</span>
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              ) : (
                <span className="text-center text-white">{weight} kg</span>
              )}

              {showPicker ? (
                <Picker
                  value={{ reps: repsPerSet[idx] }}
                  onChange={(val) => onRepsChange(idx, val.reps.toString())}
                  disabled={disabled}
                  height={90}
                  itemHeight={30}
                >
                  <Picker.Column name="reps">
                    {repOptions.map((r) => (
                      <Picker.Item key={r} value={r}>
                        <span>{r}</span>
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
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