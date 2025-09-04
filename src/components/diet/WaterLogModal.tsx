"use client";
import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion } from "framer-motion";

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
  const max = 250; // ml
  const trackHeight = 200; // px

  const [value, setValue] = useState(0);

  // Convert ml → y (for knob position)
  const valueToY = (val: number) => (1 - val / max) * trackHeight;

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
            onClick={(e) => {
              // Clicking track sets new value
              const rect = e.currentTarget.getBoundingClientRect();
              const clickY = e.clientY - rect.top;
              const newVal = Math.round(
                (1 - clickY / trackHeight) * max
              );
              setValue(Math.max(0, Math.min(max, newVal)));
            }}
          >
            {/* Fill */}
            <div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
              style={{ height: `${(value / max) * 100}%` }}
            />

            {/* Knob */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: trackHeight }}
              dragElastic={0}
              dragMomentum={false}
              style={{ y: valueToY(value) }}
              onDrag={(e, info) => {
                const newVal = Math.round(
                  (1 - info.point.y / trackHeight) * max
                );
                setValue(Math.max(0, Math.min(max, newVal)));
              }}
              className="w-10 h-10 rounded-full bg-white shadow-md cursor-grab active:cursor-grabbing absolute left-1/2 -translate-x-1/2"
            />
          </div>

          {/* Label */}
          <p className="mt-6 text-3xl font-bold">{value} ml</p>
          <p className="text-sm text-gray-400">Slide to adjust</p>
        </div>

        {/* Confirm */}
        <button
          onClick={() => {
            if (value > 0) {
              onLog(value);
              setValue(0);
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