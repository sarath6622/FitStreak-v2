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
}: WeightRepsInputProps) {
  const [confirmedRows, setConfirmedRows] = useState<boolean[]>([]);
  const hasInitialized = useRef(false);
  const prevWeights = useRef<number[]>([]);

useEffect(() => {
  setConfirmedRows((prev) => {
    const updated = [...prev];
    weights.forEach((w, i) => {
      const prevConfirmed = prev[i];
      const prevW = prevWeights.current[i];

      if (!hasInitialized.current) {
        // First load: lock if weight > 0
        updated[i] = w > 0;
      } else {
        // Subsequent loads
        if (prevConfirmed === undefined) {
          // New rows: lock if weight > 0
          updated[i] = w > 0;
        } else if (prevConfirmed === true && w !== prevW) {
          // Weight changed on locked row: unlock
          updated[i] = false;
        } else if (prevConfirmed === false && w > 0) {
          // Weight > 0 but currently unconfirmed, auto confirm again (fix for row 0 case)
          updated[i] = true;
        }

        // Otherwise preserve confirmed state
      }
    });

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log("[DEBUG] Initial confirmedRows set:", updated);
    } else {
      console.log("[DEBUG] ConfirmedRows updated after weights change:", updated);
    }

    return updated;
  });

  prevWeights.current = weights;
}, [weights]);

  const weightOptions = Array.from({ length: 201 }, (_, i) => i);

  // Toggle confirmation state on tick click
  const toggleConfirm = (idx: number) => {
    setConfirmedRows((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      console.log(`[DEBUG] Toggled confirmation for row ${idx}: now ${updated[idx]}`);
      return updated;
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
        <span className="text-center">Weight (kg)</span>
        <span className="text-center">Reps</span>
        <span className="text-center">✓</span>
      </div>

      {weights.map((weight, idx) => {
        const showPicker = confirmedRows[idx] === false;
        console.log(
          `[DEBUG] Render row ${idx}: weight=${weight} confirmed=${confirmedRows[idx]} showPicker=${showPicker}`
        );

        return (
          <div
            key={idx}
            className={`mb-2 rounded-lg p-1 transition-colors duration-200 ${
              confirmedRows[idx]
                ? "bg-green-900/40 border border-green-500"
                : ""
            }`}
          >
            <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
              {/* Set number */}
              <span className="text-center text-white text-sm">{idx + 1}</span>

              {/* Weight */}
              {showPicker ? (
                <Picker
                  value={{ weight }}
                  onChange={(val) => onWeightChange(idx, val.weight.toString())}
                  height={90}
                  itemHeight={30}
                  disabled={disabled}
                >
                  <Picker.Column name="weight">
                    {weightOptions.map((w) => (
                      <Picker.Item key={w} value={w}>
                        <span className="picker-item-text">{w}</span>
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              ) : (
                <span className="text-center text-white">{weight} kg</span>
              )}

              {/* Reps */}
              {showPicker ? (
                <Picker
                  value={{ reps: repsPerSet[idx] }}
                  onChange={(val) => onRepsChange(idx, val.reps.toString())}
                  height={90}
                  itemHeight={30}
                  disabled={disabled}
                >
                  <Picker.Column name="reps">
                    {repOptions.map((r) => (
                      <Picker.Item key={r} value={r}>
                        <span className="picker-item-text">{r}</span>
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              ) : (
                <span className="text-center text-white">{repsPerSet[idx]}</span>
              )}

              {/* Confirm Tick */}
              <button
                type="button"
                onClick={() => toggleConfirm(idx)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  confirmedRows[idx]
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
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
