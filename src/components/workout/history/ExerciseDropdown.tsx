"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface Props {
  value: string | null;
  options: string[];
  onSelect: (val: string) => void;
  placeholder?: string;
}

export default function ExerciseDropdown({
  value,
  options,
  onSelect,
  placeholder = "Search exercise...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // filter options (max 5 results)
  const filtered = options
    .filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="relative w-full sm:w-72" ref={ref}>
      {/* Search Input */}
      <div
        className="flex items-center bg-[var(--card-background)] border border-[var(--card-border)]
                   rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
      >
        <Search className="w-4 h-4 text-[var(--text-muted)] mr-2" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent focus:outline-none placeholder-[var(--text-muted)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute mt-2 w-full bg-gray-900 border border-[var(--card-border)]
                     rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {filtered.length > 0 ? (
            <div className="divide-y divide-white/10  ">
              {filtered.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onSelect(opt);
                    setQuery(opt);
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-sm text-[var(--text-primary)] cursor-pointer hover:bg-[var(--surface-hover)]"
                >
                  {opt}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-[var(--text-muted)]">
              No exercise found
            </div>
          )}
        </div>
      )}
    </div>
  );
}