"use client";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";

interface WaterLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (amount: number) => void;
}

export default function WaterLogModal({
  isOpen,
  onClose,
  onLog,
}: WaterLogModalProps) {
  const max = 250;          // ml
  const step = 25;          // snap step
  const trackHeight = 200;  // px

  // Motion value for knob Y (0 = top, 200 = bottom)
  const y = useMotionValue(trackHeight);
  const [value, setValue] = useState(0);

  // Map y -> ml, clamp, and keep in sync as the user drags
  useEffect(() => {
    const unsub = y.on("change", (latest) => {
      const clamped = Math.max(0, Math.min(trackHeight, latest));
      if (clamped !== latest) y.set(clamped);
      const raw = (1 - clamped / trackHeight) * max;
      setValue(Math.round(raw));
    });
    return () => unsub();
  }, [y]);

  // Helper: ml -> y px
  const valueToY = (val: number) => (1 - val / max) * trackHeight;

  // Snap to nearest step with spring
  const snapToStep = (v: number) => Math.round(v / step) * step;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0d0f1a] rounded-2xl p-6 w-80 border border-gray-800 text-white relative flex flex-col items-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-6">Log Water</h2>

        {/* Vertical slider */}
        <div className="flex flex-col items-center">
          <div
            className="relative w-16 h-[200px] rounded-full bg-gray-800 overflow-hidden flex items-end cursor-pointer"
            style={{ touchAction: "none" }} // ensure touch dragging works
            onPointerDown={(e) => {
              // Tap track to jump the handle
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const clickY = Math.max(0, Math.min(trackHeight, e.clientY - rect.top));
              const raw = (1 - clickY / trackHeight) * max;
              const snappedVal = snapToStep(raw);
              const targetY = valueToY(snappedVal);
              animate(y, targetY, { type: "spring", stiffness: 400, damping: 30 });
            }}
          >
            {/* Fill */}
            <div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
              style={{ height: `${(value / max) * 100}%` }}
            />

            {/* Draggable knob (attached to fill) */}
            <motion.div
              drag="y"
              dragElastic={0}
              dragMomentum={false}
              // We clamp via y.on("change"), so no constraints needed
              style={{ y, top: 0, left: "50%", translateX: "-50%" }}
              onDragEnd={() => {
                const snappedVal = snapToStep(value);
                const targetY = valueToY(snappedVal);
                animate(y, targetY, { type: "spring", stiffness: 400, damping: 30 });
              }}
              className="w-10 h-10 rounded-full bg-white shadow-md cursor-grab active:cursor-grabbing absolute"
            />
          </div>

          {/* Label */}
          <p className="mt-6 text-3xl font-bold">{value} ml</p>
          <p className="text-sm text-gray-400">Drag or tap to adjust</p>
        </div>

        {/* Confirm */}
        <button
          onClick={() => {
            if (value > 0) {
              onLog(value);
              animate(y, trackHeight, { type: "spring", stiffness: 400, damping: 30 }); // reset
              onClose();
            }
          }}
          className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          Log {value} ml
        </button>
      </div>
    </div>
  );
}