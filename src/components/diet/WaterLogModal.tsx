"use client";
import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion } from "framer-motion";

interface WaterLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLog: (amount: number) => void;
}

export default function WaterLogModal({ isOpen, onClose, onLog }: WaterLogModalProps) {
    const [dragY, setDragY] = useState(0);
    const max = 250; // max ml
    const trackHeight = 200; // px height for draggable area

    // Convert drag distance into ml (clamp between 0–max)
    const value = Math.min(Math.max(Math.round((1 - dragY / trackHeight) * max), 0), max);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0d0f1a] rounded-2xl p-6 w-80 border border-gray-800 text-white relative flex flex-col items-center">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold mb-6">Log Water</h2>

                {/* iOS-style draggable slider */}
                <div className="flex flex-col items-center justify-center">
                    <div
                        className="relative w-16 h-[200px] rounded-full bg-gray-800 overflow-hidden flex items-end"
                        style={{ touchAction: "none" }}
                    >
                        {/* Filled water level */}
                        <div
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
                            style={{ height: `${(value / max) * 100}%` }}
                        />

                        {/* Draggable knob */}
                        <motion.div
                            drag="y"
                            dragConstraints={{ top: -trackHeight, bottom: 0 }}
                            dragElastic={0}
                            style={{ y: dragY }} // let motion control position
                            onDrag={(e, info) => {
                                const newY = Math.min(Math.max(info.offset.y, 0), trackHeight);
                                setDragY(newY);
                            }}
                            onDragEnd={() => {
                                const step = 50; // snap step
                                const rawValue = Math.round((1 - dragY / trackHeight) * max);
                                const snappedValue = Math.round(rawValue / step) * step;

                                // convert snapped value back into Y position
                                const snappedY = (1 - snappedValue / max) * trackHeight;

                                // animate knob smoothly
                                setDragY(snappedY);
                            }}
                            animate={{ y: dragY }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="w-14 h-14 rounded-full bg-white/90 shadow-lg cursor-grab active:cursor-grabbing relative z-10 mb-[-20px]"
                        />
                    </div>

                    {/* Value label */}
                    <p className="mt-6 text-3xl font-bold">{value} ml</p>
                    <p className="text-sm text-gray-400">Drag up to adjust</p>
                </div>

                {/* Confirm button */}
                <button
                    onClick={() => {
                        if (value > 0) {
                            onLog(value);
                            setDragY(0);
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