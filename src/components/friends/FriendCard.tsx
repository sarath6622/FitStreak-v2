"use client";

import { UserPlus } from "lucide-react";
import Avatar from "./Avatar";

interface FriendCardProps {
  user: {
    id: string;
    name?: string;
    username?: string;
    photoURL?: string;
  };
  onAdd: (id: string) => void;
}

export default function FriendCard({ user, onAdd }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-light)] border border-[var(--card-border)]">
      <div className="flex items-center gap-3">
        <Avatar
          id={user.id}
          name={user.name}
          username={user.username}
          photoURL={user.photoURL}
        />
        <div>
          <p className="font-medium">@{user.username || "unknown"}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {user.name || "Unnamed"} • ID: {user.id.slice(0, 6)}
          </p>
        </div>
      </div>
      <button
        onClick={() => onAdd(user.id)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-blue)] hover:bg-[var(--accent-green)] text-sm"
      >
        <UserPlus size={16} /> Add Friend
      </button>
    </div>
  );
}