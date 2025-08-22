"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import { Sparkles } from "lucide-react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Dynamic spacing
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const loadingMessages = [
    "Summoning your workout wizard 🧙‍♂️",
    "Assembling dumbbells…",
    "Waking up the AI coach 🤖",
    "Looking for unused muscle fibers 💪",
    "Finding the perfect burn 🔥"
  ];

  useEffect(() => {
    if (loading) {
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

  // Watch header & footer size dynamically
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (footerRef.current) setFooterHeight(footerRef.current.offsetHeight);
    });

    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <Sparkles className="w-6 h-6 mb-3 animate-spin" />
        <h1 className="text-3xl font-bold mb-1">FitStreak</h1>
        <p className="text-sm text-gray-400 animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <>
      {user && (
        <>
          {/* Attach refs so we can measure */}
          <div ref={headerRef}>
            <Header />
          </div>
          <div ref={footerRef}>
            <Navbar />
          </div>
        </>
      )}

      <main
        style={{
          paddingTop: `calc(${headerHeight}px + env(safe-area-inset-top))`,
          paddingBottom: `calc(${footerHeight}px + env(safe-area-inset-bottom))`,
        }}
      >
        {children}
      </main>
    </>
  );
}