"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";
import { Sparkles } from "lucide-react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loadingMessages = [
    "Summoning your workout wizard 🧙‍♂️",
    "Assembling dumbbells…",
    "Waking up the AI coach 🤖",
    "Looking for unused muscle fibers 💪",
    "Finding the perfect burn 🔥"
  ];

  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (loading) {
      // Pick a random message
      const randomMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setLoadingMessage(randomMsg);
    }
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <Sparkles className="w-6 h-6 mb-3 animate-spin" />
        <h1 className="text-3xl font-bold mb-1">FitStreak</h1>
        <p className="text-sm text-gray-400 animate-pulse">Summoning your personal coach...</p>
      </div>
    );
  }

  return (
    <>
      {/* Conditionally render Navbar only if authenticated */}
      {user &&

        <><header className="fixed  top-0 left-0 right-0 z-50 flex justify-between items-center p-4 border-b bg-black border-gray-700 shadow-md text-white">
          <h1 className="text-lg font-semibold">FitStreak</h1>
          <div className="flex gap-4 items-center">
            {/* Additional header content */}
          </div>
        </header><Navbar /></>}

      {/* Always render children */}
      <main
        className={
          user
            ? "pt-[calc(56px+env(safe-area-inset-top))] pb-[calc(64px+env(safe-area-inset-bottom))]"
            : ""
        }

      >
        {children}
      </main>
    </>
  );
}
