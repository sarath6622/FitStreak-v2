import { WorkoutSession } from "@/types";
import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  allWorkouts: WorkoutSession[];
  onFilter: (filtered: WorkoutSession[]) => void;
  onDateRangeChange?: (range: string) => void; // notify parent to refetch from DB
}

export default function Filters({ allWorkouts, onFilter, onDateRangeChange }: Props) {
  const [muscle, setMuscle] = useState("all");
  const [dateRange, setDateRange] = useState<string>("14d"); // default: last 14 days

  // Build muscle group list from *all workouts*
  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    allWorkouts.forEach((w) =>
      w.exercises.forEach((e) => groups.add(e.muscleGroup))
    );
    return Array.from(groups).sort();
  }, [allWorkouts]);

  // Apply combined filters whenever inputs change or data updates
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

    const passesMuscle = (w: WorkoutSession) => {
      if (muscle === "all") return true;
      return w.exercises.some(
        (e) => e.muscleGroup.toLowerCase() === muscle.toLowerCase()
      );
    };

    const filtered = allWorkouts.filter((w) => passesDate(w) && passesMuscle(w));
    onFilter(filtered);
  }, [allWorkouts, muscle, dateRange, onFilter]);

  // Notify parent when date range changes so it can refetch from DB
  useEffect(() => {
    if (onDateRangeChange) onDateRangeChange(dateRange);
  }, [dateRange, onDateRangeChange]);

  return (
    <div className="flex gap-2 items-center w-full">
      {/* Muscle group filter */}
      <Select value={muscle} onValueChange={setMuscle}>
        <SelectTrigger className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg">
          <SelectValue placeholder="Filter by muscle group" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border border-gray-700 text-white">
          <SelectItem value="all">All muscle groups</SelectItem>
          {muscleGroups.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range filter */}
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="min-w-[160px] bg-gray-800 border border-gray-700 text-white rounded-lg">
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