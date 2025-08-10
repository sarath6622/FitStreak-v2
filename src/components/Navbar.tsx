"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, History, User } from "lucide-react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} /> },
  { href: "/workouts", label: "Workouts", icon: <Dumbbell size={20} /> },
  { href: "/workouts/history", label: "History", icon: <History size={20} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden sm:flex fixed top-0 left-0 right-0 bg-black border-b border-gray-700 shadow z-50 px-6 py-4 justify-between items-center">
        <h1 className="text-xl font-bold text-white">FitTrack</h1>
        <ul className="flex gap-6 items-center">
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

          {user ? (
            <li>
              <Link href="/profile" className="flex items-center gap-2">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-500"
                />
              </Link>
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                className={`flex items-center gap-1 ${
                  pathname === "/login"
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-blue-400"
                }`}
              >
                <User size={20} />
                Login
              </Link>
            </li>
          )}
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

          {user ? (
            <li>
              <Link
                href="/profile"
                className="flex flex-col items-center text-xs text-gray-400 hover:text-blue-400"
              >
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-gray-500"
                />
                <span>Profile</span>
              </Link>
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                className={`flex flex-col items-center text-xs transition ${
                  pathname === "/login"
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-blue-400"
                }`}
              >
                <User size={20} />
                <span>Login</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}