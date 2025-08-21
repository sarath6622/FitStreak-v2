// ProfileForm.tsx
import React from "react";
import ProfileField from "./ProfileField";
import { UserProfile } from "@/types/UserProfile";

interface ProfileFormProps {
  formData: UserProfile | null;
  profile: UserProfile | null;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  profile,
  isEditing,
  onChange,
}) => {
  return (
    <div className="space-y-5">
      {/* Contact Section */}
      <div className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          Contact Info
        </h3>
        <ProfileField
          label="Email"
          name="email"
          value={profile?.email}
          isEditing={false}
        />
        <ProfileField
          label="Phone"
          name="phone"
          value={isEditing ? formData?.phone : profile?.phone}
          isEditing={isEditing}
          onChange={onChange}
        />
      </div>

      {/* Personal Section */}
      <div className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          Personal Info
        </h3>
        <ProfileField
          label="Age"
          name="age"
          type="number"
          value={isEditing ? formData?.age : profile?.age}
          isEditing={isEditing}
          onChange={onChange}
        />
        <ProfileField
          label="Height (cm)"
          name="height"
          type="number"
          value={isEditing ? formData?.height : profile?.height}
          isEditing={isEditing}
          onChange={onChange}
        />
        <ProfileField
          label="Weight (kg)"
          name="weight"
          type="number"
          value={isEditing ? formData?.weight : profile?.weight}
          isEditing={isEditing}
          onChange={onChange}
        />
        <ProfileField
          label="Gender"
          name="gender"
          type="select"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
          value={isEditing ? formData?.gender : profile?.gender}
          isEditing={isEditing}
          onChange={onChange}
        />
      </div>

      {/* Goal Section */}
      <div className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          Fitness Goal
        </h3>
        <ProfileField
          label="Goal"
          name="goal"
          value={isEditing ? formData?.goal : profile?.goal}
          isEditing={isEditing}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default ProfileForm;