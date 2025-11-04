"use client";

import { auth, db } from "@/firebase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SuggestionSection from "@/components/SuggestionSection/index";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Dumbbell, Plus, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipCheck = searchParams.get("from") === "today";

  const [loading, setLoading] = useState(true);
  const [hasTodaysPlan, setHasTodaysPlan] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  useEffect(() => {
    const checkTodaysPlans = async () => {
      if (skipCheck) {
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const plansRef = collection(db, "users", user.uid, "workouts", today, "plans");
      const q = query(plansRef, orderBy("createdAt", "asc"));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setHasTodaysPlan(true);
      }

      setLoading(false);
    };

    checkTodaysPlans();
  }, [router, skipCheck]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Workouts</h1>
        <p className="text-gray-400">Plan your training and track progress</p>
      </div>

      {/* Today's Workouts Section - Primary */}
      {hasTodaysPlan ? (
        <Card className="mb-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group"
          onClick={() => router.push("/workouts/todays-workouts")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Dumbbell className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Today&apos;s Workout</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Your planned exercises for today
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium">Start</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">No Workout Planned</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Generate a workout plan to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Plan New Workout CTA */}
      {!showPlanner && (
        <div className="mb-6">
          <Button
            onClick={() => setShowPlanner(true)}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Plan New Workout
          </Button>
        </div>
      )}

      {/* Workout Planner - Collapsed by default */}
      {showPlanner && (
        <div className="mb-6 animate-in slide-in-from-top duration-300">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Workout Planner
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlanner(false)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </Button>
            </div>
            <SuggestionSection userId={auth.currentUser?.uid || ""} />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/workouts/history">
          <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">History</p>
                  <p className="text-xs text-gray-500">View past workouts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {hasTodaysPlan ? (
          <Link href="/workouts/todays-workouts">
            <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                    <Dumbbell className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Today</p>
                    <p className="text-xs text-gray-500">View today&apos;s plan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="bg-gray-900/30 border-gray-800/50 opacity-50 cursor-not-allowed">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-800/50 rounded-full">
                  <Dumbbell className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Today</p>
                  <p className="text-xs text-gray-600">No plan yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
