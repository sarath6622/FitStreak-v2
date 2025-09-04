"use client";
import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";

interface WaterLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLog: (amount: number) => void;
}

export default function WaterLogModal({ isOpen, onClose, onLog }: WaterLogModalProps) {
    const max = 2000;          // slider range: 0 → 2L
    const step = 50;           // snap step (use 25 for sip mode)
    const trackHeight = 220;   // px

    const [value, setValue] = useState(250); // default selection
    const [isConfirming, setIsConfirming] = useState(false);
    const y = useMotionValue(valueToY(250)); // drive knob with MotionValue

    function valueToY(val: number) {
        return (1 - val / max) * trackHeight; // 0 at top, trackHeight at bottom
    }

    function clamp(n: number, min: number, max: number) {
        return Math.max(min, Math.min(max, n));
    }

    function formatLabel(val: number) {
        return val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)} L` : `${val} ml`;
    }

    // Keep ml value in sync with knob Y and clamp within the track
    useEffect(() => {
        const unsub = y.on("change", (latest) => {
            const c = clamp(latest, 0, trackHeight);
            if (c !== latest) y.set(c);
            const raw = (1 - c / trackHeight) * max;
            setValue(Math.round(raw));
        });
        return () => unsub();
    }, [y]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-[#0d0f1a] rounded-2xl p-6 w-80 border border-gray-800 text-white relative flex flex-col items-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* Close */}
                        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-lg font-semibold mb-6">Log Water</h2>

                        {/* Vertical slider */}
                        <div className="flex flex-col items-center">
                            <div
                                className="relative w-16 h-[220px] rounded-full bg-gray-800 overflow-hidden flex items-end cursor-pointer"
                                style={{ touchAction: "none" }}
                                onPointerDown={(e) => {
                                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                    const clickY = clamp(e.clientY - rect.top, 0, trackHeight);
                                    const raw = (1 - clickY / trackHeight) * max;
                                    const snapped = Math.round(raw / step) * step;
                                    setValue(snapped);
                                    animate(y, valueToY(snapped), { type: "spring", stiffness: 400, damping: 30 });
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
                                    dragElastic={0}
                                    dragMomentum={false}
                                    style={{ y, top: 0, left: "50%", translateX: "-50%" }}
                                    onDragEnd={() => {
                                        const snapped = Math.round(value / step) * step;
                                        setValue(snapped);
                                        animate(y, valueToY(snapped), { type: "spring", stiffness: 400, damping: 30 });
                                    }}
                                    className="w-10 h-10 rounded-full bg-white shadow-md cursor-grab active:cursor-grabbing absolute"
                                />
                            </div>

                            {/* Label */}
                            <p className="mt-6 text-3xl font-bold">{formatLabel(value)}</p>
                            <p className="text-sm text-gray-400">Drag or tap to adjust</p>
                        </div>

                        {/* Quick-add (just updates slider) */}
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {[250, 500, 1000, 2000].map((amt) => {
                                const isActive = value === amt; // highlight if selected
                                return (
                                    <button
                                        key={amt}
                                        onClick={() => {
                                            setValue(amt);
                                            animate(y, valueToY(amt), {
                                                type: "tween",
                                                ease: "easeInOut",
                                                duration: 0.5
                                            });
                                        }}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition
          ${isActive
                                                ? "bg-yellow-400 border-gray-700 text-black hover:opacity-90"
                                                : "bg-white/10 border-gray-700 text-white hover:opacity-90"}`}
                                    >
                                        {amt >= 1000 ? `${amt / 1000}L` : `${amt}ml`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Confirm */}
                        {/* Confirm */}
                        {/* Confirm */}
                        <motion.button
                            onClick={() => {
                                if (value > 0) {
                                    setIsConfirming(true);

                                    // Delay actual log until after animation
                                    setTimeout(() => {
                                        onLog(value);
                                        animate(y, valueToY(250), {
                                            type: "tween",
                                            ease: "easeInOut",
                                            duration: 0.5,
                                        });
                                        setValue(250);
                                        setIsConfirming(false);
                                        onClose();
                                    }, 1200);
                                }
                            }}
                            className="mt-6 flex items-center justify-center bg-blue-500 text-white 
             rounded-full shadow-md"
                            animate={{
                                width: isConfirming ? 50 : 200,
                                height: 50,
                                borderRadius: isConfirming ? "50%" : "9999px",
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            {!isConfirming ? (
                                <span className="font-medium">Log {formatLabel(value)}</span>
                            ) : (
                                <motion.svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-6 h-6"
                                >
                                    <motion.path
                                        d="M5 13l4 4L19 7"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }}
                                    />
                                </motion.svg>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}