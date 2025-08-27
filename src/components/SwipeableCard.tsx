"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SwipeableCard({ children, onEdit, onDelete }: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const actionWidth = 70; // much tighter space since stacked buttons

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX.current;

    // Allow left swipe to open, right swipe to close
    if (deltaX < 0 || (translateX < 0 && deltaX > 0)) {
      setTranslateX(Math.min(0, Math.max(deltaX, -actionWidth)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX < -actionWidth / 2) {
      setTranslateX(-actionWidth); // keep open
    } else {
      setTranslateX(0); // snap back
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Action buttons stacked on the right */}
      <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 pr-1 w-[60px]">
        <button
          onClick={onEdit}
          className="bg-blue-600 text-white p-2 rounded-md text-[10px] flex items-center justify-center w-10 h-10"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600 text-white p-2 rounded-md text-[10px] flex items-center justify-center w-10 h-10"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Foreground content (swipeable) */}
      <div
        className="relative bg-gray-800 border border-gray-700 rounded-xl p-0 transition-transform duration-300"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}