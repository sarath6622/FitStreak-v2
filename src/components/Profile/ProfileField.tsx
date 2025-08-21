// ProfileField.tsx
import React from "react";

interface ProfileFieldProps {
  label: string;
  name: string;
  value: string | number | null | undefined;
  isEditing: boolean;
  type?: "text" | "number" | "select";
  options?: { label: string; value: string }[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  name,
  value,
  isEditing,
  type = "text",
  options,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-gray-400 mb-1">
        {label}
      </label>

      {isEditing ? (
        type === "select" ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full rounded-xl bg-gray-900 border border-gray-600 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="w-full rounded-xl bg-gray-900 border border-gray-600 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        )
      ) : (
        <p className="text-base font-semibold text-white">
          {value || "—"}
        </p>
      )}
    </div>
  );
};

export default ProfileField;