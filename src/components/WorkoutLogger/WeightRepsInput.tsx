interface WeightRepsInputProps {
  weights: number[];
  repsPerSet: number[];
  onWeightChange: (index: number, value: string) => void;
  onRepsChange: (index: number, value: string) => void;
  errors: { [key: string]: string };
  repOptions: number[];
  disabled?: boolean;
}

export default function WeightRepsInput({
  weights,
  repsPerSet,
  onWeightChange,
  onRepsChange,
  errors,
  repOptions,
  disabled,
}: WeightRepsInputProps) {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-white">
        Weight and Reps per set
      </label>

      <div className="grid grid-cols-3 gap-3 text-sm font-medium text-gray-400 mb-2">
        <span>Set</span>
        <span>Weight (kg)</span>
        <span>Reps</span>
      </div>

      {weights.map((weight, idx) => (
        <div key={idx} className="mb-4">
          <div className="grid grid-cols-3 gap-3 items-start">
            {/* Set number */}
            <span className="text-center text-white">{idx + 1}</span>

            {/* Weight input */}
            <div>
              <input
                id={`weight-${idx}`}
                type="number"
                inputMode="decimal"
                min={0}
                value={weight}
                placeholder="kg"
                onChange={(e) => onWeightChange(idx, e.target.value)}
                className={`w-full text-center p-2 rounded-md bg-gray-800 border 
                  ${errors[`weight-${idx}`] ? "border-red-500" : "border-gray-700"} 
                  focus:border-yellow-500`}
                disabled={disabled}
                aria-invalid={!!errors[`weight-${idx}`]}
                aria-describedby={errors[`weight-${idx}`] ? `error-weight-${idx}` : undefined}
              />
              {errors[`weight-${idx}`] && (
                <span id={`error-weight-${idx}`} className="text-xs text-red-400 block mt-1">
                  {errors[`weight-${idx}`]}
                </span>
              )}
            </div>

            {/* Reps dropdown */}
            <div>
              <select
                id={`reps-${idx}`}
                value={repsPerSet[idx]}
                onChange={(e) => onRepsChange(idx, e.target.value)}
                className={`w-full p-2 rounded-md bg-gray-800 border 
                  ${errors[`rep-${idx}`] ? "border-red-500" : "border-gray-700"} 
                  focus:border-yellow-500`}
                disabled={disabled}
                aria-invalid={!!errors[`rep-${idx}`]}
                aria-describedby={errors[`rep-${idx}`] ? `error-rep-${idx}` : undefined}
              >
                {repOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors[`rep-${idx}`] && (
                <span id={`error-rep-${idx}`} className="text-xs text-red-400 block mt-1">
                  {errors[`rep-${idx}`]}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}