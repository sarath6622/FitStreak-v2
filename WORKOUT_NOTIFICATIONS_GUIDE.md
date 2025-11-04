# Workout Notifications System - Complete Guide

## Overview

This guide explains the complete in-app notification system for workout reminders in FitStreak. The system includes:

1. **In-App Banner Notifications** - Visual reminders within the app
2. **Browser Push Notifications** - System notifications even when app is in background
3. **Customizable Reminder Settings** - Users can configure when and how they want to be reminded
4. **Smart Detection** - Automatically checks if workout is completed

---

## Features Implemented

### ✅ 1. In-App Reminder Banner ([WorkoutReminderBanner.tsx](src/components/WorkoutReminderBanner.tsx))

**What it does:**
- Shows a beautiful animated banner at the top of the app
- Appears 2 seconds after page load if no workout logged today
- Auto-dismisses after 10 seconds
- Can be manually dismissed
- Click "Start" to go directly to today's workout

**How it works:**
- Checks Firebase for today's workout completion
- Stores dismissal state in localStorage (per day)
- Re-checks every 5 minutes
- Shows muscle group name if available

**Customization:**
```typescript
// Change auto-dismiss time (currently 10 seconds)
<motion.div
  transition={{ duration: 10 }} // Change this value
/>

// Change re-check interval (currently 5 minutes)
const interval = setInterval(checkWorkoutStatus, 5 * 60 * 1000);
```

---

### ✅ 2. Browser Push Notifications ([notificationService.ts](src/lib/notificationService.ts))

**Features:**
- Request notification permissions
- Show workout reminders
- Show streak milestones (7, 14, 30, 50, 100, 365 days)
- Show PR (Personal Record) notifications
- Click notification to open relevant page

**Usage:**
```typescript
import { notificationService } from "@/lib/notificationService";

// Request permission
await notificationService.requestPermission();

// Show workout reminder
await notificationService.showWorkoutReminder("Chest");

// Show streak milestone
await notificationService.showStreakMilestone(30);

// Show PR notification
await notificationService.showPRNotification("Bench Press", "+5kg");
```

---

### ✅ 3. Reminder Settings Component ([WorkoutReminderSettings.tsx](src/components/WorkoutReminderSettings.tsx))

**Features:**
- Toggle reminders on/off
- Set reminder time (using time picker)
- Choose which days to be reminded (Mon-Sun)
- Request browser notification permissions
- Saves configuration to Firebase

**Integration:**
Add this component to your profile/settings page:

```typescript
import WorkoutReminderSettings from "@/components/WorkoutReminderSettings";

<WorkoutReminderSettings />
```

---

### ✅ 4. Reminder Hook ([useWorkoutReminder.ts](src/hooks/useWorkoutReminder.ts))

**Features:**
- Load user's reminder configuration from Firebase
- Check notification permission
- Schedule notifications
- Manual trigger for checking and notifying

**Usage:**
```typescript
import { useWorkoutReminder } from "@/hooks/useWorkoutReminder";

const {
  permission,
  config,
  requestPermission,
  scheduleNotification,
  checkAndNotify
} = useWorkoutReminder();

// Request permission
if (permission !== "granted") {
  await requestPermission();
}

// Check if it's time to notify
checkAndNotify();
```

---

## Integration Steps

### Step 1: Add Settings to Profile Page

Add the reminder settings component to your profile page:

```typescript
// src/app/profile/page.tsx
import WorkoutReminderSettings from "@/components/WorkoutReminderSettings";

export default function ProfilePage() {
  return (
    <div>
      {/* ... other profile content ... */}

      <WorkoutReminderSettings />
    </div>
  );
}
```

### Step 2: (ALREADY DONE) Banner is Active

The banner is already integrated in `src/app/layout.tsx` and will show automatically when:
- User hasn't logged workout today
- Banner wasn't dismissed today
- After 2-second delay on page load

### Step 3: Add Scheduled Notifications (Optional)

To add daily scheduled notifications, create a background service:

```typescript
// src/app/api/cron/daily-reminder/route.ts
import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notificationService";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Get all users
  const usersSnap = await getDocs(collection(db, "users"));

  for (const userDoc of usersSnap.docs) {
    const config = userDoc.data().reminderConfig;

    if (config?.enabled) {
      // Check if today is a reminder day
      const currentDay = new Date().getDay();

      if (config.days.includes(currentDay)) {
        // Send reminder notification
        await notificationService.showWorkoutReminder();
      }
    }
  }

  return NextResponse.json({ success: true });
}
```

Then set up a cron job (Vercel Cron, GitHub Actions, or similar) to hit this endpoint daily.

---

## Notification Flow

### In-App Banner Flow:
```
User opens app
     ↓
Check if workout logged today
     ↓
If NO → Wait 2 seconds
     ↓
Show animated banner
     ↓
User clicks "Start" → Navigate to workout page
     OR
User clicks "X" → Dismiss (saved to localStorage)
     OR
10 seconds pass → Auto-dismiss
```

### Push Notification Flow:
```
App requests permission (one-time)
     ↓
User grants permission
     ↓
Service worker registers
     ↓
At scheduled time OR manual trigger
     ↓
Show push notification
     ↓
User clicks notification → Open workout page
```

