"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { signInWithGoogle as customSignInWithGoogle } from "@/lib/signInWithGoogle"; // Your custom function

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Update handleSubmit to redirect new users after sign up or login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // After sign up, you would normally create user doc, here you can redirect
        setSuccess("✅ Account created! You're logged in.");
        router.push("/setup-profile"); // Redirect new user to profile setup
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("✅ Welcome back! Logged in successfully.");
        router.push("/"); // Redirect existing user
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use your custom signInWithGoogle function that returns { user, isNewUser }
  const handleGoogle = async () => {
    resetMessages();
    setLoading(true);
    try {
      const { user, isNewUser } = await customSignInWithGoogle();
      setSuccess("✅ Logged in with Google!");

      if (isNewUser) {
        router.push("/setup-profile");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSuccess("👋 Logged out!");
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-gray-900 rounded-xl shadow-lg space-y-6 text-white">
      <h2 className="text-2xl font-bold text-center">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h2>

      {error && <p className="text-red-400 text-center">{error}</p>}
      {success && <p className="text-green-400 text-center">{success}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-yellow-500"
          placeholder="Email"
          type="email"
          value={email}
          autoComplete="username"
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <input
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-yellow-500"
          placeholder="Password"
          type="password"
          value={password}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
        >
          {loading
            ? "Processing…"
            : mode === "login"
            ? "Login"
            : "Sign Up"}
        </button>
      </form>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
      >
        {loading ? "Processing…" : "Continue with Google"}
      </button>

      <div className="flex items-center justify-center gap-1">
        <span className="text-gray-400">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
        </span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            resetMessages();
          }}
          className="text-yellow-400 hover:underline font-medium"
          disabled={loading}
        >
          {mode === "login" ? "Sign Up" : "Sign In"}
        </button>
      </div>
    </div>
  );
}
