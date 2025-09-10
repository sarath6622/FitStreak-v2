// services/workoutService.ts
import { db } from "@/firebase"; // Adjust the import based on your Firebase config file
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const getWorkoutForExercise = async (
  uid: string,
  date: string,
  exerciseName: string
) => {
  console.log("[getWorkoutForExercise] ▶️ uid:", uid, "date:", date, "exerciseName:", exerciseName);

  const docRef = doc(db, "users", uid, "workouts", date);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.warn("[getWorkoutForExercise] ❌ No workout doc found for", date);
    return null;
  }

  const data = docSnap.data();
  console.log("[getWorkoutForExercise] 📄 Workout doc data:", data);

  if (!data.exercises) {
    console.warn("[getWorkoutForExercise] ⚠️ No 'exercises' field in workout doc");
    return {
      duration: data.duration ?? null,
      rest: data.rest ?? null,
      exercise: null,
    };
  }

  if (!Array.isArray(data.exercises)) {
    console.error(
      "[getWorkoutForExercise] ❌ 'exercises' is not an array. Value:",
      data.exercises
    );
    return {
      duration: data.duration ?? null,
      rest: data.rest ?? null,
      exercise: null,
    };
  }

  const exercise = data.exercises.find((ex: any) => ex.name === exerciseName);
  console.log("[getWorkoutForExercise] 🔍 Matched exercise:", exercise);

  return {
    duration: data.duration ?? null,
    rest: data.rest ?? null,
    exercise,
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

import { auth } from "@/firebase";

/**
 * ✅ Calculate streak based on weekly frequency.
 *
 * - Groups dates by ISO week
 * - A week is "active" if workouts >= weeklyFrequency
 * - Streak is the total number of consecutive workout days across active weeks
 */
export function calculateWeeklyFrequencyStreak(
  dates: string[],
  weeklyFrequency: number
): { currentStreak: number; longestStreak: number; workoutsThisWeek: number } {
  if (!dates.length) return { currentStreak: 0, longestStreak: 0, workoutsThisWeek: 0 };

  const sorted = dates
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const getYearWeek = (date: Date) => {
    const tmp = new Date(date);
    tmp.setHours(0, 0, 0, 0);
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    const weekNum =
      1 +
      Math.round(
        ((tmp.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      );
    return `${tmp.getFullYear()}-W${weekNum}`;
  };

  // Group by weeks
  const weeksMap: Record<string, Date[]> = {};
  sorted.forEach((d) => {
    const key = getYearWeek(d);
    if (!weeksMap[key]) weeksMap[key] = [];
    weeksMap[key].push(d);
  });

  const sortedWeeks = Object.keys(weeksMap).sort((a, b) => {
    const [aYear, aWeek] = a.split("-W").map(Number);
    const [bYear, bWeek] = b.split("-W").map(Number);
    return aYear === bYear ? aWeek - bWeek : aYear - bYear;
  });

  let currentStreak = 0;
  let longestStreak = 0;
  let consecutiveWeeks = 0;

  const today = new Date();
  const currentWeekKey = getYearWeek(today);
  const workoutsThisWeek = weeksMap[currentWeekKey]?.length || 0;

  for (let i = 0; i < sortedWeeks.length; i++) {
    const weekKey = sortedWeeks[i];
    const workouts = weeksMap[weekKey].length;

    if (workouts >= weeklyFrequency) {
      currentStreak += workouts;
      consecutiveWeeks++;
    } else {
      if (weekKey === currentWeekKey) {
        currentStreak += workouts;
      } else {
        currentStreak = 0;
        consecutiveWeeks = 0;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return { currentStreak, longestStreak, workoutsThisWeek };
}

/**
 * ✅ Wrapper: fetch Firestore workout dates + weeklyFrequency + calculate streak
 */
export async function getStreakData() {
  const user = auth.currentUser;
  if (!user) return { currentStreak: 0, longestStreak: 0, workoutsThisWeek: 0, weeklyFrequency: 5 };

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();
  const weeklyFrequency = parseInt(userData?.weeklyFrequency || "5");

  const workoutsRef = collection(db, "users", user.uid, "workouts");
  const snapshot = await getDocs(workoutsRef);

  const workoutDates: string[] = [];
  snapshot.forEach((doc) => workoutDates.push(doc.id));

  const { currentStreak, longestStreak, workoutsThisWeek } =
    calculateWeeklyFrequencyStreak(workoutDates, weeklyFrequency);

  return { currentStreak, longestStreak, workoutsThisWeek, weeklyFrequency };
}

function toTitleCase(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function getExercisesByMuscleGroups(
  muscleGroups: string[]
): Promise<Record<string, { id: string; name: string }[]>> {
  // Normalize requested groups and remember the desired display casing
  const requested = muscleGroups.map(g => g.trim()).filter(Boolean);
  if (requested.length === 0) return {};

  const lowerToDisplay = new Map<string, string>();
  for (const g of requested) {
    const low = g.toLowerCase();
    if (!lowerToDisplay.has(low)) lowerToDisplay.set(low, g); // preserve caller's casing
  }

  const wantedSet = new Set(Array.from(lowerToDisplay.keys()));

  const snapshot = await getDocs(collection(db, "exercises"));

  // Group by the *display* label that corresponds to the lowercased key
  const grouped: Record<string, { id: string; name: string }[]> = {};

  snapshot.forEach(doc => {
    const data = doc.data() as { muscleGroup?: string; name?: string };
    if (!data?.muscleGroup || !data?.name) return;

    const groupLow = String(data.muscleGroup).toLowerCase();
    if (!wantedSet.has(groupLow)) return;

    const displayKey = lowerToDisplay.get(groupLow)!; // e.g., "Chest"
    if (!grouped[displayKey]) grouped[displayKey] = [];

    grouped[displayKey].push({
      id: doc.id, // ✅ Firestore document ID
      name: toTitleCase(String(data.name)), // ✅ Title cased display name
    });
  });

  // Sort each group by name
  for (const key in grouped) {
    grouped[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}