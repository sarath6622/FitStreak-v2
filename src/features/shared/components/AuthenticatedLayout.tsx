"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import Header from "@/features/shared/components/Header";
import Navbar from "@/features/shared/components/Navbar";
import { Sparkles } from "lucide-react";
import { useFCM } from "@/features/shared/hooks/useFCM";
import LoadingSpinner from "@/features/shared/ui/LoadingSpinner";

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
      setTimeout(() => setLoading(false), 1000);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {user && <Header />}

      {/*
        The main content area now uses a simple CSS-based approach.
        The padding is applied using `calc()` to combine a base height
        with the dynamic safe area insets.
      */}
      <main className="pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      {user && <Navbar />}
    </div>
  );
}