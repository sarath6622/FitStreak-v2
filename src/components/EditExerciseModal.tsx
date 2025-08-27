"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getExercisesByMuscleGroups } from "@/services/workoutService";

import { Exercise } from "@/types";

interface EditExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  onSave: (updatedExercise: Exercise) => Promise<void>;
}

const fixedGroups = [
  "Chest",
  "Legs",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Core",
  "Glutes",
];

export default function EditExerciseModal({
  open,
  onClose,
  exercise,
  onSave,
}: EditExerciseModalProps) {
  const [form, setForm] = useState<Exercise | null>(exercise);
  const [exerciseOptions, setExerciseOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [muscle, setMuscle] = useState(form?.muscleGroup ?? "");
  const [search, setSearch] = useState("");

  // Reset state whenever modal opens with a new exercise
  useEffect(() => {
    if (exercise) {
      setForm(exercise);
      setMuscle(exercise.muscleGroup);

      (async () => {
        const exercisesByGroup = await getExercisesByMuscleGroups([
          exercise.muscleGroup,
        ]);
        const exercises = exercisesByGroup[exercise.muscleGroup] || [];
        setExerciseOptions(
          exercises.map((name) => ({ label: name, value: name }))
        );
      })();
    }
  }, [exercise]);

  // Build muscle group list (fixed + sorted)
  const muscleGroups = useMemo(() => {
    return [...fixedGroups].sort();
  }, []);

  // Handle muscle group change
  const handleMuscleGroupChange = async (value: string) => {
    setMuscle(value);

    setForm((prev) =>
      prev ? { ...prev, muscleGroup: value, name: "", id: "" } : null
    );

    const exercisesByGroup = await getExercisesByMuscleGroups([value]);
    const exercises = exercisesByGroup[value] || [];

    setExerciseOptions(exercises.map((name) => ({ label: name, value: name })));
  };

  // Handle exercise change
  const handleExerciseChange = (value: string) => {
    setForm((prev) =>
      prev ? { ...prev, name: value, id: value } : null
    );
  };

const handleSave = () => {
  if (!form) return;

  // ✅ Close modal instantly for fast UX
  onClose();

  // ✅ Let parent decide how to handle optimistic update
  onSave(form)
    .then(() => {
      console.log("Exercise updated successfully");
    })
    .catch((err) => {
      console.error("Failed to update exercise:", err);
      // Parent can rollback state here
    });
};

  // Filter exercise options based on search
  const filteredExercises = exerciseOptions.filter((e) =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl mb-2">
            Edit Exercise
          </DialogTitle>
        </DialogHeader>

        {form && (
          <div className="space-y-4 w-full">
            {/* Muscle Group Select */}
            <Select value={muscle} onValueChange={handleMuscleGroupChange}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg text-sm sm:text-base">
                <SelectValue placeholder="Select Muscle Group" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-gray-700 text-white max-h-60 overflow-y-auto">
                {muscleGroups.map((g) => (
                  <SelectItem
                    key={g}
                    value={g}
                    className="text-sm sm:text-base py-2"
                  >
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

{/* Exercise Select + Search */}
<Select
  value={
    exerciseOptions.some((e) => e.value === form?.name) ? form?.name : ""
  }

  onValueChange={handleExerciseChange}
>
  <SelectTrigger className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg text-sm sm:text-base">
    <SelectValue placeholder="Select Exercise" />
  </SelectTrigger>
  <SelectContent className="bg-gray-900 border border-gray-700 text-white max-h-72 overflow-y-auto">
    <div className="p-2">
      <Input
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-white text-sm"
      />
    </div>
    {filteredExercises.map((e) => (
      <SelectItem
        key={e.value}
        value={e.value}
        className="text-sm sm:text-base py-2"
      >
        {e.label}
      </SelectItem>
    ))}
    {filteredExercises.length === 0 && (
      <div className="p-2 text-gray-400 text-sm">No results</div>
    )}
  </SelectContent>
</Select>
          </div>
        )}

        <button
          className="mt-4 bg-blue-600 px-4 py-2 rounded w-full text-sm sm:text-base"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </DialogContent>
    </Dialog>
  );
}