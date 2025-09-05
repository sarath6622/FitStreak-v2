"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Sparkles } from "lucide-react";
import { useFCM } from "@/hooks/useFCM";
import LoadingSpinner from "./ui/LoadingSpinner";

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
<LoadingSpinner />
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