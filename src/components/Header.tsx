// Corrected Header.tsx
import React, { forwardRef } from "react";

const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => (
    <header
      ref={ref}
      {...props}
      // Apply all styles directly to the header element.
      // The `h-14` is the base height, and `safe-area-inset-top` is the padding.
      className={`fixed top-0 inset-x-0 z-[70] 
                  bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg
                  h-[calc(3.5rem+env(safe-area-inset-top))]
                  pt-[env(safe-area-inset-top)] px-4
                  flex items-center justify-between
                  ${className}`}
    >
      <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
        FitStreak
      </h1>
      <div className="flex items-center gap-3">{/* actions */}</div>
    </header>
  )
);

Header.displayName = "Header";
export default Header;