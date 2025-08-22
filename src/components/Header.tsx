"use client";

import React, { forwardRef } from "react";

const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => (
    <header
      ref={ref}
      {...props}
      className={`fixed top-0 inset-x-0 z-[70] 
                  bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg
                  pt-[env(safe-area-inset-top)] ${className}`}
    >
      {/* Base row height (notch padding is above this) */}
      <div className="h-14 px-4 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          FitStreak
        </h1>
        <div className="flex items-center gap-3">{/* actions */}</div>
      </div>
    </header>
  )
);

Header.displayName = "Header";
export default Header;