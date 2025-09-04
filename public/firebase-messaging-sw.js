importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: 'AIzaSyAZvkmJRzoaqFrIaKUvcSvN18anZf_S18g',
  authDomain: 'fitstreak-51c3a.firebaseapp.com',
  projectId: 'fitstreak-51c3a',
  storageBucket: 'fitstreak-51c3a.firebasestorage.app',
  messagingSenderId: '1024482375277',
  appId: '1:1024482375277:web:1863539d79df41d014f164',
  measurementId: 'G-SJJSG3K8C3',
});

const messaging = firebase.messaging();

// Show notification when app is in background
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/icons/android/res/mipmap-xxxhdpi/ic_launcher.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});