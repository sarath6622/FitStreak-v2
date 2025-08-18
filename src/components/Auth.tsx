"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { signInWithGoogle as customSignInWithGoogle } from "@/lib/signInWithGoogle";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("✅ Account created! You're logged in.");
        router.push("/setup-profile");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("✅ Welcome back! Logged in successfully.");
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    resetMessages();
    setLoading(true);
    try {
      const { isNewUser } = await customSignInWithGoogle();
      setSuccess("✅ Logged in with Google!");
      router.push(isNewUser ? "/setup-profile" : "/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-6 border border-gray-700">
        
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-white tracking-tight">
          {mode === "login" ? "Welcome Back" : "Create an Account"}
        </h2>
        <p className="text-center text-gray-400 text-sm">
          {mode === "login"
            ? "Sign in to continue your journey"
            : "Join us and start your journey"}
        </p>

        {/* Messages */}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        {success && <p className="text-green-400 text-center text-sm">{success}</p>}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition"
            placeholder="Email address"
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <input
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition"
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
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 text-gray-500">
          <hr className="flex-1 border-gray-700" />
          <span className="text-xs">OR</span>
          <hr className="flex-1 border-gray-700" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow"
        >
          <FcGoogle size={20} />
          {loading ? "Processing…" : "Continue with Google"}
        </button>

        {/* Switch Mode */}
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-gray-400">
            {mode === "login"
              ? "Don’t have an account?"
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
    </div>
  );
}