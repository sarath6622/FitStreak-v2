// components/Profile/ProfileCard.tsx
import React from "react";
import ProfileForm from "./ProfileForm";
import { UserProfile } from "@/types/UserProfile";

interface ProfileCardProps {
  formData: UserProfile | null;
  profile: UserProfile | null;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onToggleEdit: () => void;
  onSignOut: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  formData,
  profile,
  isEditing,
  onChange,
  onSave,
  onToggleEdit,
  onSignOut,
}) => {
  return (
    <div className="max-w-lg mx-auto bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg mt-10 text-white">
      <h1 className="text-2xl font-bold mb-4 text-white">My Profile</h1>

      <ProfileForm
        formData={formData}
        profile={profile}
        isEditing={isEditing}
        onChange={onChange}
      />

      <div className="mt-6 flex gap-4">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              className="bg-green-600 border border-green-700 text-white px-4 py-2 rounded-lg hover:border-yellow-500 hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={onToggleEdit}
              className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg hover:border-yellow-500 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={onToggleEdit}
            className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg hover:border-yellow-500 hover:bg-yellow-500 hover:text-gray-800 transition"
          >
            Edit Profile
          </button>
        )}
        {profile && (
          <button
            onClick={onSignOut}
            className="bg-red-700 border border-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-800 hover:border-yellow-500 transition"
            type="button"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
