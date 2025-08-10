"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, History, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} /> },
  { href: "/workouts", label: "Workouts", icon: <Dumbbell size={20} /> },
  { href: "/workouts/history", label: "History", icon: <History size={20} /> },
  { href: "/profile", label: "Profile", icon: <User size={20} /> },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden sm:flex fixed top-0 left-0 right-0 bg-black border-b border-gray-700 shadow z-50 px-6 py-4 justify-between items-center">
        <h1 className="text-xl font-bold text-white">FitTrack</h1>
        <ul className="flex gap-6">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm font-medium transition ${
                  pathname === href ? "text-blue-500" : "text-gray-400 hover:text-blue-400"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Navbar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 shadow z-50">
        <ul className="flex justify-around items-center py-3">
          {navItems.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center text-xs transition ${
                  pathname === href ? "text-blue-500" : "text-gray-400 hover:text-blue-400"
                }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}