"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import { Input } from "@/features/shared/ui/input";
import { getExercisesByMuscleGroups } from "@/features/shared/services/workoutService";

import { Exercise } from "@/features/shared/types";
import { toast } from "sonner";

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
    // Edit mode
    setForm(exercise);
    setMuscle(exercise.muscleGroup);

    (async () => {
      const exercisesByGroup = await getExercisesByMuscleGroups([
        exercise.muscleGroup,
      ]);
      const exercises = exercisesByGroup[exercise.muscleGroup] || [];

      setExerciseOptions(
        exercises.map((ex) => ({ label: ex.name, value: ex.id }))
      );
    })();
  } else {
    // Add mode → reset form
    setForm({
      exerciseId: "",
      name: "",
      muscleGroup: "",
      // Default target: 3 sets of 12 reps
      sets: 3 as unknown as any,
      reps: "12" as unknown as any,
    } as unknown as Exercise);
    setMuscle("");
    setExerciseOptions([]);
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
      prev ? { ...prev, muscleGroup: value, exerciseId: "", name: "" } : null
    );

    const exercisesByGroup = await getExercisesByMuscleGroups([value]);
    const exercises = exercisesByGroup[value] || [];

    setExerciseOptions(exercises.map((ex) => ({ label: ex.name, value: ex.id })));
  };

  // Handle exercise change
  const handleExerciseChange = (value: string) => {
    const selected = exerciseOptions.find((e) => e.value === value);
    if (selected) {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              exerciseId: selected.value,
              name: selected.label,
              // ensure defaults are present for new selections
              sets: (prev as any).sets && Number((prev as any).sets) > 0 ? (prev as any).sets : (3 as any),
              reps: (prev as any).reps ? (prev as any).reps : ("12" as any),
            }
          : null
      );
    }
  };


  const handleSave = () => {
  if (!form) return;

  // Check required fields
  if (!form.muscleGroup || !form.exerciseId || !form.name) {
    toast.error("Please select a muscle group and exercise before saving.");
    return;
  }

  onClose();

  onSave(form)
    .then(() => {
      console.log("Exercise updated successfully");
    })
    .catch((err) => {
      console.error("Failed to update exercise:", err);
    });
};

  // Filter exercise options based on search
  const filteredExercises = exerciseOptions.filter((e) =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black text-white w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6 rounded-lg">
<DialogHeader>
  <DialogTitle className="text-lg sm:text-xl mb-2">
    {exercise ? "Edit Exercise" : "Add New Exercise"}
  </DialogTitle>
</DialogHeader>

        {form && (
          <div className="space-y-4 w-full bg-[var(--card-background)]">
            {/* Muscle Group Select */}
            <Select value={muscle} onValueChange={handleMuscleGroupChange}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg text-sm sm:text-base">
                <SelectValue placeholder="Select Muscle Group" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-white max-h-60 overflow-y-auto">
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
            <Select value={form?.exerciseId || ""} onValueChange={handleExerciseChange}>
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
                  <SelectItem key={e.value} value={e.value}>
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
  {exercise ? "Save Changes" : "Add Exercise"}
</button>
      </DialogContent>
    </Dialog>
  );
}