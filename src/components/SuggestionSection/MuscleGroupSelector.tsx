import clsx from "clsx";

interface MuscleGroupSelectorProps {
  value: string[]; // multiple selected groups
  onChange: (val: string[]) => void;
}

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Abs",
  "Full Body",
];

export default function MuscleGroupSelector({
  value,
  onChange,
}: MuscleGroupSelectorProps) {
  const toggleGroup = (group: string) => {
    if (value.includes(group)) {
      // remove if already selected
      onChange(value.filter((g) => g !== group));
    } else {
      // add if not selected
      onChange([...value, group]);
    }
  };

  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">
        Choose Muscle Groups
      </h4>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg">
        {muscleGroups.map((group) => {
          const selected = value.includes(group);
          return (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                selected
                  ? "bg-blue-600 text-white ring-2 ring-blue-300 scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {group}
            </button>
          );
        })}
      </div>
    </div>
  );
}