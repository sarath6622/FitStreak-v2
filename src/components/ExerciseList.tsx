import exercisesData from "@/data/exercises.json";

interface Exercise {
  name: string;
  muscleGroup: string;
  subGroup: string;
  equipment: string[];
  movementType: string;
  difficulty: string;
  secondaryMuscleGroups: string[];
}

interface ExerciseListProps {
  muscleGroup: string;
  onSelectExercise: (exerciseName: string) => void;
}

export default function ExerciseList({
  muscleGroup,
  onSelectExercise,
}: ExerciseListProps) {
  // Filter exercises by the selected muscle group
  const filteredExercises = (exercisesData as Exercise[]).filter(
    (exercise) => exercise.muscleGroup === muscleGroup
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">
        {muscleGroup} Exercises
      </h2>

      {filteredExercises.length === 0 ? (
        <p className="text-gray-400">No exercises found for {muscleGroup}.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => onSelectExercise(exercise.name)}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-white text-left hover:border-yellow-500 transition"
            >
              <div className="font-semibold">{exercise.name}</div>
              <div className="text-sm text-gray-400">
                {exercise.subGroup} • {exercise.movementType} •{" "}
                {exercise.difficulty}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Equipment: {exercise.equipment.join(", ")}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}