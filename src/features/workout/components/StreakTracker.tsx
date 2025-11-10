"use client";

import { useEffect, useState } from "react";
import { getStreakData } from "@/features/shared/services/workoutService";
import { Flame, Trophy } from "lucide-react";

export default function StreakTracker() {
  const [data, setData] = useState<{
    currentStreak: number;
    longestStreak: number;
    workoutsThisWeek: number;
    weeklyFrequency: number;
  }>({ currentStreak: 0, longestStreak: 0, workoutsThisWeek: 0, weeklyFrequency: 5 });

  useEffect(() => {
    async function fetchStreak() {
      const result = await getStreakData();
      setData(result);
    }

    fetchStreak();
  }, []);

  const { currentStreak, longestStreak, workoutsThisWeek, weeklyFrequency } = data;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Progress Card */}
      <div className="bg-[var(--card-background)] rounded-xl p-4 shadow-md border border-gray-800">
        <p className="text-xs text-gray-400">This Week's Progress</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-medium text-white">
            {workoutsThisWeek}/{weeklyFrequency}
          </span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full mt-2">
          <div
            className="h-1.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((workoutsThisWeek / weeklyFrequency) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Longest Streak */}
        <div className="bg-[var(--card-background)] rounded-xl p-4 shadow-md border border-[var(--card-border)]  text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xs text-gray-400">Longest Streak</p>
          <p className="text-lg font-bold text-white">
            {(longestStreak > 0 ? longestStreak : currentStreak) || 0} days
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-[var(--card-background)] rounded-xl p-4 shadow-md border border-[var(--card-border)]  text-center">
          <div className="flex justify-center mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-xs text-gray-400">Current Streak</p>
          <p className="text-lg font-bold text-white">{currentStreak} days</p>
        </div>
      </div>
    </div>
  );
}