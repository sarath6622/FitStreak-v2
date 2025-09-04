"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/firebase";
import { toast } from "sonner";

export function useFCM() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔔 Initializing FCM...");
    
    if (!messaging) return; 
    console.log("✅ Messaging is supported.");
    
    // 👇 copy into a local non-null variable
    const msg = messaging;

    const requestPermissionAndToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            console.log("✅ FCM Token:", token);
            setFcmToken(token);
            // TODO: Send token to backend
          } else {
            console.warn("⚠️ No registration token available.");
          }
        } else {
          console.log("🚫 Notification permission not granted.");
        }
      } catch (err) {
        console.error("🔥 Error retrieving FCM token:", err);
      }
    };

    requestPermissionAndToken();

    const unsubscribe = onMessage(msg, (payload) => {
      console.log("📩 Message received:", payload);

      if (payload.notification?.title) {
        toast(payload.notification.title, {
          description: payload.notification.body,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return fcmToken;
}