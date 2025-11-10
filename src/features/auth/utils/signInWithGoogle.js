// src/features/auth/utils/signInWithGoogle.js
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/config/firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      // New user: Create profile doc
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        age: null,
        height: null,
        weight: null,
        gender: null,
        goal: null
      });
      return { user, isNewUser: true };
    } else {
      // Existing user: Update last login
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
      return { user, isNewUser: false };
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};
