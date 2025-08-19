"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    // Optional: Show a loading spinner or blank screen while checking auth state
    return <div className="bg-black text-white flex items-center justify-center">Loading...</div>;
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
      <main className={user ? "pt-16 pb-16 sm:pb-0" : ""}>{children}</main>
    </>
  );
}
