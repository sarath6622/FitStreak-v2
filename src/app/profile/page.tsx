"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { signOut } from "firebase/auth";
import ProfileCard from "@/components/Profile/ProfileCard";
import { UserProfile } from "@/types/UserProfile";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ProfilePage: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
   const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile(user.uid, user);
      } else {
        setProfile(null);
        setFormData(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const fetchProfile = async (uid: string, authUser: FirebaseUser) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      setProfile(userDoc.data() as UserProfile);
      setFormData(userDoc.data() as UserProfile);
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    } else {
      const newProfile: UserProfile = {
        name: authUser.displayName || "",
        email: authUser.email || "",
        phone: "",
        age: null,
        height: null,
        weight: null,
        gender: null,
        goal: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      setProfile(newProfile);
      setFormData(newProfile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    let value: any = e.target.value;
    if (["age", "height", "weight"].includes(e.target.name)) {
      value = value === "" ? null : Number(value);
    }

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSignOut = async () => {
  await signOut(auth);
  // Optionally, reset state or redirect
  setFirebaseUser(null);
  setProfile(null);
  setFormData(null);
  router.push("/");
};

  const handleSave = async () => {
    if (!firebaseUser || !formData) return;
    await setDoc(doc(db, "users", firebaseUser.uid), formData, { merge: true });
    setProfile(formData);
    toast.success("Profile updated", {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });
    setIsEditing(false);
  };

if (loading) {
  return           <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <Sparkles className="w-8 h-8 animate-spin text-blue-400" />
    </div>
}

  if (!firebaseUser) return <div className="text-center mt-10">Please log in to view your profile.</div>;

  return (
    <ProfileCard
      formData={formData}
      profile={profile}
      isEditing={isEditing}
      onChange={handleChange}
      onSave={handleSave}
      onToggleEdit={() => setIsEditing((prev) => !prev)}
      onSignOut={handleSignOut}
    />
  );
};

export default ProfilePage;