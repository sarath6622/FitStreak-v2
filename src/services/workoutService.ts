// services/workoutService.ts
import { db } from "@/firebase"; // Adjust the import based on your Firebase config file
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Get workout for a specific date + exercise
 */
export const getWorkoutForExercise = async (
  uid: string,
  date: string,
  exerciseId: string
) => {
  // fetch workout for that date
  const workoutRef = doc(db, "users", uid, "workouts", date);
  const workoutSnap = await getDoc(workoutRef);

  if (!workoutSnap.exists()) {
    console.log(`[getWorkoutForExercise] No workout found for ${date}, exerciseId=${exerciseId}`);
    return null;
  }

  const data = workoutSnap.data();
  const exercise = Array.isArray(data.exercises)
    ? data.exercises.find((ex: { exerciseId?: string; id?: string }) => {
        // Support both new and legacy fields
        return ex.exerciseId === exerciseId || ex.id === exerciseId;
      })
    : null;

  const result = {
    date,
    duration: data.duration ?? null,
    rest: data.rest ?? null,
    exercise,
  };

  return result;
};

/**
 * Get the most recent *past* workout for an exercise
 */
export const getLastWorkoutForExercise = async (
  uid: string,
  exerciseId: string
) => {
  // 1️⃣ lookup exerciseIndex for this exercise
  const indexRef = doc(db, "users", uid, "exerciseIndex", exerciseId);
  const indexSnap = await getDoc(indexRef);

  if (!indexSnap.exists()) {
    console.log(`[getLastWorkoutForExercise] No index found for exerciseId=${exerciseId}`);
    return null;
  }

  const { history } = indexSnap.data() as { history: string[] };
  if (!history || history.length === 0) {
    console.log(`[getLastWorkoutForExercise] No history for exerciseId=${exerciseId}`);
    return null;
  }

  // 2️⃣ take the most recent PAST date (exclude today if present)
  const today = new Date().toISOString().split("T")[0];
  const lastPastDate = history.find(d => d !== today);
  if (!lastPastDate) {
    console.log(`[getLastWorkoutForExercise] Only today's entry exists for exerciseId=${exerciseId}`);
    return null;
  }

  // 3️⃣ fetch that workout doc
  const result = await getWorkoutForExercise(uid, lastPastDate, exerciseId);
   console.log("[getLastWorkoutForExercise] returning:", JSON.stringify(result, null, 2));

  
  return result;
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

    data.exercises.forEach((exercise: { name?: string; sets?: number; repsPerSet?: number[]; weight?: number[] }) => {
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

export const upsertWorkout = async (uid: string, date: string, exercise: Record<string, unknown>, duration: number, rest: number) => {
  const workoutDocRef = doc(db, "users", uid, "workouts", date);
  const docSnap = await getDoc(workoutDocRef);

  if (docSnap.exists()) {
    const existingData = docSnap.data();
    const existingExercises = existingData.exercises || [];

    // Check if this exercise already exists in today's workout
    const exerciseIndex = existingExercises.findIndex((ex: { name?: string }) => ex.name === exercise.name);

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
// export async function getUserWorkoutHistory(
//   userId: string,
//   limitCount: number
// ): Promise<WorkoutExerciseHistoryItem[]> {
//   const workoutsRef = collection(db, "users", userId, "workouts");

//   const q = query(
//     workoutsRef,
//     orderBy("date", "desc"),
//     limit(limitCount)
//   );

//   const querySnapshot = await getDocs(q);

//   const exercisesHistory: WorkoutExerciseHistoryItem[] = [];

//   querySnapshot.docs.forEach((doc) => {
//     const data = doc.data();
//     const workoutDate = data.date;

//     if (Array.isArray(data.exercises)) {
//       data.exercises.forEach((ex: any) => {
//         exercisesHistory.push({
//           date: workoutDate,
//           muscleGroup: ex.muscleGroup,
//           sets: ex.sets,
//           weight: ex.weight || [],
//           repsPerSet: ex.repsPerSet || [],
//           name: ex.name,
//         });
//       });
//     }
//   });

//   return exercisesHistory;
// }

export async function getUserWorkoutHistory(
  userId: string,
  limitCount: number
): Promise<WorkoutExerciseHistoryItem[]> {
  const workoutsRef = collection(db, "users", userId, "workouts");

  const q = query(
    workoutsRef,
    orderBy("__name__", "desc"), // order by document ID (the date string)
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  const exercisesHistory: WorkoutExerciseHistoryItem[] = [];

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const workoutDate = doc.id; // 👈 FIX: use document ID as date

    if (Array.isArray(data.exercises)) {
      data.exercises.forEach((ex: { muscleGroup?: string; sets?: number; weight?: number[]; repsPerSet?: number[]; name?: string }) => {
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

  const sortedDates = dates
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const startOfISOWeek = (date: Date) => {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // 0 = Monday
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfISOWeek = (date: Date) => {
    const start = startOfISOWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const getYearWeek = (date: Date) => {
    const s = startOfISOWeek(date);
    const week1 = startOfISOWeek(new Date(s.getFullYear(), 0, 4));
    const diffDays = Math.round((s.getTime() - week1.getTime()) / 86400000);
    const weekNum = Math.floor(diffDays / 7) + 1;
    return `${s.getFullYear()}-W${weekNum}`;
  };

  // Group by week key
  const weeksMap: Record<string, Date[]> = {};
  sortedDates.forEach((d) => {
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

  const today = new Date();
  const currentWeekKey = getYearWeek(today);
  const workoutsThisWeek = weeksMap[currentWeekKey]?.length || 0;

  for (let i = 0; i < sortedWeeks.length; i++) {
    const weekKey = sortedWeeks[i];
    const workouts = weeksMap[weekKey].length;

    if (weekKey !== currentWeekKey) {
      // Past weeks: either met target or streak resets
      if (workouts >= weeklyFrequency) {
        currentStreak += workouts; // count workout days in successful weeks
      } else {
        currentStreak = 0;
      }
    } else {
      // Current week: keep streak alive if target still achievable
      const end = endOfISOWeek(today);
      const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.setHours(0,0,0,0)) / 86400000) + 1);
      const stillPossible = workouts + daysLeft >= weeklyFrequency;
      if (workouts >= weeklyFrequency || stillPossible) {
        currentStreak += workouts; // add logged days so far
      } else {
        currentStreak = 0; // cannot meet target anymore this week
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
  if (!user) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      workoutsThisWeek: 0,
      weeklyFrequency: 5,
    };
  }

  // read weeklyFrequency from user profile
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const weeklyFrequency = parseInt(String(userDoc.data()?.weeklyFrequency ?? 5));

  // fetch workout dates from subcollection
  const workoutsRef = collection(db, "users", user.uid, "workouts");
  const snap = await getDocs(workoutsRef);
  const dates: string[] = snap.docs.map((d) => d.id);

  const { currentStreak, longestStreak, workoutsThisWeek } = calculateWeeklyFrequencyStreak(
    dates,
    weeklyFrequency
  );

  return {
    currentStreak,
    longestStreak,
    workoutsThisWeek,
    weeklyFrequency,
  };
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