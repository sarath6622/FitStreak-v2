// services/workoutService.ts
import { db } from "@/firebase"; // Adjust the import based on your Firebase config file
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const getWorkoutForExercise = async (uid: string, date: string, exerciseName: string) => {
  const docRef = doc(db, "users", uid, "workouts", date);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  const exercise = data.exercises.find((ex: any) => ex.name === exerciseName);

  return {
    duration: data.duration,
    rest: data.rest,
    exercise
  };
};

export const getCompletedExercisesForToday = async (uid: string, date: string) => {
  const workoutDocRef = doc(db, "users", uid, "workouts", date);
  const docSnap = await getDoc(workoutDocRef);

  if (!docSnap.exists()) return {};

  const data = docSnap.data();
  const completed: Record<string, { setsDone: number; repsDone: number }> = {};

  (data.exercises || []).forEach((ex: any) => {
    completed[ex.name] = {
      setsDone: ex.sets,
      repsDone: ex.repsPerSet?.[0] || 0, // assuming uniform reps per set
    };
  });

  return completed;
};

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
