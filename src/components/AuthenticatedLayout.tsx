"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Header from "@/components/Header";
// import FooterBar from "@/components/FooterBar";
import Navbar from "@/components/Navbar";
import { Sparkles } from "lucide-react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

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
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Measure actual rendered heights (which include safe areas)
  useEffect(() => {
    const setVars = () => {
      if (headerRef.current) {
        const h = Math.ceil(headerRef.current.getBoundingClientRect().height);
        document.documentElement.style.setProperty("--header-height", `${h}px`);
      }

      if (footerRef.current) {
        const f = Math.ceil(footerRef.current.getBoundingClientRect().height);
        document.documentElement.style.setProperty("--footer-height", `${f}px`);
      }
    };

    const ro = new ResizeObserver(setVars);
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);

    // run after layout settles (iOS sometimes updates env(...) a tick later)
    requestAnimationFrame(setVars);
    const t = setTimeout(setVars, 50);

    const onResize = () => setVars();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      ro.disconnect();
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [user]);

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
      {user && <Header ref={headerRef} />}

      {/* MAIN gets padded by measured heights ONLY (no extra env(...) here!) */}
      <main className="px-4 pt-[var(--header-height)] pb-[var(--footer-height)]">
        {children}
      </main>

      {user && (
        // <FooterBar ref={footerRef}>
          <Navbar />
        // </FooterBar>
      )}
    </div>
  );
}