// Header.tsx
"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    // ✅ listen for Firebase auth state
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });
      return () => unsub();
    }, []);

    const initials = user?.displayName
      ? user.displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

    return (
      <header
        ref={ref}
        {...props}
        className={`fixed top-0 inset-x-0 z-[70] 
                    bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg
                    h-[calc(3.5rem+env(safe-area-inset-top))]
                    pt-[env(safe-area-inset-top)] px-4
                    flex items-center justify-between
                    ${className}`}
      >
        {/* Brand */}
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          FitStreak
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => router.push("/profile")}
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden 
                         bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-medium shadow-md"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </button>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
export default Header;