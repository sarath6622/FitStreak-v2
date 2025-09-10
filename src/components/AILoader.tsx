"use client";

import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AILoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/50">
      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-[var(--surface-dark)] to-[var(--surface-light)]
                   border border-[var(--card-border)] rounded-2xl shadow-2xl 
                   p-8 flex flex-col items-center gap-5 max-w-sm w-full mx-4 overflow-hidden"
      >
        {/* Magic Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[var(--accent-blue)]/30 to-[var(--accent-green)]/30 blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {/* Sparkling Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="relative flex items-center justify-center"
        >
          <Sparkles className="absolute w-12 h-12 text-[var(--accent-green)] opacity-60 animate-pulse" />
          <Loader2 className="w-10 h-10 text-[var(--accent-blue)] animate-spin" />
        </motion.div>

        {/* Magic Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white font-semibold text-center leading-snug"
        >
          Summoning your <span className="text-[var(--accent-blue)]">AI-powered</span> workout…
        </motion.p>

        {/* Subtle Bottom Glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
                     from-[var(--accent-blue)] via-[var(--accent-green)] to-[var(--accent-blue)]"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}