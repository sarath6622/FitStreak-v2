"use client";

import { FoodItem } from "@/features/diet/components/MealModal";
import { Search, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface FoodSearchProps {
  selectedFood: FoodItem | null;
  setSelectedFood: (f: FoodItem | null) => void;
  results: FoodItem[];
  query: string;
  setQuery: (q: string) => void;
  loading: boolean;
  recents: FoodItem[];
  onFallbackSearch: (q: string) => void;
  disabled?: boolean; // 🔹 NEW
}

export default function FoodSearch({
  selectedFood,
  setSelectedFood,
  results,
  query,
  setQuery,
  loading,
  recents,
  onFallbackSearch,
  disabled = false, // default false
}: FoodSearchProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative px-4 pb-2" ref={dropdownRef}>
      {/* 🔍 Search input */}
      <div
        className={`relative h-12 w-full rounded-xl border flex items-center px-3 text-white ${
          disabled
            ? "border-gray-600 bg-gray-800 opacity-60 cursor-not-allowed"
            : "border-white/20 bg-white/10"
        }`}
      >
        <Search className="h-4 w-4 opacity-70 mr-2" />
        <input
          autoFocus
          value={query || selectedFood?.name || ""}
          ref={inputRef}
          disabled={disabled} // 🔹 block typing
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedFood) setSelectedFood(null);
          }}
          placeholder={disabled ? "Select a meal type first..." : "Search food..."}
          className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400 disabled:cursor-not-allowed"
          onFocus={() => !disabled && setOpen(true)} // 🔹 block dropdown
        />

        {(query || selectedFood) && !disabled && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedFood(null);
              setOpen(true);
            }}
          >
            <X className="h-5 w-5 opacity-70" />
          </button>
        )}
      </div>

      {/* ✅ Dropdown only if not disabled */}
      <AnimatePresence>
        {!disabled && open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-14 left-4 right-4 bg-gray-900 rounded-xl shadow-lg border border-white/20 z-10 p-4"
          >
            {/* Recents */}
            {recents.length > 0 && !query && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 px-1">
                  Recently used
                </p>
                <div className="flex flex-wrap gap-2">
                  {recents.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFood(f);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-white
                       bg-gray-800 hover:bg-gray-700 border border-gray-700/50
                       transition-colors"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="mt-2 max-h-[300px] overflow-y-auto">
              {loading ? (
                <p className="text-gray-400 text-center mt-6">Searching...</p>
              ) : results.length === 0 && query ? (
                <p className="text-gray-400 text-center mt-6">No food found.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((f) => (
                    <li
                      key={f.id}
                      className="px-3 py-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
                      onClick={() => {
                        setSelectedFood(f);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bottom action */}
            {query && (
              <div
                className="mt-3 text-center text-blue-400 cursor-pointer hover:underline"
                onClick={() => onFallbackSearch(query)}
              >
                Can’t find your food? Search globally
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}