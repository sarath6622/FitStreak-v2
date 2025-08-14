import { WorkoutSession } from "@/types";
import { useState } from "react";

interface Props {
  workouts: WorkoutSession[];
  onFilter: (filtered: WorkoutSession[]) => void;
}

export default function Filters({ workouts, onFilter }: Props) {
  const [muscle, setMuscle] = useState("");

  const handleFilter = () => {
    if (!muscle) {
      onFilter(workouts);
    } else {
      onFilter(
        workouts.filter((w) =>
          w.exercises.some((e) => e.muscleGroup.toLowerCase() === muscle.toLowerCase())
        )
      );
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={muscle}
        onChange={(e) => setMuscle(e.target.value)}
        placeholder="Filter by muscle group"
        className="bg-gray-800 border border-gray-700 p-2 rounded-lg flex-1"
      />
      <button
        onClick={handleFilter}
        className="bg-blue-600 px-4 rounded-lg hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
}