"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import { Sparkles } from "lucide-react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");

  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // Pick loading message
  useEffect(() => {
    const messages = [
      "Summoning your workout wizard 🧙‍♂️",
      "Assembling dumbbells…",
      "Waking up the AI coach 🤖",
      "Looking for unused muscle fibers 💪",
      "Finding the perfect burn 🔥"
    ];
    setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Dynamically observe header/footer height
  useEffect(() => {
    const updateHeights = () => {
      setHeaderHeight(headerRef.current?.offsetHeight || 0);
      setFooterHeight(footerRef.current?.offsetHeight || 0);
    };

    const resizeObserver = new ResizeObserver(updateHeights);
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    updateHeights();
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
          <Header ref={headerRef} />
          <Navbar />
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