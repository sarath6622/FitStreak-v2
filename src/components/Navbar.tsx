"use client";

import React, { useEffect, useState, forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, History, User } from "lucide-react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} strokeWidth={1.5} /> },
  { href: "/workouts", label: "Workouts", icon: <Dumbbell size={20} strokeWidth={1.5} /> },
  { href: "/workouts/history", label: "History", icon: <History size={20} strokeWidth={1.5} /> },
];

const Navbar = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname();
    const [user, setUser] = useState<FirebaseUser | null>(null);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    return (
      <>
        {/* Desktop top bar (not measured) */}
        <nav
          aria-label="Top navigation"
          className="hidden sm:flex fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-lg border-b border-gray-700 shadow px-6 py-4 items-center justify-between pt-[env(safe-area-inset-top)]"
        >
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            FitStreak
          </h1>

          <ul className="flex gap-6 items-center">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "relative text-sm font-medium transition",
                    pathname === href ? "text-blue-400" : "text-gray-400 hover:text-blue-300"
                  )}
                >
                  {label}
                  {pathname === href && (
                    <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
                  )}
                </Link>
              </li>
            ))}
            <li>
              <Link href={user ? "/profile" : "/login"} className="flex items-center gap-2">
                {user ? (
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-gray-500 hover:scale-105 transition"
                  />
                ) : (
                  <>
                    <User size={20} strokeWidth={1.5} />
                    <span className="text-sm text-gray-400 hover:text-blue-300">Login</span>
                  </>
                )}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile bottom bar (this is what we MEASURE) */}
        <nav
          aria-label="Bottom navigation"
          ref={ref}                       // <-- forwardRef lands here
          {...props}
          className={clsx(
            "sm:hidden fixed bottom-0 left-0 right-0 z-50",
            className
          )}
        >
          <div className="mx-3 pb-2rounded-2xl bg-black/80 backdrop-blur-lg shadow-xl p-2">
            <ul className="flex justify-around items-center">
              {navItems.map(({ href, label, icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      "flex flex-col items-center text-xs px-4 py-2 rounded-xl transition active:scale-90",
                      pathname === href
                        ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 shadow-inner"
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    {icon}
                    <span
                      className={clsx(
                        "transition-all duration-200 overflow-hidden",
                        pathname === href ? "opacity-100 max-h-4 mt-1" : "opacity-0 max-h-0 mt-0"
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              ))}

              <li>
                <Link
                  href={user ? "/profile" : "/login"}
                  className={clsx(
                    "flex flex-col items-center text-xs px-4 py-2 rounded-xl transition active:scale-90",
                    pathname === (user ? "/profile" : "/login")
                      ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 shadow-inner"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  {user ? (
                    <img
                      src={user.photoURL || "/default-avatar.png"}
                      alt="Profile"
                      className="w-6 h-6 rounded-full border border-gray-500"
                    />
                  ) : (
                    <User size={20} strokeWidth={1.5} />
                  )}
                  <span
                    className={clsx(
                      "transition-all duration-200 overflow-hidden",
                      pathname === (user ? "/profile" : "/login")
                        ? "opacity-100 max-h-4 mt-1"
                        : "opacity-0 max-h-0 mt-0"
                    )}
                  >
                    {user ? "Profile" : "Login"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </>
    );
  }
);

Navbar.displayName = "Navbar";
export default Navbar;