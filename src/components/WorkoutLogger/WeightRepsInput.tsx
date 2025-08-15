import { Check, Copy } from "lucide-react";
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
                    console.log(
                        `[INIT] row ${i}: weight=${w}, flag=${flags[i]}, confirmed=${updated[i]}`
                    );
                } else {
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
        console.log(
            `toggleConfirm row ${idx}: before=${confirmedRows[idx]}, autoFlag=${autoConfirmFlags[idx]}`
        );

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

    // weight picker - 2 columns (tens + decimal portion: 0,2.5,5,7.5)
    const renderWeightPicker = (weight: number, idx: number) => {
        const tens = Math.floor(weight / 10);
        const decimal = weight % 10;

        return (
            <Picker
                value={{ tens, decimal }}
                onChange={(val) => {
                    const newWeight =
                        Number(val.tens) * 10 + Number(val.decimal);
                    onWeightChange(idx, newWeight.toString());
                }}
                disabled={disabled}
                height={90}
                itemHeight={30}
            >
                <Picker.Column name="tens">
                    {[...Array(21)].map((_, i) => (
                        <Picker.Item key={i} value={i}>
                            <span>{i}</span>
                        </Picker.Item>
                    ))}
                </Picker.Column>
                <Picker.Column name="decimal">
                    {[0, 2.5, 5, 7.5].map((v) => (
                        <Picker.Item key={v} value={v}>
                            <span>{v}</span>
                        </Picker.Item>
                    ))}
                </Picker.Column>
            </Picker>
        );
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
                        className={`mb-2 rounded-lg p-1 
        ${confirmedRows[idx]
                                ? "bg-green-900/40 border border-green-500"
                                : "border border-yellow-400/50"}
      `}
                    >
                        <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
                            <span className="text-center text-white text-sm">{idx + 1}</span>

                            {/* Weight */}
                            {showPicker ? (
                                <div className="flex flex-col items-center w-full">
                                    <span className="block text-[10px] w-auto text-gray-400 text-center">Choose weight</span>
                                    <div className="border border-gray-600 rounded-md w-auto">
                                        {renderWeightPicker(weight, idx)}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-center text-white">{weight} kg</span>
                            )}

                            {/* Reps */}
                            {showPicker ? (
                                <div className="flex flex-col items-center">

                                    <span className="block w-auto text-[10px] text-gray-400 text-center">Choose reps</span>
                                    <div className="border border-gray-400 rounded-md w-1/2">
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
                                    </div>
                                </div>
                            ) : (
                                <span className="text-center text-white">{repsPerSet[idx]}</span>
                            )}

                            {/* Confirm Tick */}
                            <button
                                type="button"
                                onClick={() => toggleConfirm(idx)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center 
            ${confirmedRows[idx]
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-700 text-gray-300"}
          `}
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