"use client";

import React from "react";

export default function Header() {
  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        flex justify-between items-center
        px-4 py-3
        bg-black border-b border-gray-700 shadow-md text-white
        pt-[calc(0.75rem+env(safe-area-inset-top))]  /* 👈 accounts for notch */
      "
    >
      <h1 className="text-lg font-semibold">FitStreak</h1>
      <div className="flex gap-4 items-center">
        {/* Additional header content (buttons, icons, etc.) */}
      </div>
    </header>
  );
}