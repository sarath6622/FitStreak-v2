"use client";

import { motion, useAnimation, Variants } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = ["Warming up…", "Adding plates…", "One more rep…"];

// Dumbbell bounce animation
const dumbbellVariants: Variants = {
  float: {
    y: [0, -8, 0],
    rotate: [0, -2, 2, 0],
    transition: {
      repeat: Infinity,
      duration: 1.3,
      ease: "easeInOut",
    },
  },
};

// Bar grow animation
const barVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

// Plates slide-in animation
const plateVariants: Variants = {
  hidden: (direction: "left" | "right") => ({
    x: direction === "left" ? "-100%" : "100%",
    opacity: 0,
  }),
  visible: {
    x: "0%",
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function DumbbellLoader() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const leftPlatesControls = useAnimation();
  const rightPlatesControls = useAnimation();
  const barControls = useAnimation();

  // cycle through phrases
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhraseIndex(
        (prevIndex) => (prevIndex + 1) % phrases.length
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // run animation sequence
  useEffect(() => {
    const sequence = async () => {
      await barControls.start("animate");
      await Promise.all([
        leftPlatesControls.start("visible"),
        rightPlatesControls.start("visible"),
      ]);
    };
    sequence();
  }, [barControls, leftPlatesControls, rightPlatesControls]);

  return (
    <div className="min-h-[100svh] absolute top-0 flex items-center justify-center bg-[var(--card-background)] text-gray-300 w-full">
      {/* Group dumbbell + text together */}
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Dumbbell */}
        <motion.div
          className="relative w-full max-w-sm h-28"
          animate="float"
          variants={dumbbellVariants}
        >
          <div className="flex items-center justify-center w-full h-full">
            {/* Left Plates */}
            <motion.div
              className="flex space-x-1"
              variants={plateVariants}
              initial="hidden"
              custom="left"
              animate={leftPlatesControls}
            >
              <div className="w-4 h-10 bg-white rounded-md shadow-lg"></div>
              <div className="w-5 h-10 bg-white rounded-md shadow-lg"></div>
            </motion.div>

            {/* Bar */}
            <motion.div
              className="w-20 h-2 bg-white rounded-md shadow-lg"
              variants={barVariants}
              initial="initial"
              animate={barControls}
            ></motion.div>

            {/* Right Plates */}
            <motion.div
              className="flex space-x-1"
              variants={plateVariants}
              initial="hidden"
              custom="right"
              animate={rightPlatesControls}
            >
              <div className="w-5 h-10 bg-white rounded-md shadow-lg"></div>
              <div className="w-4 h-10 bg-white rounded-md shadow-lg"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Cycling motivational text */}
        <div className="text-base font-semibold text-[var(--accent-orange)] tracking-widest relative w-52 text-center overflow-hidden">
          <motion.div
            key={currentPhraseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {phrases[currentPhraseIndex]}
          </motion.div>
        </div>
      </div>
    </div>
  );
}