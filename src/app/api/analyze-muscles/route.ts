import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

interface WorkoutExerciseHistoryItem {
  date: string;
  muscleGroup: string;
  sets?: number;
  weight: number[];
  repsPerSet: number[];
  name: string;
}

interface ProcessedHistory {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
  totalVolume: number;
}

interface OutputHistory {
  muscleGroup: string;
  lastTrained: string;
  daysAgo: number;
  intensity: "low" | "medium" | "high";
}

// 🔑 Muscle group normalization map
const muscleMap: Record<string, string> = {
  Core: "Abs",
  Abdominals: "Abs",
  Chest: "Chest",
  Back: "Back",
  Quads: "Legs",
  Hamstrings: "Legs",
  Calves: "Calves",
  Shoulders: "Shoulders",
  Biceps: "Biceps",
  Triceps: "Triceps",
  Glutes: "Glutes",
};

// 🔹 Per-muscle volume thresholds
const volumeThresholds: Record<string, { medium: number; high: number }> = {
  Chest: { medium: 1000, high: 2500 },
  Back: { medium: 1000, high: 2500 },
  Legs: { medium: 1500, high: 3500 },
  Shoulders: { medium: 800, high: 2000 },
  Biceps: { medium: 400, high: 1000 },
  Triceps: { medium: 400, high: 1000 },
  Abs: { medium: 300, high: 800 },
  Calves: { medium: 400, high: 1000 },
  Glutes: { medium: 1000, high: 2500 },
};

// 🔹 Get workout history from Firestore
async function getUserWorkoutHistory(
  userId: string,
  limitCount: number
): Promise<WorkoutExerciseHistoryItem[]> {
  const workoutsRef = collection(db, "users", userId, "workouts");
  const q = query(workoutsRef, orderBy("__name__", "desc"), limit(limitCount));
  const querySnapshot = await getDocs(q);

  const exercisesHistory: WorkoutExerciseHistoryItem[] = [];
  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const workoutDate = doc.id;

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

// 🔹 API Route
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const rawHistory = await getUserWorkoutHistory(userId, 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const majorMuscleGroups = [
      "Chest", "Back", "Legs", "Shoulders", "Biceps",
      "Triceps", "Abs", "Calves", "Glutes",
    ];

    // Initialize processed history
    const processedHistory: Record<string, ProcessedHistory> = {};
    majorMuscleGroups.forEach((group) => {
      processedHistory[group] = {
        muscleGroup: group,
        lastTrained: "Never",
        daysAgo: Infinity,
        totalVolume: 0,
      };
    });

    // Process each exercise
    rawHistory.forEach((exercise) => {
      const { date, muscleGroup, repsPerSet, weight } = exercise;
      const normalizedGroup = muscleMap[muscleGroup] || muscleGroup;

      if (!majorMuscleGroups.includes(normalizedGroup) || !date) return;

      const workoutDate = new Date(date);
      workoutDate.setHours(0, 0, 0, 0);
      const daysAgo = Math.floor(
        (today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const totalVolume = repsPerSet.reduce(
        (sum, reps, i) => sum + reps * (weight[i] || 0),
        0
      );

      const existing = processedHistory[normalizedGroup];

      // Update last trained if more recent
      if (daysAgo < existing.daysAgo) {
        existing.lastTrained = date;
        existing.daysAgo = daysAgo;
      }

      // Accumulate total volume
      existing.totalVolume += totalVolume;
    });

    // Generate summary with intensity
    const summary: OutputHistory[] = Object.values(processedHistory).map((m) => {
      const thresholds = volumeThresholds[m.muscleGroup] || { medium: 500, high: 1500 };
      let intensity: "low" | "medium" | "high" = "low";

      if (m.totalVolume >= thresholds.high) intensity = "high";
      else if (m.totalVolume >= thresholds.medium) intensity = "medium";

      return {
        muscleGroup: m.muscleGroup,
        lastTrained: m.lastTrained,
        daysAgo: m.daysAgo === Infinity ? 7 : m.daysAgo,
        intensity,
      };
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in /api/analyze-muscles:", error);
    return NextResponse.json({ error: "Failed to analyze muscle groups" }, { status: 500 });
  }
}