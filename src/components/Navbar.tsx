"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, History, User } from "lucide-react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} strokeWidth={1.5} /> },
  { href: "/workouts", label: "Workouts", icon: <Dumbbell size={20} strokeWidth={1.5} /> },
  { href: "/workouts/history", label: "History", icon: <History size={20} strokeWidth={1.5} /> },
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
      <nav className="hidden sm:flex fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-lg border-b border-gray-700 shadow z-50 px-6 py-4 justify-between items-center">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          FitTrack
        </h1>
        <ul className="flex gap-6 items-center">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`relative text-sm font-medium transition 
                  ${pathname === href ? "text-blue-400" : "text-gray-400 hover:text-blue-300"}
                `}
              >
                {label}
                {pathname === href && (
                  <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
                )}
              </Link>
            </li>
          ))}
          {user ? (
            <li>
              <Link href="/profile" className="flex items-center gap-2">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-500 hover:scale-105 transition"
                />
              </Link>
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                className={`flex items-center gap-1 transition ${pathname === "/login"
                  ? "text-blue-400"
                  : "text-gray-400 hover:text-blue-300"
                  }`}
              >
                <User size={20} strokeWidth={1.5} />
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile Navbar - Floating pill style */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className=" rounded-2xl bg-black/80 backdrop-blur-lg shadow-xl p-2">
          <ul className="flex justify-around items-center">
            {navItems.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex flex-col items-center text-xs px-4 py-2 rounded-xl transition
                    active:scale-90
                    ${pathname === href
                      ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 shadow-inner"
                      : "text-gray-400 hover:text-gray-200"}
                  `}
                >
                  {icon}
                  <span
                    className={`
                      transition-all duration-200 overflow-hidden
                      ${pathname === href
                        ? "opacity-100 max-h-4 mt-1"
                        : "opacity-0 max-h-0 mt-0"}
                    `}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            ))}

            {user ? (
              <li>
                <Link
                  href="/profile"
                  className={`
                    flex flex-col items-center text-xs px-4 py-2 rounded-xl transition
                    active:scale-90
                    ${pathname === "/profile"
                      ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 shadow-inner"
                      : "text-gray-400 hover:text-gray-200"}
                  `}
                >
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt="Profile"
                    className="w-6 h-6 rounded-full border border-gray-500"
                  />
                  <span
                    className={`
                      transition-all duration-200 overflow-hidden
                      ${pathname === "/profile"
                        ? "opacity-100 max-h-4 mt-1"
                        : "opacity-0 max-h-0 mt-0"}
                    `}
                  >
                    Profile
                  </span>
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  className={`
                    flex flex-col items-center text-xs px-4 py-2 rounded-xl transition
                    active:scale-90
                    ${pathname === "/login"
                      ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 shadow-inner"
                      : "text-gray-400 hover:text-gray-200"}
                  `}
                >
                  <User size={20} strokeWidth={1.5} />
                  <span
                    className={`
                      transition-all duration-200 overflow-hidden
                      ${pathname === "/login"
                        ? "opacity-100 max-h-4 mt-1"
                        : "opacity-0 max-h-0 mt-0"}
                    `}
                  >
                    Login
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}