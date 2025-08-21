// ProfileCard.tsx
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
  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ?? "U";

  return (
    <div className="mx-auto mt-6 max-w-lg">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 backdrop-blur-md p-6 shadow-2xl">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-2xl font-bold shadow-lg">
            {initials}
          </div>
          <h1 className="mt-3 text-xl font-bold text-white">
            {profile?.name ?? "My Profile"}
          </h1>
        </div>

        {/* Profile Form / Display */}
        <ProfileForm
          formData={formData}
          profile={profile}
          isEditing={isEditing}
          onChange={onChange}
        />

        {/* Buttons */}
<div className="mt-6 flex flex-col gap-3">
  {isEditing ? (
    <div className="flex gap-3">
      <button
        onClick={onSave}
        className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 
                   font-semibold text-white shadow-md hover:shadow-xl 
                   hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Save
      </button>
      <button
        onClick={onToggleEdit}
        className="flex-1 rounded-2xl bg-gray-800/80 px-4 py-3 
                   font-semibold text-gray-200 border border-gray-700 
                   shadow-md hover:bg-gray-700 hover:shadow-xl 
                   hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      onClick={onToggleEdit}
      className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 
                 font-semibold text-white shadow-md hover:shadow-xl 
                 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
    >
      Edit Profile
    </button>
  )}

  {profile && (
    <button
      onClick={onSignOut}
      className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 
                 font-semibold text-white shadow-md hover:shadow-xl 
                 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      type="button"
    >
      Sign Out
    </button>
  )}
</div>
      </div>
    </div>
  );
};

export default ProfileCard;