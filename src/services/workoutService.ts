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