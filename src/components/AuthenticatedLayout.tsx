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

  const loadingMessages = [
    "Summoning your workout wizard 🧙‍♂️",
    "Assembling dumbbells…",
    "Waking up the AI coach 🤖",
    "Looking for unused muscle fibers 💪",
    "Finding the perfect burn 🔥"
  ];

  // Random fun loading text
  useEffect(() => {
    if (loading) {
      setLoadingMessage(
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
      );
    }
  }, [loading]);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Dynamically set --header-height / --footer-height
  useEffect(() => {
    const updateHeights = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerRef.current.offsetHeight}px`
        );
      }

      if (footerRef.current) {
        document.documentElement.style.setProperty(
          "--footer-height",
          `${footerRef.current.offsetHeight}px`
        );
      }
    };

    const observer = new ResizeObserver(updateHeights);
    if (headerRef.current) observer.observe(headerRef.current);
    if (footerRef.current) observer.observe(footerRef.current);

    updateHeights(); // run once

    return () => observer.disconnect();
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
        className={
          user
            ? "relative pt-[calc(env(safe-area-inset-top)+var(--header-height))] pb-[calc(env(safe-area-inset-bottom)+var(--footer-height))]"
            : ""
        }

      >
        {children}
      </main>
    </>
  );
}