import { WorkoutSession } from "@/types";
import { useState, useMemo } from "react";
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
}

export default function Filters({ allWorkouts, onFilter }: Props) {
  const [muscle, setMuscle] = useState("all");

  // Build muscle group list from *all workouts*
  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    allWorkouts.forEach((w) =>
      w.exercises.forEach((e) => groups.add(e.muscleGroup))
    );
    return Array.from(groups).sort();
  }, [allWorkouts]);

  const handleFilter = (value: string) => {
    setMuscle(value);
    if (value === "all") {
      onFilter(allWorkouts);
    } else {
      onFilter(
        allWorkouts.filter((w) =>
          w.exercises.some(
            (e) => e.muscleGroup.toLowerCase() === value.toLowerCase()
          )
        )
      );
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
<Select value={muscle} onValueChange={handleFilter}>
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
    </div>
  );
}