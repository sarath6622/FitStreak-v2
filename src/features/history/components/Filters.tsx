import { WorkoutSession } from "@/features/shared/types";
import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";

interface Props {
  allWorkouts: WorkoutSession[];
  onFilter: (filtered: WorkoutSession[]) => void;
}

export default function Filters({ allWorkouts, onFilter }: Props) {
  const [dateRange, setDateRange] = useState<string>("14d"); // default: last 14 days

  // Apply date filter whenever inputs change or data updates
  useEffect(() => {
    const now = new Date();
    let startDate: Date | null = null;

    if (dateRange === "14d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 13); // include today + 13 previous = 14 days
    } else if (dateRange === "30d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
    } else {
      startDate = null; // all time
    }

    const passesDate = (w: WorkoutSession) => {
      if (!startDate) return true;
      // w.date is assumed YYYY-MM-DD
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      return d >= s && d <= now;
    };

    const filtered = allWorkouts.filter((w) => passesDate(w));
    onFilter(filtered);
  }, [allWorkouts, dateRange, onFilter]);

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wide">
        Filter Timeline by Date
      </label>
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg text-sm h-10"
          aria-label="Select date range"
        >
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border border-gray-700 text-white">
          <SelectItem value="14d">Last 14 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}