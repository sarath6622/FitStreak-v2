// Notification Click Handler
// Add this to your service worker to handle notification clicks

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);

  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  // Handle different notification types
  if (action === 'start' || data.type === 'workout-reminder') {
    // Open workout page
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const url = data.url || '/workouts/todays-workouts';

        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else if (data.type === 'pr') {
    // Open workout history
    event.waitUntil(
      clients.openWindow('/workouts/history')
    );
  } else if (data.type === 'streak-milestone') {
    // Open profile/stats page
    event.waitUntil(
      clients.openWindow('/profile')
    );
  } else {
    // Default: open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);

  // Optional: Track that user dismissed the notification
  const data = event.notification.data || {};

  if (data.type === 'workout-reminder') {
    // Could send analytics here
    console.log('User dismissed workout reminder');
  }
});
