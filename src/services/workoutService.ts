// services/workoutService.ts
import { db } from "@/firebase"; // Adjust the import based on your Firebase config file
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const getWorkoutForExercise = async (uid: string, date: string, exerciseName: string) => {
  const docRef = doc(db, "users", uid, "workouts", date);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  const exercise = data.exercises.find((ex: any) => ex.name === exerciseName);

  console.log("Fetched workout data:", data);
  
  return {
    duration: data.duration,
    rest: data.rest,
    exercise
  };
};

export const getLastWorkoutForExercise = async (uid: string, exerciseName: string) => {
  const today = new Date().toISOString().split("T")[0];

  const workoutsRef = collection(db, "users", uid, "workouts");
  const q = query(
    workoutsRef,
    where("date", "<", today),   // 👈 skip today
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const exercise = data.exercises.find((ex: any) => ex.name === exerciseName);
    console.log("Checking workout on date:", docSnap.id, "for exercise:", exerciseName, exercise);
    
    if (exercise) {
      return {
        date: docSnap.id,
        duration: data.duration,
        rest: data.rest,
        exercise
      };
    }
  }

  return null;
};

export async function getCompletedExercisesForToday(
  userId: string,
  date: string
) {
  const workoutsRef = collection(db, "users", userId, "workouts");
  const q = query(workoutsRef, where("date", "==", date));
  const snapshot = await getDocs(q);

  const completedExercises: Record<
    string,
    { setsDone: number; repsDone: number; totalSets: number }
  > = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.exercises) return;

    data.exercises.forEach((exercise: any) => {
      if (!exercise.name || !exercise.sets) return;

      const totalSets = exercise.sets;
      const repsArray = exercise.repsPerSet || [];
      const weightArray = exercise.weight || [];

      // ✅ Count only sets where weight != 0
      let setsDone = 0;
      let repsDone = 0;

      for (let i = 0; i < totalSets; i++) {
        if (weightArray[i] && weightArray[i] !== 0) {
          setsDone++;
          repsDone += repsArray[i] || 0;
        }
      }

      completedExercises[exercise.name] = {
        setsDone,
        repsDone,
        totalSets,
      };
    });
  });
  
  return completedExercises;
}

export const upsertWorkout = async (uid: string, date: string, exercise: any, duration: number, rest: number) => {
  const workoutDocRef = doc(db, "users", uid, "workouts", date);
  const docSnap = await getDoc(workoutDocRef);

  if (docSnap.exists()) {
    const existingData = docSnap.data();
    const existingExercises = existingData.exercises || [];

    // Check if this exercise already exists in today's workout
    const exerciseIndex = existingExercises.findIndex((ex: any) => ex.name === exercise.name);

    if (exerciseIndex >= 0) {
      existingExercises[exerciseIndex] = exercise; // update
    } else {
      existingExercises.push(exercise); // add
    }

    await setDoc(
      workoutDocRef,
      {
        ...existingData,
        duration, // You can decide whether to overwrite or sum durations
        rest,
        exercises: existingExercises,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await setDoc(workoutDocRef, {
      date,
      duration,
      rest,
      exercises: [exercise],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

// Returns the most recent workouts for a user (limit = how many to return)
export async function getWorkoutsForUser(
  userId: string,
  opts: { limit: number }
) {
  const q = query(
    collection(db, "workouts"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(opts.limit)
  );

  const snap = await getDocs(q);

  const workouts = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      date: d.date,
      muscleGroup: d.muscleGroup,
      sets: d.sets,
      weight: d.weight,
      repsPerSet: d.repsPerSet,
    };
  });

  return workouts;
}

export interface WorkoutExerciseHistoryItem {
  date: string; // workout date
  muscleGroup: string;
  sets: number;
  weight: number[];     // weight per set
  repsPerSet: number[]; // reps per set
  name: string;
}

/**
 * Fetches the user's recent workout history to analyze patterns.
 * @param userId The ID of the user.
 * @param limitCount Number of most recent workouts to fetch.
 * @returns Array of workout history items sorted descending by date.
 */
export async function getUserWorkoutHistory(
  userId: string,
  limitCount: number
): Promise<WorkoutExerciseHistoryItem[]> {
  const workoutsRef = collection(db, "users", userId, "workouts");

  const q = query(
    workoutsRef,
    orderBy("date", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  const exercisesHistory: WorkoutExerciseHistoryItem[] = [];

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const workoutDate = data.date;

    if (Array.isArray(data.exercises)) {
      data.exercises.forEach((ex: any) => {
        exercisesHistory.push({
          date: workoutDate,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          weight: ex.weight || [],
          repsPerSet: ex.repsPerSet || [],
          name: ex.name,
        });
      });
    }
  });

  return exercisesHistory;
}

/**
 * Fetches all unique exercise names for a user within a specific muscle group.
 * @param userId The ID of the user.
 * @param muscleGroup The muscle group to filter by (e.g., "Chest", "Legs").
 * @returns Array of unique exercise names for that muscle group.
 */
export async function getExerciseNamesByMuscleGroup(
  muscleGroups: string[]
): Promise<string[]> {
  const exercisesRef = collection(db, "exercises"); // <-- FIXED
  const snapshot = await getDocs(exercisesRef);

  const exerciseNames: Set<string> = new Set();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (
      data?.name &&
      muscleGroups.map((g) => g.toLowerCase()).includes(data?.muscleGroup?.toLowerCase())
    ) {
      exerciseNames.add(data.name);
    }
  });

  return Array.from(exerciseNames).sort();
}