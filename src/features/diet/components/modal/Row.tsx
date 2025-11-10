export default function Row({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300">{label}</span>
      <span className="text-gray-100">{value} {unit}</span>
    </div>
  );
}