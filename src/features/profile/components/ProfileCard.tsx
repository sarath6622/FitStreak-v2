// ProfileCard.tsx
import React from "react";
import ProfileForm from "./ProfileForm";
import { UserProfile } from "@/features/shared/types/UserProfile";
import { Edit3, LogOut, Save, X } from "lucide-react";

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
      <div className="rounded-2xl border border-gray-800backdrop-blur-md p-6 shadow-2xl">
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
              {/* Save */}
              <button
                onClick={onSave}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl 
                   bg-gray-800/50 backdrop-blur-md px-4 py-2 text-sm font-semibold 
                   text-gray-100 border border-gray-700 shadow-md
                   hover:bg-gray-700/60 hover:shadow-lg hover:scale-[1.02] 
                   active:scale-[0.97] transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              {/* Cancel */}
              <button
                onClick={onToggleEdit}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl 
                   bg-gray-800/50 backdrop-blur-md px-4 py-2 text-sm font-semibold 
                   text-gray-300 border border-gray-700 shadow-md
                   hover:bg-gray-700/60 hover:shadow-lg hover:scale-[1.02] 
                   active:scale-[0.97] transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : (
            // Edit Profile
            <button
              onClick={onToggleEdit}
              className="w-full flex items-center justify-center gap-2 rounded-2xl 
                 bg-gray-800/50 backdrop-blur-md px-4 py-2 text-sm font-semibold 
                 text-gray-100 border border-gray-700 shadow-md
                 hover:bg-gray-700/60 hover:shadow-lg hover:scale-[1.02] 
                 active:scale-[0.97] transition-all duration-200"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}

          {profile && (
            // Sign Out
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 rounded-2xl 
                 bg-gray-800/50 backdrop-blur-md px-4 py-2 text-sm font-semibold 
                 text-gray-100 border border-gray-700 shadow-md
                 hover:bg-gray-700/60 hover:shadow-lg hover:scale-[1.02] 
                 active:scale-[0.97] transition-all duration-200"
              type="button"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;