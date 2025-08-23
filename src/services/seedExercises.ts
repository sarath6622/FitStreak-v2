import { db } from "@/firebase";
import { collection, setDoc, doc, getDocs } from "firebase/firestore";
import exercises from "@/data/exercises.json";

export async function seedExercises() {
  const exercisesRef = collection(db, "exercises");

  console.log("🚀 Starting seeding process...");

  // Check if already seeded
  const snapshot = await getDocs(exercisesRef);
  console.log(`📊 Found ${snapshot.size} existing exercises in Firestore.`);

  if (!snapshot.empty) {
    console.log("⚠️ Exercises already exist, skipping seed.");
    return;
  }

  let counter = 0;

  for (const exercise of exercises) {
    const id =
      exercise.name?.replace(/\s+/g, "-").toLowerCase() ||
      `exercise-${counter}`;

    console.log(`➡️ Seeding exercise [${id}] -> ${exercise.name}`);

    try {
      await setDoc(doc(exercisesRef, id), {
        ...exercise,
        createdAt: new Date(),
      });
      console.log(`✅ Successfully added: ${exercise.name}`);
      counter++;
    } catch (err) {
      console.error(`❌ Failed to add ${exercise.name}`, err);
    }
  }

  console.log(`🎉 Done! Seeded ${counter} exercises into Firestore.`);
}