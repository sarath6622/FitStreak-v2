"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

interface WorkoutReminderConfig {
  enabled: boolean;
  time: string; // Format: "HH:MM" (24-hour)
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export function useWorkoutReminder() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [config, setConfig] = useState<WorkoutReminderConfig | null>(null);

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Load user's reminder config
    const loadConfig = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.reminderConfig) {
        setConfig(userData.reminderConfig);
      } else {
        // Default: remind every day at 6 PM
        setConfig({
          enabled: false,
          time: "18:00",
          days: [0, 1, 2, 3, 4, 5, 6], // All days
        });
      }
    };

    loadConfig();
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const scheduleNotification = (title: string, body: string, delay: number) => {
    if (permission !== "granted") return;

    setTimeout(() => {
      new Notification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "workout-reminder",
        requireInteraction: false,
        vibrate: [200, 100, 200],
      });
    }, delay);
  };

  const checkAndNotify = () => {
    if (!config?.enabled || permission !== "granted") return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Check if today is a reminder day
    if (!config.days.includes(currentDay)) return;

    // Check if it's time to remind
    if (currentTime === config.time) {
      scheduleNotification(
        "Time to Workout! 💪",
        "Your scheduled workout is waiting. Let's crush it today!",
        0
      );
    }
  };

  return {
    permission,
    config,
    requestPermission,
    scheduleNotification,
    checkAndNotify,
  };
}
