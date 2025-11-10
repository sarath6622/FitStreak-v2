"use client";
import { Plus, Utensils } from "lucide-react";

interface MealCardProps {
  name: string;
  calories: number;
  recommended: number;
  onClick: () => void;
}

export default function MealCard({ name, calories, recommended, onClick }: MealCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-navy-800/60 backdrop-blur-md rounded-xl p-4 
                 border border-navy-600 
                 text-gray-100 flex flex-col justify-between items-center h-32 
                 hover:border-cyan-400/60 hover:shadow-[0_0_8px_rgba(34,211,238,0.15)] 
                 transition"
    >
      {calories > 0 ? (
        <>
          <Utensils size={24} className="text-blue-400" />
          <div className="text-center">
            <p className="font-semibold text-gray-100">{name}</p>
            <p className="text-xs text-gray-400">{calories} kcal</p>
            <p className="text-[11px] text-gray-500">Recommended: {recommended} kcal</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-gray-500 hover:text-cyan-400 transition">
          <Plus size={20} />
          <span className="mt-1 text-xs">{name}</span>
        </div>
      )}
    </div>
  );
}