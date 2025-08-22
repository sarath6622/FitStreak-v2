"use client";

import React, { forwardRef } from "react";

const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <header
        ref={ref}
        {...props}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 border-b bg-black border-gray-700 shadow-md text-white ${className}`}
      >
        <h1 className="text-lg font-semibold">FitStreak</h1>
        <div className="flex gap-4 items-center">{/* Icons/buttons */}</div>
      </header>
    );
  }
);

Header.displayName = "Header";
export default Header;