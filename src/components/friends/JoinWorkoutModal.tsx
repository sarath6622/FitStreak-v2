// components/friends/JoinWorkoutModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import WorkoutPreviewModal from "@/components/workout/WorkoutPreviewModal";
import { toast } from "sonner";

export default function JoinWorkoutModal({
  userId,
  plans,
  onClose,
}: {
  userId: string;
  plans: any[];
  onClose: () => void;
}) {
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    const today = new Date().toISOString().split("T")[0];
    const userWorkoutRef = doc(db, "users", userId, "workouts", today);
    const plansRef = collection(userWorkoutRef, "plans");

    const existingPlans = await getDocs(plansRef);

    if (!existingPlans.empty && !showOverwriteModal) {
      // Step 1: instead of inline warning, show overwrite modal
      setShowOverwriteModal(true);
      return;
    }

    if (!existingPlans.empty && showOverwriteModal) {
      // Step 2: Delete existing if user confirms overwrite
      for (const planDoc of existingPlans.docs) {
        await deleteDoc(planDoc.ref);
      }
    }

    // Save new workout
    await setDoc(userWorkoutRef, {
      date: today,
      createdAt: new Date(),
    });

    for (const plan of plans) {
      await setDoc(doc(plansRef, plan.id), plan);
    }

    toast.success("💪 Workout joined successfully!");

    // ✅ Small delay so toast shows before navigating
    setTimeout(() => {
      router.replace("/workouts/todays-workouts");
    }, 800);

    onClose();
  }

  return (
    <>
      {/* Main Workout Preview */}
      <WorkoutPreviewModal
        title="Join Friend's Workout"
        plans={plans}
        onConfirm={handleConfirm}
        onClose={onClose}
      />

      {/* Overwrite Confirmation Modal */}
      {showOverwriteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-light)] rounded-xl w-[400px] p-6 space-y-4 shadow-lg border border-[var(--card-border)]">
            <h2 className="text-lg font-semibold text-white">
              Overwrite Workout?
            </h2>
            <p className="text-sm text-red-400">
              ⚠️ You already have a workout for today. If you continue, your
              existing workout will be{" "}
              <span className="font-semibold">overwritten</span>.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowOverwriteModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleConfirm(); // call again, this time it will overwrite
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}