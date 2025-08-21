"use client";
import React from "react"; 
import { useState } from "react";
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

  // Workout dates (ISO strings -> Date)
  const workoutDates = workouts.map((w) => parseISO(w.date));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

const rows: React.ReactNode[] = [];
let days: React.ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;

      const hasWorkout = workoutDates.some((d) => isSameDay(d, cloneDay));

      days.push(
        <div
          key={day.toString()}
          className={`flex items-center justify-center text-sm rounded-full w-9 h-9
            ${!isSameMonth(day, monthStart) ? "text-gray-600" : ""}
            ${isSameDay(day, new Date()) ? "border border-white text-white" : ""}
            ${hasWorkout ? "bg-green-600 text-white" : ""}
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
    <div className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
        <div className="text-center">M</div>
        <div className="text-center">T</div>
        <div className="text-center">W</div>
        <div className="text-center">T</div>
        <div className="text-center">F</div>
        <div className="text-center">S</div>
        <div className="text-center">S</div>
      </div>

      {/* Days */}
      {rows}
    </div>
  );
}