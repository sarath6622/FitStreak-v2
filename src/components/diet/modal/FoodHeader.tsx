"use client";

import { useState } from "react";
import { FoodItem } from "@/components/diet/MealModal";
import { Search, X } from "lucide-react";

export default function FoodSearch({
  foods,
  selectedFood,
  setSelectedFood,
}: {
  foods: FoodItem[];
  selectedFood: FoodItem | null;
  setSelectedFood: (f: FoodItem | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = foods.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative px-4 pb-2">
      <div
        className="relative h-12 w-full rounded-xl border border-white/20 bg-white/10 flex items-center px-3 text-white cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 opacity-70 mr-2" />
        <span className="text-gray-300">
          {selectedFood ? selectedFood.name : "Search food..."}
        </span>
      </div>

      {open && (
        <div className="absolute top-14 left-4 right-4 bg-gray-900 rounded-xl shadow-lg border border-white/20 z-10 p-4">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
            <Search className="h-5 w-5 opacity-70 mr-2" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)} // delay closing
              placeholder="Search food..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="h-5 w-5 opacity-70" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="mt-4 max-h-[300px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-center mt-6">No food found.</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((f) => (
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
          <div className="mt-2 text-center text-blue-400 cursor-pointer">
            Can’t find your food?
          </div>
        </div>
      )}
    </div>
  );
}