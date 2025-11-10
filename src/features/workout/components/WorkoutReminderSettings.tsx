"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Bell, BellOff, Clock } from "lucide-react";
import { toast } from "sonner";

interface ReminderConfig {
  enabled: boolean;
  time: string;
  days: number[];
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function WorkoutReminderSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [config, setConfig] = useState<ReminderConfig>({
    enabled: false,
    time: "18:00",
    days: [1, 2, 3, 4, 5], // Mon-Fri by default
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Load user's config
    const loadConfig = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.reminderConfig) {
        setConfig(userData.reminderConfig);
      }
    };

    loadConfig();
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Your browser doesn't support notifications");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Notifications enabled!");
      // Show a test notification
      new Notification("FitStreak", {
        body: "You'll receive workout reminders like this!",
        icon: "/icon-192x192.png",
      });
    } else {
      toast.error("Notification permission denied");
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to save settings");
      return;
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        reminderConfig: config,
      });

      toast.success("Reminder settings saved!");
    } catch (error) {
      console.error("Error saving reminder config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setConfig((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort(),
    }));
  };

  return (
    <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.enabled ? (
            <Bell className="w-5 h-5 text-blue-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="font-semibold text-white">Workout Reminders</h3>
        </div>

        <button
          onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            config.enabled ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              config.enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <>
          {/* Notification Permission */}
          {permission !== "granted" && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 mb-2">
                Enable browser notifications to receive reminders
              </p>
              <button
                onClick={requestPermission}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          )}

          {/* Time Picker */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Reminder Time
            </label>
            <input
              type="time"
              value={config.time}
              onChange={(e) => setConfig((prev) => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Days Selector */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Remind me on</label>
            <div className="flex gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    config.days.includes(day.value)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || config.days.length === 0}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-semibold transition-colors"
          >
            {saving ? "Saving..." : "Save Reminder Settings"}
          </button>
        </>
      )}
    </div>
  );
}
