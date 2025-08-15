import { Check } from "lucide-react";
import { useState } from "react";

interface WeightRepsInputProps {
    weights: number[];
    repsPerSet: number[];
    onWeightChange: (index: number, value: string) => void;
    onRepsChange: (index: number, value: string) => void;
    errors: { [key: string]: string };
    repOptions: number[];
    disabled?: boolean;
    onRowConfirm?: (index: number) => void; // Callback for confirmed rows
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
    const [confirmedRows, setConfirmedRows] = useState<boolean[]>(
        Array(weights.length).fill(false)
    );

    const toggleConfirm = (idx: number) => {
        setConfirmedRows((prev) => {
            const updated = [...prev];
            updated[idx] = !updated[idx];
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

            {weights.map((weight, idx) => (
                <div
                    key={idx}
                    className={`mb-2 rounded-lg p-1 transition-colors duration-200 ${confirmedRows[idx] ? "bg-green-900/40 border border-green-500" : ""
                        }`}
                >
                    <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
                        {/* Set number */}
                        <span className="text-center text-white text-sm">{idx + 1}</span>

                        {/* Weight input */}
                        <input
                            id={`weight-${idx}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            value={weight === 0 ? "" : weight}
                            placeholder="Enter"
                            onChange={(e) => onWeightChange(idx, e.target.value)}
                            className={`w-full text-center p-1 rounded-md bg-gray-800 border 
          ${errors[`weight-${idx}`] ? "border-red-500" : "border-gray-700"} 
          focus:border-yellow-500 text-sm`}
                            disabled={disabled || confirmedRows[idx]}
                        />

                        {/* Reps dropdown */}
                        <select
                            id={`reps-${idx}`}
                            value={repsPerSet[idx]}
                            onChange={(e) => onRepsChange(idx, e.target.value)}
                            className={`w-full p-1 rounded-md bg-gray-800 border 
          ${errors[`rep-${idx}`] ? "border-red-500" : "border-gray-700"} 
          focus:border-yellow-500 text-sm`}
                            disabled={disabled || confirmedRows[idx]}
                        >
                            {repOptions.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>

                        {/* Confirm Tick */}
                        <button
                            type="button"
                            onClick={() => toggleConfirm(idx)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200
          ${confirmedRows[idx]
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                }`}
                        >
                            <Check size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}