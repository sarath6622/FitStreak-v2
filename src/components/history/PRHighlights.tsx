interface Props {
  prs: Record<string, number>;
}

export default function PRHighlights({ prs }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Personal Records</h2>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(prs).map(([exercise, weight]) => (
          <div key={exercise} className="bg-[var(--card-background)] p-3 rounded-lg flex justify-between">
            <span>{exercise}</span>
            <span className="text-yellow-400 font-bold">{weight} kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}