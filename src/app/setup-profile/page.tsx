"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

interface FormData {
  name: string;
  age: number | null;
  gender: string | null;
  phone: string;
  height: number | null;
  weight: number | null;
  goal: string | null;
}

const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];
const goals = [
  "Lose weight",
  "Build muscle",
  "Improve stamina",
  "Maintain health",
];

const stepVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export default function SetupProfile() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: null,
    gender: null,
    phone: "",
    height: null,
    weight: null,
    goal: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canProceedStep1 = formData.name.trim() !== "" && formData.age !== null && formData.gender;
  const canProceedStep2 = formData.height !== null && formData.weight !== null;
  const canProceedStep3 = formData.goal !== null;

  const handleNext = () => {
    if ((step === 1 && canProceedStep1) || (step === 2 && canProceedStep2)) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!canProceedStep3) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      // Prepare data with correct type conversions as needed
      const dataToSave = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        height: formData.height,
        weight: formData.weight,
        goal: formData.goal,
        lastUpdated: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), dataToSave, { merge: true });

      alert("Profile setup complete!");
      router.push("/"); // Redirect to root page after saving
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 text-white">
      <div className="rounded-xl shadow-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Set up your profile</h1>

        {error && (
          <p className="mb-4 text-center text-red-500 font-semibold">{error}</p>
        )}

        <AnimatePresence>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-gray-300">Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="Your full name"
                />
              </label>
              <label className="block">
                <span className="text-gray-300">Age</span>
                <input
                  type="number"
                  min={1}
                  value={formData.age ?? ""}
                  onChange={(e) => updateField("age", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="Your age"
                />
              </label>
              <label className="block">
                <span className="text-gray-300">Gender</span>
                <select
                  value={formData.gender || ""}
                  onChange={(e) => updateField("gender", e.target.value || null)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Select gender</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-gray-300">Phone (optional)</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="+1 234 567 8900"
                />
              </label>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-gray-300">Height (cm)</span>
                <input
                  type="number"
                  min={50}
                  max={300}
                  value={formData.height ?? ""}
                  onChange={(e) => updateField("height", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="e.g. 170"
                />
              </label>
              <label className="block">
                <span className="text-gray-300">Weight (kg)</span>
                <input
                  type="number"
                  min={20}
                  max={400}
                  value={formData.weight ?? ""}
                  onChange={(e) => updateField("weight", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="e.g. 65"
                />
              </label>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-gray-300">Fitness Goal</span>
                <select
                  value={formData.goal || ""}
                  onChange={(e) => updateField("goal", e.target.value || null)}
                  className="mt-1 block w-full rounded-md p-2 bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Choose a goal</option>
                  {goals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
                <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
              disabled={isSubmitting}
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md font-semibold ${
                (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={isSubmitting || (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={`bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold ${
                !canProceedStep3 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting || !canProceedStep3}
            >
              {isSubmitting ? "Submitting..." : "Finish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
