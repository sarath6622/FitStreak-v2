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
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-white hover:border-yellow-500 transition">
      <label className="block text-sm font-semibold mb-1">{label}:</label>

      {isEditing ? (
        type === "select" ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none focus:border-yellow-500"
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
            className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none focus:border-yellow-500"
          />
        )
      ) : (
        <p className="text-gray-300">{value || "—"}</p>
      )}
    </div>
  );
};

export default ProfileField;