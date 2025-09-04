"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import WaterLogModal from "./WaterLogModal";

interface Props {
  intake: number; // ml consumed
  goal: number;   // total ml goal
  stepMl?: number; // default glass size
  onAdd?: (amount: number) => void;
  className?: string;
}

export default function WaterGlassesCard({
  intake,
  goal,
  stepMl,
  onAdd,
  className = "",
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const glassSize = stepMl ?? 250;
  const totalGlasses = Math.ceil(goal / glassSize);

  return (
    <>
      <div
        className={`bg-[#0d0f1a]/60 backdrop-blur-md rounded-2xl p-4 border border-gray-800 text-white w-full flex flex-col gap-3 ${className}`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm">Water</p>
          <p className="text-xs text-gray-400">
            {intake}/{goal} ml
          </p>
        </div>

        {/* Glasses row with responsive cups + button */}
        <div className="flex items-end gap-2 w-full">
          {Array.from({ length: totalGlasses }).map((_, i) => {
            const start = i * glassSize;
            const filled = Math.min(Math.max(intake - start, 0), glassSize);
            const fillPct = filled / glassSize;

            return (
              <div
                key={i}
                className="flex-1 h-12 relative flex items-end justify-center"
              >
                {/* Glass outline */}
                <div className="w-full h-full rounded-lg border-2 border-gray-700 bg-[#0b1220] overflow-hidden relative">
                  {/* Fill inside */}
                  <div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                    style={{ height: `${fillPct * 100}%` }}
                  />
                  {/* Glass shine */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}

          {/* ➕ button that opens modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Log water intake"
            className="flex-1 h-12 rounded-full border-2 border-transparent 
                       bg-gradient-to-r from-blue-500 to-purple-500 
                       flex items-center justify-center text-white 
                       shadow-lg shadow-blue-500/40 hover:scale-105 
                       transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <WaterLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLog={(amount) => {
          onAdd?.(amount);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}