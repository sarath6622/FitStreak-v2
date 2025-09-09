"use client";

interface AvatarProps {
  name?: string;
  username?: string;
  photoURL?: string;
  id: string;
}

export default function Avatar({ name, username, photoURL, id }: AvatarProps) {
  // 🎨 Gradient palette
  const gradients = [
    "from-pink-500 to-rose-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-indigo-500",
    "from-yellow-500 to-orange-500",
    "from-teal-500 to-sky-500",
    "from-red-500 to-pink-600",
  ];

  function getGradientForUser(key: string) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    return gradients[Math.abs(hash) % gradients.length];
  }

  // ✅ Generate initials
  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : username
    ? username[0].toUpperCase()
    : "?";

  const hasPhoto =
    typeof photoURL === "string" && photoURL.trim() !== "" && photoURL.startsWith("http");

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold text-white bg-gradient-to-r ${getGradientForUser(
        username || id
      )}`}
    >
      {initials}
    </div>
  );
}