---

## Customization Guide

### Change Banner Appearance

Edit [WorkoutReminderBanner.tsx](src/components/WorkoutReminderBanner.tsx):

```typescript
// Change colors
className="bg-gradient-to-r from-blue-600 to-purple-600"
// to
className="bg-gradient-to-r from-green-600 to-teal-600"

// Change position
className="fixed top-16 left-0 right-0"
// to
className="fixed bottom-4 left-4 right-4"

// Change animation
initial={{ y: -100, opacity: 0 }}
// to
initial={{ scale: 0.8, opacity: 0 }}
```

### Change Notification Messages

Edit [notificationService.ts](src/lib/notificationService.ts):

```typescript
async showWorkoutReminder(muscleGroup?: string): Promise<void> {
  const title = "🔥 Let's Go!"; // Change this
  const body = "Time to crush today's workout!"; // Change this
  // ...
}
```

### Add New Notification Types

```typescript
// In notificationService.ts
async showRestDayReminder(): Promise<void> {
  await this.showNotification({
    title: "Rest Day Reminder",
    body: "Today is your rest day. Recovery is important!",
    tag: "rest-day",
    data: { type: "rest-day" },
  });
}
```

---

## Firebase Data Structure

### User Reminder Configuration
```typescript
// Firestore: users/{userId}
{
  reminderConfig: {
    enabled: boolean,
    time: "18:00", // 24-hour format
    days: [1, 2, 3, 4, 5] // 0=Sun, 1=Mon, ..., 6=Sat
  }
}
```

### Workout Completion Check
```typescript
// Firestore: users/{userId}/workouts/{YYYY-MM-DD}
{
  exercises: [
    {
      name: "Bench Press",
      weight: [50, 52.5, 55],
      repsPerSet: [10, 10, 8],
      // ...
    }
  ]
}
```

---

## Testing

### Test In-App Banner:
1. Make sure you haven't logged workout today
2. Open the app
3. Wait 2 seconds
4. Banner should appear at the top
5. Click "Start" to test navigation
6. Refresh page and click "X" to test dismissal
7. Refresh again - banner should NOT appear (dismissed for today)

### Test Push Notifications:
1. Open DevTools Console
2. Run:
```javascript
import { notificationService } from "@/lib/notificationService";

// Request permission
await notificationService.requestPermission();

// Test workout reminder
await notificationService.showWorkoutReminder("Chest");

// Test streak milestone
await notificationService.showStreakMilestone(7);
```

### Test Settings:
1. Go to profile page
2. Toggle "Workout Reminders" on
3. Click "Enable Notifications" if prompted
4. Select time (e.g., 6:00 PM)
5. Select days (e.g., Mon-Fri)
6. Click "Save Reminder Settings"
7. Check Firebase to verify `reminderConfig` was saved

---

## Browser Compatibility

| Browser | In-App Banner | Push Notifications |
|---------|--------------|-------------------|
| Chrome Desktop | ✅ | ✅ |
| Chrome Android | ✅ | ✅ |
| Safari Desktop | ✅ | ✅ (macOS 13+) |
| Safari iOS | ✅ | ✅ (iOS 16.4+) |
| Firefox | ✅ | ✅ |
| Edge | ✅ | ✅ |

---

## Troubleshooting

### Banner not showing:
- Check if workout was already logged today
- Check localStorage for `workout-reminder-dismissed-{date}`
- Check console for errors
- Verify user is authenticated

### Notifications not working:
- Check permission: `Notification.permission`
- Verify service worker is registered: DevTools → Application → Service Workers
- Check browser compatibility (iOS needs 16.4+)
- Check if user denied permission previously (need to reset in browser settings)

### Settings not saving:
- Check Firebase console
- Verify user is authenticated
- Check network tab for failed requests
- Check console for errors

---

## Advanced Features (Future Enhancements)

### 1. Smart Timing
```typescript
// Suggest best workout time based on user's history
const suggestWorkoutTime = async (userId: string) => {
  // Analyze past workouts
  // Find most common time
  // Return suggestion
};
```

### 2. Rest Day Detection
```typescript
// Don't remind on rest days
const isRestDay = (config: ReminderConfig) => {
  // Check if today should be a rest day based on schedule
  return false; // or true
};
```

### 3. Weather-Based Reminders
```typescript
// "Great weather for an outdoor workout!"
```

### 4. Streak-Based Encouragement
```typescript
// "You're on a 5-day streak! Don't break it now!"
```

---

## Performance Considerations

- In-app banner uses localStorage (fast, no network calls)
- Firebase checks are cached (5-minute intervals)
- Service worker handles notifications (low battery impact)
- Banner auto-dismisses (doesn't stay in memory)

---

## Summary

You now have a complete workout reminder system with:

✅ **Visual in-app reminders** (banner at top)
✅ **Browser push notifications** (system-level)
✅ **User-configurable settings** (time, days, on/off)
✅ **Smart detection** (knows if workout is done)
✅ **Multiple notification types** (reminders, streaks, PRs)
✅ **Service worker integration** (works in background)

All components are ready to use. The banner is already active. Just add the settings component to your profile page and users can start customizing their reminders!
