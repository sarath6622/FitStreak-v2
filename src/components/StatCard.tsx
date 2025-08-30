import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number; // percent change
  color?: string;
}

export default function StatCard({ label, value, change, color }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const trendIcon = isPositive ? (
    <ArrowUpRight className="w-3 h-3 text-green-400" />
  ) : isNegative ? (
    <ArrowDownRight className="w-3 h-3 text-red-400" />
  ) : (
    <Minus className="w-3 h-3 text-gray-400" />
  );

  const trendColor = isPositive
    ? "bg-green-500/20 text-green-400"
    : isNegative
    ? "bg-red-500/20 text-red-400"
    : "bg-gray-500/20 text-gray-400";

  return (
    <Card className="bg-gradient-to-b from-[#0d0f1a] to-[#161a2b] border border-gray-700 rounded-2xl px-4 py-3 flex flex-col gap-1 shadow-md">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="flex items-center justify-between w-full">
        <span className={`text-lg font-semibold ${color || "text-white"}`}>
          {value}
        </span>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trendColor}`}
          >
            {trendIcon}
            {change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
          </span>
        )}
      </div>
    </Card>
  );
}