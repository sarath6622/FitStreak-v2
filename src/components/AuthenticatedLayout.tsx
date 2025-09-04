"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Sparkles } from "lucide-react";
import { useFCM } from "@/hooks/useFCM";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const fcmToken = useFCM();

  useEffect(() => {
    const copy = [
      "Summoning your workout wizard 🧙‍♂️",
      "Assembling dumbbells…",
      "Waking up the AI coach 🤖",
      "Looking for unused muscle fibers 💪",
      "Finding the perfect burn 🔥",
    ];
    if (loading) setMsg(copy[Math.floor(Math.random() * copy.length)]);
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100svh] grid place-items-center bg-black text-white">
        <div className="flex flex-col items-center">
          <Sparkles className="w-8 h-8 mb-3 animate-spin text-blue-400" />
          <h1 className="text-3xl font-bold">FitStreak</h1>
          <p className="text-sm text-gray-400 mt-2">{msg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-black text-white">
      {user && <Header />}

      {/*
        The main content area now uses a simple CSS-based approach.
        The padding is applied using `calc()` to combine a base height
        with the dynamic safe area insets.
      */}
      <main className=" pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      {user && <Navbar />}
    </div>
  );
}