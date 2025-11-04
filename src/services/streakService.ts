import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

// Helper: get week start date (Monday as start of week, can adjust)
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split("T")[0];
}

export async function updateUserStreak(userId: string, dateKey: string) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data() || {};

  let currentStreak = userData.currentStreak || 0;
  let longestStreak = userData.longestStreak || 0;
  const lastWorkoutDate = userData.lastWorkoutDate;

  // ----- Daily Streak -----
  if (lastWorkoutDate) {
    const prev = new Date(lastWorkoutDate);
    const today = new Date(dateKey);
    const diff = (today.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      currentStreak += 1;
    } else if (diff > 1) {
      currentStreak = 1; // reset
    } // diff === 0 → same day, no change
  } else {
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // ----- Weekly Frequency Streak -----
  const weeklyFrequency = parseInt(userData.weeklyFrequency || "5");
  let weeklyCurrentStreak = userData.weeklyCurrentStreak || 0;
  let weeklyLongestStreak = userData.weeklyLongestStreak || 0;
  let workoutsThisWeek = userData.workoutsThisWeek || 0;
  let currentWeekStart = userData.currentWeekStart;

  const today = new Date(dateKey);
  const weekStart = getWeekStart(today);

  if (currentWeekStart === weekStart) {
    // still in the same week → increment workout count
    workoutsThisWeek += 1;

    if (workoutsThisWeek === weeklyFrequency) {
      weeklyCurrentStreak += 1;
      weeklyLongestStreak = Math.max(weeklyLongestStreak, weeklyCurrentStreak);
    }
  } else {
    // new week → check if last week met the target
    if (workoutsThisWeek < weeklyFrequency) {
      weeklyCurrentStreak = 0; // reset streak if target not met
    }

    workoutsThisWeek = 1; // start counting for new week
    currentWeekStart = weekStart;
  }

  // ----- Update Firestore -----
  await updateDoc(userRef, {
    // Daily streak
    currentStreak,
    longestStreak,
    lastWorkoutDate: dateKey,

    // Weekly streak
    weeklyCurrentStreak,
    weeklyLongestStreak,
    workoutsThisWeek,
    currentWeekStart,
  });
}