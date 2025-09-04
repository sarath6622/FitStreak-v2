import { ChevronDown } from "lucide-react";
import { Measure } from "../MealModal"; // adjust relative import path

export default function QuantityMeasure({
  quantity,
  setQuantity,
  measure,
  setMeasure,
}: {
  quantity: number;
  setQuantity: (n: number) => void;
  measure: Measure;
  setMeasure: (m: Measure) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pt-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-xs text-gray-400 mb-1">Quantity</div>
        <input
          type="numeric"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value || 0))}
          className="w-full bg-transparent text-white"
        />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-xs text-gray-400 mb-1">Measure</div>
        <div className="relative">
          <select
            value={measure}
            onChange={(e) => setMeasure(e.target.value as Measure)} // 👈 cast
            className="w-full appearance-none bg-transparent text-white pr-7"
          >
            <option value="Grams">Grams</option>
            <option value="Serving">Serving</option>
            <option value="Cup">Cup</option>
            <option value="Oz">Oz</option>
            <option value="Piece">Piece</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/70"
            size={16}
          />
        </div>
      </div>
    </div>
  );
}