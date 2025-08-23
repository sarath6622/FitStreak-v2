"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Sparkles } from "lucide-react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null); // bottom bar only

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

  useEffect(() => {
    const setVars = () => {
      if (headerRef.current) {
        const h = Math.ceil(headerRef.current.getBoundingClientRect().height);
        document.documentElement.style.setProperty("--header-height", `${h}px`);
      } else {
        document.documentElement.style.setProperty("--header-height", `0px`);
      }

      if (mobileNavRef.current && getComputedStyle(mobileNavRef.current).display !== "none") {
        const f = Math.ceil(mobileNavRef.current.getBoundingClientRect().height);
        document.documentElement.style.setProperty("--footer-height", `${f}px`);
      } else {
        document.documentElement.style.setProperty("--footer-height", `0px`);
      }
    };

    const ro = new ResizeObserver(setVars);
    if (headerRef.current) ro.observe(headerRef.current);
    if (mobileNavRef.current) ro.observe(mobileNavRef.current);

    requestAnimationFrame(setVars);
    const t = setTimeout(setVars, 50);

    window.addEventListener("resize", setVars);
    window.addEventListener("orientationchange", setVars);

    return () => {
      ro.disconnect();
      clearTimeout(t);
      window.removeEventListener("resize", setVars);
      window.removeEventListener("orientationchange", setVars);
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
    <div className="min-h-[100svh] bg-black text-white flex flex-col">
      {user && <Header ref={headerRef} />}

      {/* Scrollable region only between header + navbar */}
<main
  className="flex-1 overflow-y-auto px-4"
  style={{
    paddingTop: "var(--header-height)",
    paddingBottom: "var(--footer-height)",
  }}
>
        {children}
      </main>

      {user && <Navbar ref={mobileNavRef} />}
    </div>
  );
}