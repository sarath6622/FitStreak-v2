"use client";

import { UserPlus } from "lucide-react";
import Avatar from "./Avatar";

interface FriendCardProps {
  user: {
    id: string;
    name?: string;
    username?: string;
    photoURL?: string;
    hasWorkoutPlan?: boolean;
    hasWorkoutToday?: boolean;
  };
  onAdd?: (id: string) => void;
  onJoinWorkout?: (id: string) => void;
}

export default function FriendCard({ user, onAdd, onJoinWorkout }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--card-background)] border border-[var(--card-border)] shadow-md hover:shadow-lg transition">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3">
        <Avatar
          id={user.id}
          name={user.name}
          username={user.username}
          photoURL={user.photoURL}
        />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">
            {user.name || "Unnamed"}

          </p>
          <p className="text-xs text-[var(--text-muted)]">
            @{user.username || "unknown"}

          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex gap-2">
        {onAdd && (
          <button
            onClick={() => onAdd(user.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]
              text-white shadow-sm hover:shadow-md hover:opacity-90 transition"
          >
            <UserPlus size={16} />
            Add
          </button>
        )}

        {user.hasWorkoutToday && onJoinWorkout && (
          <button
            onClick={() => onJoinWorkout(user.id)}
className="px-3 py-1.5 rounded-lg text-sm font-medium
           border border-[var(--card-border)] text-white]
           hover:bg-[var(--surface-hover)] hover:text-white transition">
            Sync Workout
          </button>
        )}
      </div>
    </div>
  );
}