"use client";

import React, { forwardRef } from "react";

const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <header
        ref={ref}
        {...props}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 border-b bg-black border-gray-700 shadow-md text-white`}
        style={{
          paddingTop: "env(safe-area-inset-top)", // push content inside safe area
          height: `calc(56px + env(safe-area-inset-top))`, // header height + notch
        }}
      >
        <h1 className="text-lg font-semibold">FitStreak</h1>
        <div className="flex gap-4 items-center">
          {/* Additional header content */}
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
export default Header;