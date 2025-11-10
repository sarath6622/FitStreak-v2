/**
 * Notification Service
 * Handles workout reminders and push notifications
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if browser supports notifications
   */
  isSupported(): boolean {
    return "Notification" in window && "serviceWorker" in navigator;
  }

  /**
   * Get current notification permission
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn("Notifications not supported");
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Show a notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (this.getPermission() !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    try {
      // Try to use service worker notification (better for PWA)
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || "/icon-192x192.png",
        badge: options.badge || "/icon-192x192.png",
        tag: options.tag || "fitstreak-notification",
        data: options.data || {},
        requireInteraction: options.requireInteraction || false,
        vibrate: [200, 100, 200],
        actions: options.actions || [],
      });
    } catch (error) {
      // Fallback to regular notification
      console.warn("Service worker notification failed, using fallback:", error);

      new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icon-192x192.png",
        badge: options.badge || "/icon-192x192.png",
        tag: options.tag || "fitstreak-notification",
        data: options.data || {},
        requireInteraction: options.requireInteraction || false,
        vibrate: [200, 100, 200],
      });
    }
  }

  /**
   * Show workout reminder notification
   */
  async showWorkoutReminder(muscleGroup?: string): Promise<void> {
    const title = "Time to Workout! 💪";
    const body = muscleGroup
      ? `Your ${muscleGroup} workout is waiting. Let's crush it!`
      : "Your scheduled workout is waiting. Let's get moving!";

    await this.showNotification({
      title,
      body,
      tag: "workout-reminder",
      requireInteraction: true,
      actions: [
        { action: "start", title: "Start Workout" },
        { action: "dismiss", title: "Maybe Later" },
      ],
      data: {
        type: "workout-reminder",
        muscleGroup,
        url: "/workouts/todays-workouts",
      },
    });
  }

  /**
   * Schedule a notification for later
   */
  scheduleNotification(options: NotificationOptions, delayMs: number): void {
    setTimeout(() => {
      this.showNotification(options);
    }, delayMs);
  }

  /**
   * Check if user has completed workout today and show reminder if not
   */
  async checkAndRemindWorkout(
    hasCompletedToday: boolean,
    plannedMuscleGroup?: string
  ): Promise<void> {
    if (hasCompletedToday) return;
    if (this.getPermission() !== "granted") return;

    const now = new Date();
    const hour = now.getHours();

    // Only remind during reasonable hours (6 AM - 10 PM)
    if (hour < 6 || hour > 22) return;

    await this.showWorkoutReminder(plannedMuscleGroup);
  }

  /**
   * Show streak milestone notification
   */
  async showStreakMilestone(currentStreak: number): Promise<void> {
    const milestones = [7, 14, 30, 50, 100, 365];

    if (!milestones.includes(currentStreak)) return;

    await this.showNotification({
      title: `🔥 ${currentStreak} Day Streak!`,
      body: `Incredible! You've maintained a ${currentStreak}-day workout streak. Keep it up!`,
      tag: "streak-milestone",
      requireInteraction: true,
      data: {
        type: "streak-milestone",
        streak: currentStreak,
      },
    });
  }

  /**
   * Show PR (Personal Record) notification
   */
  async showPRNotification(exerciseName: string, improvement: string): Promise<void> {
    await this.showNotification({
      title: "🎉 New Personal Record!",
      body: `You just hit a PR on ${exerciseName}! ${improvement}`,
      tag: "pr-notification",
      data: {
        type: "pr",
        exercise: exerciseName,
      },
    });
  }
}

export const notificationService = NotificationService.getInstance();
