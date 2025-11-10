import { Card } from "@/features/shared/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number; // percent change
  color?: string; // optional override (e.g. "text-[var(--accent-blue)]")
}

export default function StatCard({ label, value, change, color }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const trendIcon = isPositive ? (
    <ArrowUpRight className="w-3 h-3 text-[var(--accent-green)]" />
  ) : isNegative ? (
    <ArrowDownRight className="w-3 h-3 text-red-400" />
  ) : (
    <Minus className="w-3 h-3 text-[var(--text-muted)]" />
  );

  const trendColor = isPositive
    ? "bg-[var(--accent-green)]/20 text-[var(--accent-green)]"
    : isNegative
    ? "bg-red-500/20 text-red-400"
    : "bg-[var(--surface-hover)] text-[var(--text-muted)]";

  return (
    <Card className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl px-4 py-3 flex flex-col gap-1 shadow-[var(--card-shadow)]">
      <p className="text-xs font-medium text-[var(--text-muted)] tracking-wide">
        {label}
      </p>

      <div className="flex items-center justify-between w-full">
        <span className={`text-lg font-semibold ${color || "text-[var(--text-primary)]"}`}>
          {value}
        </span>

        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trendColor}`}
          >
            {trendIcon}
            {change > 0
              ? `+${change.toFixed(1)}%`
              : change < 0
              ? `${change.toFixed(1)}%`
              : "0.0%"}
          </span>
        )}
      </div>
    </Card>
  );
}