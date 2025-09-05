"use client";
import React, { useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WorkoutSession } from "@/types";

interface WorkoutCalendarProps {
  workouts: WorkoutSession[];
}

export default function WorkoutCalendar({ workouts }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const workoutDates = workouts.map((w) => parseISO(w.date));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: React.ReactNode[] = [];
  let days: React.ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const hasWorkout = workoutDates.some((d) => isSameDay(d, cloneDay));
      const isToday = isSameDay(cloneDay, new Date());

      days.push(
        <div
          key={day.toString()}
          className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition text-sm
            ${!isSameMonth(day, monthStart) ? "text-gray-600" : "text-gray-200"}
            ${isToday ? "border border-purple-500" : ""}
            ${hasWorkout ? "bg-green-500 text-white hover:bg-green-600" : "hover:bg-gray-800"}
          `}
        >
          {format(day, "d")}
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-[var(--card-background)] text-white p-3 rounded-2xl shadow-lg border border-[var(--card-border)] w-full max-w-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-800 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold tracking-wide">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-800 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-[11px] font-medium text-gray-400 mb-1">
        <div className="text-center">M</div>
        <div className="text-center">T</div>
        <div className="text-center">W</div>
        <div className="text-center">T</div>
        <div className="text-center">F</div>
        <div className="text-center">S</div>
        <div className="text-center">S</div>
      </div>

      {/* Days */}
      <div className="space-y-1">{rows}</div>

      {/* Legend */}
      <div className="flex justify-center gap-2 text-[11px] text-gray-400 mt-2">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
          Workout
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 border border-purple-500 rounded-full"></span>
          Today
        </div>
      </div>
    </div>
  );
}