// page.tsx
'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PRSection from '@/components/history/PRSection';
import workoutData from '@/data/workoutHistory.json';
import { getPRs } from '@/lib/historyUtils';

export default function Home() {
  const prs = getPRs(workoutData); // ✅ Calculate PRs here

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black text-white">

        <>
          <Navbar />
          <main className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, User!
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
            <div className="mt-8 w-full max-w-2xl">
              <PRSection prs={prs} /> {/* ✅ Pass PRs */}
            </div>
          </main>
        </>
    </div>
  );
}