import Row from "@/features/diet/components/modal/Row";

export default function NutrientsCard({
  totals,
}: {
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    netWeightG: number;
  } | null;
}) {
  const isEmpty = !totals;

  return (
    <div className="px-4 pt-4 pb-2 relative">
      <div
        className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 ${
          isEmpty ? "blur-sm opacity-60" : "blur-0 opacity-100"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Calories</div>
            <div className="mt-1 text-4xl font-bold leading-none">
              {totals ? totals.calories : 0}{" "}
              <span className="text-base">Cal</span>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-gray-300">
            Net wt: {totals ? totals.netWeightG : 0} g
          </span>
        </div>
        <div className="mt-2 divide-y divide-white/10 text-sm">
          <Row label="Proteins" value={totals?.protein ?? 0} unit="g" />
          <Row label="Fats" value={totals?.fat ?? 0} unit="g" />
          <Row label="Carbs" value={totals?.carbs ?? 0} unit="g" />
          <Row label="Fiber" value={totals?.fiber ?? 0} unit="g" />
        </div>
      </div>

      {/* Overlay text while blurred */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Select food to see nutrients</p>
        </div>
      )}
    </div>
  );
}