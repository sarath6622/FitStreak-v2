"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, History, User } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} strokeWidth={1.5} /> },
  { href: "/workouts", label: "Workouts", icon: <Dumbbell size={20} strokeWidth={1.5} /> },
  { href: "/workouts/history", label: "History", icon: <History size={20} strokeWidth={1.5} /> },
  { href: "/profile", label: "Profile", icon: <User size={20} strokeWidth={1.5} /> },
];

const Navbar = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
      <>
        {/* Desktop top bar */}
        <nav
          aria-label="Top navigation"
          className="hidden sm:flex fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-lg border-b border-gray-700 shadow px-6 py-4 items-center justify-between"
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
                    pathname === href
                      ? "text-blue-400"
                      : "text-gray-400 hover:text-blue-300"
                  )}
                >
                  {label}
                  {pathname === href && (
                    <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile bottom bar */}
        <nav
          aria-label="Bottom navigation"
          ref={ref}
          {...props}
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="mx-3 rounded-2xl bg-black/80 backdrop-blur-lg shadow-xl p-2">
            <ul className="flex justify-around items-center">
              {navItems.map(({ href, label, icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={clsx(
                        "flex items-center p-4 rounded-xl transition active:scale-90",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 shadow-inner"
                          : "text-gray-400 hover:text-gray-200"
                      )}
                    >
                      {icon}
                      <span
                        className={clsx(
                          "ml-2 text-sm transition-all duration-300 overflow-hidden",
                          isActive
                            ? "opacity-100 max-w-[100px]"
                            : "opacity-0 max-w-0"
                        )}
                      >
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </>
    );
  }
);

Navbar.displayName = "Navbar";
export default Navbar;