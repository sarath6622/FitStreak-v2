'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import PRSection from '@/components/history/PRSection';
import workoutData from '@/data/workoutHistory.json';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black text-white">
      {!user ? (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Welcome to FitTrack</h1>
          <p className="text-lg text-gray-300 mb-6">
            Track your fitness journey, visualize progress, and get personalized workouts.
          </p>
          <PRSection workoutHistory={workoutData} />
          <Link
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <>
          <Navbar />

          <main className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-gray-300 mb-6">
              Track your workouts, view your progress, and achieve your goals!
            </p>
            <Link
              href="/workouts"
              className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Start a Workout
            </Link>
            {/* PR Section under the welcome message */}
            <div className="mt-8 w-full max-w-2xl">
              <PRSection workoutHistory={workoutData} />
            </div>
          </main>
        </>
      )}
    </div>
  );
}