"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function FooterActions({
  disabled,
  onClose,
  onAdd,
}: {
  disabled: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  const handleAdd = () => {
    setConfirmed(true);
    setTimeout(() => {
      onAdd();
      setConfirmed(false); // reset after parent closes modal
    }, 1200); // tick animation duration
  };

  return (
    <div className="relative px-4 py-4">
      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center gap-3 transition-all duration-300 ${
              disabled ? "blur-sm opacity-60" : "blur-0 opacity-100"
            }`}
          >
            <button
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              disabled={disabled}
              onClick={handleAdd}
              className={`h-11 flex-1 rounded-xl transition ${
                disabled
                  ? "bg-emerald-800/40 text-emerald-200/60 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-600 text-white"
              }`}
            >
              Add
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
              >
                <Check className="h-6 w-6 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}