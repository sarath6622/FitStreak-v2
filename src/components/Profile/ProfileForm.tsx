// components/Profile/ProfileForm.tsx
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
    <div className="space-y-4">
      <ProfileField
        label="Name"
        name="name"
        value={isEditing ? formData?.name : profile?.name}
        isEditing={isEditing}
        onChange={onChange}
      />
      <ProfileField
        label="Email"
        name="email"
        value={profile?.email}
        isEditing={false} // email is never editable
      />
      <ProfileField
        label="Phone"
        name="phone"
        value={isEditing ? formData?.phone : profile?.phone}
        isEditing={isEditing}
        onChange={onChange}
      />
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
      <ProfileField
        label="Goal"
        name="goal"
        value={isEditing ? formData?.goal : profile?.goal}
        isEditing={isEditing}
        onChange={onChange}
      />
    </div>
  );
};

export default ProfileForm;