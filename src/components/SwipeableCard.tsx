"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SwipeableCard({ children, onEdit, onDelete }: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const actionWidth = 80; // slightly wider for breathing room

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX.current;

      // Only prevent default if user actually swiped (moved more than 10px)
      if (Math.abs(deltaX) > 10) {
        e.preventDefault();
      }

      // Allow left swipe to reveal actions
      if (deltaX < 0 || (translateX < 0 && deltaX > 0)) {
        setTranslateX(Math.min(0, Math.max(deltaX, -actionWidth)));
      }
    };

    // Add listener with { passive: false } to allow preventDefault
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, translateX, actionWidth]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const didSwipe = Math.abs(translateX) > 10;
    setIsDragging(false);

    if (translateX < -actionWidth / 2) {
      setTranslateX(-actionWidth); // keep open
    } else {
      setTranslateX(0); // snap back
    }

    // Reset dragging state after a brief delay to allow click to fire
    if (!didSwipe) {
      setTimeout(() => setIsDragging(false), 50);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Action buttons (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-3 pr-3 w-[70px]">
        <button
          onClick={onEdit}
          className={clsx(
            "flex items-center justify-center w-11 h-11 rounded-xl shadow-md transition active:scale-95",
            "bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
          )}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          className={clsx(
            "flex items-center justify-center w-11 h-11 rounded-xl shadow-md transition active:scale-95",
            "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white"
          )}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Foreground content (swipeable) */}
      <div
        ref={containerRef}
        className={clsx(
          "relative transition-transform duration-300",
          "bg-gray-900 border border-gray-800 rounded-2xl shadow-lg",
          "active:scale-[0.98]"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}