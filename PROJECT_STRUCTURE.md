# FitStreak-v2 Project Documentation

> Comprehensive project structure and architecture documentation for FitStreak-v2 - A Progressive Web Application for fitness tracking.

**Last Updated:** 2025-11-04
**Next.js Version:** 15.5.2
**React Version:** 19.1.0

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Key Configuration Files](#key-configuration-files)
5. [Core Features](#core-features)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Routing Structure](#routing-structure)
9. [API & Backend Integration](#api--backend-integration)
10. [Database Schema](#database-schema)
11. [Build & Deployment](#build--deployment)
12. [Development Guidelines](#development-guidelines)

---

## Project Overview

**FitStreak-v2** is a mobile-first Progressive Web Application designed for comprehensive fitness tracking. It combines AI-powered workout planning, nutrition tracking, social features, and streak-based motivation into a seamless offline-capable experience.

### Key Capabilities
- AI-generated workout plans using Groq's LLM (llama-3.1-8b-instant)
- Real-time workout logging with progressive overload tracking
- Comprehensive nutrition tracking with AI-enhanced food database
- Social features for sharing progress with friends
- Offline-first architecture with service workers
- Push notifications via Firebase Cloud Messaging

---

## Tech Stack

### Core Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5** - Type-safe development

### UI & Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **shadcn/ui (New York style)** - Component library
- **Radix UI** - Accessible component primitives
- **Framer Motion 12.23.12** - Animation library
- **Lucide React** - Icon library

### Backend & Database
- **Firebase Authentication** - Google OAuth
- **Firebase Firestore** - NoSQL real-time database
- **Firebase Cloud Messaging** - Push notifications
- **Next.js API Routes** - Serverless functions

### AI & External APIs
- **Groq SDK (llama-3.1-8b-instant)** - AI workout recommendations
- **OpenFoodFacts API** - Food nutrition database
- **OpenAI SDK** - (Configured but not actively used)

### Forms & Utilities
- **react-hook-form** - Form management
- **date-fns** - Date manipulation
- **recharts** - Data visualization
- **uuid** - Unique ID generation

### PWA & Mobile
- **next-pwa** - Progressive Web App support
- **react-mobile-picker** - Mobile-optimized pickers
- **react-swipeable** - Touch gestures
- **lottie-react** - Lottie animations

---

## Directory Structure

```
FitStreak-v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes (serverless functions)
│   │   │   ├── recommend/            # AI workout recommendations
│   │   │   ├── save-workout/         # Save workout plans
│   │   │   ├── add-exercise/         # Add exercises to plan
│   │   │   ├── edit-exercise/        # Edit exercise details
│   │   │   ├── delete-exercise/      # Remove exercises
│   │   │   ├── analyze-muscles/      # Muscle group analysis
│   │   │   ├── analyze-exercise-progress/ # Progress tracking
│   │   │   └── food/                 # Nutrition API endpoints
│   │   │       ├── search/           # Search foods
│   │   │       ├── get-meals/        # Retrieve meals
│   │   │       ├── save-meal/        # Log meals
│   │   │       ├── get-water/        # Water intake
│   │   │       ├── save-water/       # Log water
│   │   │       └── recent-foods/     # Recent foods list
│   │   ├── workouts/                 # Workout pages
│   │   │   ├── page.tsx              # Workout planning page
│   │   │   ├── todays-workouts/      # Today's workout execution
│   │   │   └── history/              # Historical workout data
│   │   ├── diet/                     # Nutrition tracking page
│   │   ├── profile/                  # User profile management
│   │   ├── friends/                  # Social features
│   │   │   └── [friend]/             # Dynamic friend profiles
│   │   ├── setup-profile/            # Onboarding flow
│   │   ├── offline/                  # PWA offline fallback
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home/Dashboard
│   │   ├── globals.css               # Global styles & theme variables
│   │   └── theme.css                 # Additional theme customization
│   │
│   ├── components/                   # React components (81+ files)
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── command.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx            # Toast notifications
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── workout/                  # Workout-specific components
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── WorkoutLogger.tsx     # Main logging UI (12,959 lines)
│   │   │   ├── WorkoutGroup.tsx
│   │   │   ├── WorkoutModal.tsx
│   │   │   ├── WorkoutPreviewModal.tsx
│   │   │   ├── WorkoutSummary.tsx
│   │   │   ├── WorkoutCompletionMeter.tsx
│   │   │   ├── TodaysWorkouts.tsx
│   │   │   ├── ExerciseSkeleton.tsx
│   │   │   └── WorkoutPage.tsx
│   │   │
│   │   ├── diet/                     # Diet/nutrition components
│   │   │   ├── MealModal.tsx
│   │   │   ├── MealCard.tsx
│   │   │   ├── TodaysLog.tsx
│   │   │   ├── WaterLogModal.tsx
│   │   │   ├── WaterRing.tsx
│   │   │   ├── CaloriesRing.tsx
│   │   │   ├── Macros.tsx
│   │   │   ├── DietSkeleton.tsx
│   │   │   └── modal/                # Nested modal components
│   │   │
│   │   ├── history/                  # Workout history components
│   │   │   └── PRSection.tsx         # Personal records
│   │   │
│   │   ├── friends/                  # Social features components
│   │   │
│   │   ├── Profile/                  # Profile management components
│   │   │
│   │   ├── SuggestionSection/        # AI workout suggestions
│   │   │   ├── index.tsx             # Main interface (7,619 lines)
│   │   │   ├── MuscleGroupSelector.tsx
│   │   │   ├── DurationSelector.tsx
│   │   │   ├── GenerateButton.tsx
│   │   │   └── WorkoutPlanDisplay.tsx
│   │   │
│   │   ├── WorkoutLogger/            # Exercise logging UI
│   │   │
│   │   ├── Auth.tsx                  # Authentication UI (5,590 lines)
│   │   ├── AuthenticatedLayout.tsx   # Protected route wrapper
│   │   ├── Header.tsx                # Top header component
│   │   ├── Navbar.tsx                # Bottom navigation bar
│   │   ├── PageTransition.tsx        # Page transition animations
│   │   ├── ServiceWorkerRegistrar.tsx # PWA registration
│   │   ├── StatCard.tsx              # Reusable stat display
│   │   ├── StreakTracker.tsx         # Streak visualization
│   │   ├── WorkoutCalendar.tsx       # Calendar component
│   │   ├── ExerciseList.tsx          # Exercise list
│   │   ├── EditExerciseModal.tsx     # Edit exercise modal
│   │   ├── SwipeableCard.tsx         # Swipeable UI element
│   │   └── AILoader.tsx              # AI loading animation
│   │
│   ├── lib/                          # Utility functions
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── services/                     # Business logic
│   │   ├── workoutService.ts         # Workout data operations
│   │   ├── streakService.ts          # Streak calculation
│   │   └── firebaseAdmin.ts          # Server-side Firebase
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── useFCM.ts                 # Firebase Cloud Messaging
│   │
│   ├── types/                        # TypeScript definitions
│   │   └── index.ts                  # Type exports
│   │
│   ├── data/                         # Static data
│   │   ├── exercises.ts              # Exercise database (739 lines, 200+ exercises)
│   │   └── workoutHistory.ts         # Historical workout data
│   │
│   ├── assets/                       # Static assets
│   │
│   └── firebase.ts                   # Firebase client configuration
│
├── public/                           # Static files
│   ├── icons/                        # App icons (iOS & Android)
│   │   ├── icon-48x48.png
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker (generated)
│   ├── workbox-*.js                  # Workbox runtime (generated)
│   ├── fallback-*.js                 # Offline fallback (generated)
│   └── firebase-messaging-sw.js      # FCM service worker
│
├── .next/                            # Next.js build output (gitignored)
├── node_modules/                     # Dependencies (gitignored)
│
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.mjs               # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── eslint.config.mjs                 # ESLint configuration
├── components.json                   # shadcn/ui configuration
├── package.json                      # Dependencies & scripts
├── package-lock.json                 # Dependency lock file
├── .env.local                        # Environment variables (gitignored)
├── .gitignore                        # Git ignore rules
└── README.md                         # Project README
```

---

## Key Configuration Files

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js Configuration (`next.config.ts`)
```typescript
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    fallback: {
      document: '/offline',
    },
  }),
};

export default nextConfig;
```

### shadcn/ui Configuration (`components.json`)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.mjs",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### PWA Manifest (`public/manifest.json`)
```json
{
  "name": "FitStreak",
  "short_name": "FitStreak",
  "description": "Track your fitness journey with FitStreak",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    // 48px to 512px icons for Android & iOS
  ]
}
```

### Environment Variables (`.env.local`)
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# AI Service
GROQ_API_KEY=
```

---

## Core Features

### 1. Authentication & User Management
- **Provider:** Firebase Authentication with Google OAuth
- **Session Management:** Firebase Auth state persistence
- **Protected Routes:** `AuthenticatedLayout` wrapper component
- **User Flow:**
  1. User lands on home page
  2. If not authenticated, shows Auth component
  3. Google OAuth sign-in
  4. Profile setup (if first time)
  5. Redirect to dashboard

**Key Files:**
- [src/components/Auth.tsx](src/components/Auth.tsx) (5,590 lines)
- [src/firebase.ts](src/firebase.ts)
- [src/components/AuthenticatedLayout.tsx](src/components/AuthenticatedLayout.tsx)

### 2. AI-Powered Workout Suggestions
- **AI Model:** Groq's llama-3.1-8b-instant
- **Features:**
  - Muscle group targeting
  - Duration-based planning (15-120 minutes)
  - Progressive overload recommendations
  - Exercise variations
  - Set/rep/rest suggestions
- **User Flow:**
  1. Select muscle groups (8 options)
  2. Choose workout duration
  3. AI generates personalized plan
  4. Preview and customize
  5. Save to today's workout

**Key Files:**
- [src/components/SuggestionSection/index.tsx](src/components/SuggestionSection/index.tsx) (7,619 lines)
- [src/app/api/recommend/route.ts](src/app/api/recommend/route.ts)
- [src/data/exercises.ts](src/data/exercises.ts) (200+ exercises)

### 3. Workout Logging & Tracking
- **Real-time Logging:** Log sets, reps, weight during workout
- **Progressive Overload:** Shows previous workout stats
- **Features:**
  - Completion meter
  - Rest timer
  - Exercise editing/deletion
  - Add exercises mid-workout
  - Workout summary on completion
- **Data Storage:** Firestore real-time sync

**Key Files:**
- [src/components/workout/WorkoutLogger.tsx](src/components/workout/WorkoutLogger.tsx) (12,959 lines)
- [src/components/workout/TodaysWorkouts.tsx](src/components/workout/TodaysWorkouts.tsx)
- [src/services/workoutService.ts](src/services/workoutService.ts)

### 4. Streak Tracking
- **Streak Types:**
  - Daily consecutive workouts
  - Weekly frequency-based (configurable)
  - Longest streak record
- **Visual Indicators:**
  - Flame icons
  - Current streak counter
  - Progress bars

**Key Files:**
- [src/components/StreakTracker.tsx](src/components/StreakTracker.tsx)
- [src/services/streakService.ts](src/services/streakService.ts)

### 5. Workout History & Personal Records
- **Features:**
  - Exercise-specific history
  - Personal records (PRs) tracking
  - Max weight, reps, volume
  - Historical data visualization
- **Data Access:** Per-exercise lookup via exercise index

**Key Files:**
- [src/components/history/PRSection.tsx](src/components/history/PRSection.tsx)
- [src/services/workoutService.ts](src/services/workoutService.ts)

### 6. Nutrition Tracking
- **Food Database:** OpenFoodFacts API + AI enrichment
- **Features:**
  - Meal logging (Breakfast, Lunch, Dinner, Snacks)
  - Water intake tracking
  - Calorie and macro tracking
    - Protein, Carbs, Fat
    - Fiber, Sugars
  - Visual progress rings
  - Recent foods list
- **AI Enhancement:** Groq AI fills missing nutrition data

**Key Files:**
- [src/components/diet/](src/components/diet/)
- [src/app/api/food/](src/app/api/food/)

### 7. Calendar & Progress Visualization
- **Calendar View:** Monthly workout frequency
- **Data Visualization:**
  - Recharts for progress graphs
  - Progress rings for macros/water
  - Completion meters

**Key Files:**
- [src/components/WorkoutCalendar.tsx](src/components/WorkoutCalendar.tsx)

### 8. Social Features
- **Features:**
  - Friends list
  - View friend profiles
  - Share workout progress (planned)

**Key Files:**
- [src/components/friends/](src/components/friends/)
- [src/app/friends/](src/app/friends/)

### 9. Progressive Web App (PWA)
- **Offline Support:** Service workers cache resources
- **Install Prompts:** iOS and Android
- **Background Sync:** Queue actions when offline
- **Push Notifications:** Firebase Cloud Messaging

**Key Files:**
- [public/sw.js](public/sw.js) (generated)
- [public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)
- [src/components/ServiceWorkerRegistrar.tsx](src/components/ServiceWorkerRegistrar.tsx)

---

## Component Architecture

### Design Patterns

#### 1. Client vs Server Components
```typescript
// Client Component (most components)
"use client";
import { useState } from 'react';

export default function WorkoutLogger() {
  const [sets, setSets] = useState([]);
  // ...
}

// Server Component (API routes, data fetching)
export async function GET(request: Request) {
  const data = await fetchFromFirestore();
  return Response.json(data);
}
```

#### 2. Compound Components
```typescript
// Example: Modal with sub-components
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogDescription>Content</DialogDescription>
  </DialogContent>
</Dialog>
```

#### 3. Composition Pattern
```typescript
// Layout wraps page content
<AuthenticatedLayout>
  <Header />
  <main>{children}</main>
  <Navbar />
</AuthenticatedLayout>
```

### Component Categories

#### UI Components (`/src/components/ui/`)
Reusable, unstyled, accessible components from shadcn/ui:
- **Button** - Clickable elements with variants
- **Card** - Content containers
- **Dialog** - Modal dialogs
- **Input** - Form inputs
- **Select** - Dropdown selects
- **Progress** - Progress bars
- **Skeleton** - Loading states
- **Sonner** - Toast notifications

#### Feature Components
Large, feature-specific components with business logic:
- **WorkoutLogger** (12,959 lines) - Complete workout logging system
- **SuggestionSection** (7,619 lines) - AI workout generation
- **Auth** (5,590 lines) - Authentication flows

#### Layout Components
Structure the app's UI:
- **AuthenticatedLayout** - Protected route wrapper
- **Header** - Top navigation
- **Navbar** - Bottom tab navigation (mobile)
- **PageTransition** - Animated page transitions

#### Shared Components
Reused across multiple features:
- **StreakTracker** - Workout streaks
- **WorkoutCalendar** - Calendar visualization
- **StatCard** - Stat display cards
- **LoadingSpinner** - Loading indicators

---

## State Management

### Strategy: Local State + Firebase Real-time

FitStreak-v2 does **not** use global state management libraries (Redux, Zustand, Context API).

#### Local Component State
```typescript
// useState for component-level state
const [workouts, setWorkouts] = useState([]);
const [loading, setLoading] = useState(true);

// useEffect for data fetching
useEffect(() => {
  fetchWorkouts();
}, []);
```

#### Firebase Real-time Listeners
```typescript
// onSnapshot for real-time updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "users", userId, "workouts"),
    (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setWorkouts(data);
    }
  );
  return unsubscribe;
}, [userId]);
```

#### Authentication State
```typescript
// Firebase Auth state listener
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });
  return unsubscribe;
}, []);
```

#### Form State
```typescript
// react-hook-form for complex forms
import { useForm } from 'react-hook-form';

const { register, handleSubmit } = useForm();
const onSubmit = (data) => {
  // Handle form submission
};
```

#### Optimistic UI Updates
```typescript
// Update local state immediately
setSets(prev => [...prev, newSet]);

// Then sync to Firebase
await addDoc(collection(db, "sets"), newSet);
```

---

## Routing Structure

### Next.js App Router (File-based)

#### Public Routes
- `/` - Home/Dashboard (requires auth)

#### Protected Routes
- `/workouts` - Workout planning page
- `/workouts/todays-workouts` - Today's workout execution
- `/workouts/history` - Historical data
- `/diet` - Nutrition tracking
- `/profile` - User profile
- `/setup-profile` - Onboarding
- `/friends` - Social features
- `/friends/[friend]` - Dynamic friend profile
- `/offline` - PWA offline fallback

#### API Routes (`/api/`)
**Workout APIs:**
- `POST /api/recommend` - AI workout recommendations
- `POST /api/save-workout` - Save workout plan
- `POST /api/add-exercise` - Add exercise
- `PUT /api/edit-exercise` - Edit exercise
- `DELETE /api/delete-exercise` - Remove exercise
- `POST /api/analyze-muscles` - Muscle analysis
- `POST /api/analyze-exercise-progress` - Progress tracking

**Nutrition APIs:**
- `GET /api/food/search?q={query}` - Search foods
- `GET /api/food/get-meals` - Retrieve meals
- `POST /api/food/save-meal` - Log meal
- `GET /api/food/get-water` - Water intake
- `POST /api/food/save-water` - Log water
- `GET /api/food/recent-foods` - Recent foods

### Route Protection

```typescript
// AuthenticatedLayout.tsx
"use client";

export default function AuthenticatedLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Auth />;

  return children;
}
```

### Navigation Implementation

```typescript
// Bottom tab navigation (mobile)
<nav className="fixed bottom-0 left-0 right-0">
  <Link href="/">Home</Link>
  <Link href="/workouts">Workouts</Link>
  <Link href="/diet">Diet</Link>
  <Link href="/friends">Friends</Link>
  <Link href="/profile">Profile</Link>
</nav>
```

---

## API & Backend Integration

### Architecture: Serverless + Firebase

#### Serverless Functions (Next.js API Routes)
Located in `/src/app/api/`, each folder contains a `route.ts` file:

```typescript
// Example: /api/recommend/route.ts
export async function POST(request: Request) {
  const { userId, muscleGroups, duration } = await request.json();

  // Call Groq AI
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  return Response.json({ workout: completion.choices[0].message.content });
}
```

#### Firebase Services

**1. Firestore Database**
```typescript
// Client-side
import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Add document
await addDoc(collection(db, "users", userId, "workouts"), workoutData);

// Query documents
const q = query(collection(db, "workouts"), where("date", "==", today));
const snapshot = await getDocs(q);
```

**2. Firebase Authentication**
```typescript
// Google OAuth sign-in
import { auth, googleProvider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';

const result = await signInWithPopup(auth, googleProvider);
const user = result.user;
```

**3. Firebase Cloud Messaging**
```typescript
// Request notification permission
import { messaging } from '@/firebase';
import { getToken } from 'firebase/messaging';

const token = await getToken(messaging, {
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
});
```

#### AI Services

**Groq AI (Workout Recommendations)**
```typescript
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: "You are a fitness coach...",
    },
    {
      role: "user",
      content: `Create a ${duration} minute workout for ${muscleGroups.join(", ")}`,
    },
  ],
  temperature: 0.7,
  response_format: { type: "json_object" },
});
```

**OpenFoodFacts API (Nutrition Data)**
```typescript
import { findProducts } from '@openfoodfacts/openfoodfacts-nodejs';

const results = await findProducts({
  query: searchTerm,
  fields: ['product_name', 'nutriments', 'image_url'],
  page_size: 10,
});
```

#### Data Fetching Pattern

```typescript
// Client-side API call
const response = await fetch('/api/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, muscleGroups, duration }),
});

if (!response.ok) {
  throw new Error('Failed to generate workout');
}

const data = await response.json();
```

#### Error Handling

```typescript
// API Route error handling
try {
  const result = await performOperation();
  return Response.json({ success: true, data: result });
} catch (error) {
  console.error('Error:', error);
  return Response.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}

// Client-side error handling
try {
  await saveWorkout(data);
  toast.success('Workout saved!');
} catch (error) {
  toast.error('Failed to save workout');
  console.error(error);
}
```

---

## Database Schema

### Firestore Collections Structure

```
/users/{userId}
  - email: string
  - displayName: string
  - photoURL: string
  - createdAt: timestamp
  - settings: object

  /workouts/{date}  // YYYY-MM-DD format
    - date: string
    - completed: boolean
    - duration: number
    - muscleGroups: string[]
    - totalVolume: number

    /plans/{planId}
      - exerciseId: string
      - exerciseName: string
      - muscleGroup: string
      - sets: number
      - reps: number
      - weight: number
      - rest: number
      - notes: string
      - completed: boolean
      - timestamp: timestamp

  /exerciseIndex/{exerciseId}
    - lastWorkoutDate: string
    - bestWeight: number
    - bestReps: number
    - bestVolume: number
    - totalSessions: number

  /meals/{date}/{mealType}/{foodId}
    - foodName: string
    - mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
    - calories: number
    - protein: number
    - carbs: number
    - fat: number
    - fiber: number
    - sugars: number
    - quantity: number
    - unit: string
    - timestamp: timestamp

  /water/{date}
    - amount: number  // in ml
    - goal: number
    - timestamp: timestamp

  /streaks
    - current: number
    - longest: number
    - lastWorkoutDate: string
    - weeklyFrequency: number

/exercises/{exerciseId}  // Global exercise database
  - name: string
  - muscleGroup: string
  - equipment: string
  - difficulty: string
  - instructions: string[]
  - videoUrl: string (optional)
```

### Indexing Strategy

**Composite Indexes** (auto-generated by Firestore):
- `users/{userId}/workouts` - ORDER BY date DESC
- `users/{userId}/meals` - WHERE date == X, ORDER BY timestamp
- `users/{userId}/exerciseIndex` - WHERE exerciseId == X

**Query Examples:**

```typescript
// Get last 7 days of workouts
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return format(date, 'yyyy-MM-dd');
});

const workouts = await Promise.all(
  last7Days.map(async (date) => {
    const docRef = doc(db, "users", userId, "workouts", date);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { date, ...docSnap.data() } : null;
  })
);

// Get today's meals
const mealsSnapshot = await getDocs(
  collection(db, "users", userId, "meals", today)
);

// Get exercise history
const exerciseIndexDoc = await getDoc(
  doc(db, "users", userId, "exerciseIndex", exerciseId)
);
```

---

## Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Run development server (Turbopack)
npm run dev

# Open browser
# http://localhost:3000
```

**Development Features:**
- Hot module replacement (HMR)
- PWA disabled in development
- Fast refresh
- TypeScript type checking
- ESLint (optional)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Build Output:**
```
.next/
├── static/           # Static assets with content hashes
├── server/           # Server-side code
└── cache/            # Build cache
```

**Build Optimizations:**
- Code splitting (automatic)
- Tree shaking (removes unused code)
- Minification (JavaScript & CSS)
- Image optimization (automatic)
- Font optimization (next/font)
- React 19 compiler optimizations

### Deployment (Vercel)

**Recommended Platform:** Vercel (Next.js creators)

**Automatic Deployment:**
1. Connect GitHub repository to Vercel
2. Push to `main` branch
3. Vercel builds and deploys automatically

**Environment Variables:**
Set in Vercel dashboard:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
GROQ_API_KEY
```

**PWA Files Generated:**
- `/public/sw.js` - Service worker
- `/public/workbox-*.js` - Workbox runtime
- `/public/fallback-*.js` - Offline fallback

**Vercel Configuration:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 18.x or higher

### Performance Considerations

**Lighthouse Scores (Target):**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

**Optimizations Implemented:**
- Image lazy loading
- Route-based code splitting
- Dynamic imports for large components
- Service worker caching
- Font preloading
- CSS minification

---

## Development Guidelines

### Code Style

**TypeScript:**
- Use TypeScript for all new files
- Define types for props and state
- Avoid `any` type
- Use interfaces for object shapes

**React:**
- Functional components only
- Use hooks (useState, useEffect, etc.)
- Extract custom hooks for reusable logic
- Client components use `"use client"` directive

**Naming Conventions:**
- Components: PascalCase (e.g., `WorkoutLogger.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case (Tailwind)

**File Structure:**
```typescript
// Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Types
interface WorkoutProps {
  userId: string;
  date: string;
}

// Component
export default function Workout({ userId, date }: WorkoutProps) {
  // Hooks
  const [data, setData] = useState([]);

  // Effects
  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
```

### Git Workflow

**Branch Strategy:**
- `main` - Production branch
- Feature branches: `feature/workout-logging`
- Bug fixes: `fix/streak-calculation`

**Commit Messages:**
```
added fix for sync workout
added fix for new workout with data
fixed streak data
```

**Current Status:**
- Clean working directory
- Recent commits focus on workout sync fixes

### Adding New Features

**1. Create Component:**
```bash
# Create new component file
touch src/components/MyNewFeature.tsx
```

**2. Add Types:**
```typescript
// src/types/index.ts
export interface MyFeatureData {
  id: string;
  name: string;
}
```

**3. Create API Route (if needed):**
```bash
mkdir -p src/app/api/my-feature
touch src/app/api/my-feature/route.ts
```

**4. Add Page (if needed):**
```bash
mkdir -p src/app/my-feature
touch src/app/my-feature/page.tsx
```

**5. Update Navigation:**
```typescript
// Add link to Navbar.tsx
<Link href="/my-feature">My Feature</Link>
```

### Testing Recommendations

**Unit Tests:** (Not currently implemented)
- Test utility functions in `/lib`
- Test individual components
- Use Jest + React Testing Library

**Integration Tests:**
- Test API routes
- Test data flow from API to UI
- Use Next.js testing utilities

**E2E Tests:**
- Test critical user flows
- Use Playwright or Cypress
- Test: Login → Create Workout → Log Exercise → Complete

### Performance Tips

**1. Optimize Images:**
```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // for above-the-fold images
/>
```

**2. Dynamic Imports:**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

**3. Memoization:**
```typescript
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => computeExpensive(data), [data]);
const memoizedCallback = useCallback(() => doSomething(), []);
```

**4. Debounce Input:**
```typescript
import { useState, useEffect } from 'react';

const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);
  return () => clearTimeout(timer);
}, [search]);
```

### Security Best Practices

**1. Environment Variables:**
- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Server-only variables without prefix

**2. Firebase Security Rules:**
```javascript
// Firestore rules example
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**3. API Route Protection:**
```typescript
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    // Proceed with authenticated request
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 403 });
  }
}
```

**4. Input Validation:**
```typescript
// Validate user input
if (!userId || typeof userId !== 'string') {
  return Response.json({ error: 'Invalid userId' }, { status: 400 });
}

// Sanitize data
const sanitizedInput = input.trim().slice(0, 100);
```

### Common Tasks

**Add shadcn/ui Component:**
```bash
npx shadcn-ui@latest add button
```

**Update Dependencies:**
```bash
npm update
```

**Check TypeScript Errors:**
```bash
npx tsc --noEmit
```

**Lint Code:**
```bash
npm run lint
```

**Format Code (if Prettier installed):**
```bash
npx prettier --write .
```

---

## Project Health

### Strengths
- Modern tech stack (Next.js 15, React 19)
- Excellent mobile UX with PWA support
- Comprehensive feature set
- AI-powered recommendations
- Real-time data sync
- Offline-first architecture

### Areas for Improvement
- **Testing:** No automated tests
- **Error Boundaries:** Limited error handling UI
- **Performance Monitoring:** No APM (Sentry, DataDog)
- **State Management:** Consider Zustand for complex state
- **Documentation:** Limited inline code documentation
- **Type Safety:** Some `any` types in codebase

### Future Enhancements
- Social features expansion (workout sharing, leaderboards)
- Video exercise demonstrations
- Barcode scanning for food logging
- Wearable device integration (Apple Health, Google Fit)
- Advanced analytics and insights
- Personal trainer matching
- Meal planning with recipes
- Supplement tracking

---

## Quick Reference

### Useful Commands
```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint

# Add shadcn component
npx shadcn-ui@latest add [component]

# Check types
npx tsc --noEmit
```

### Key File Paths
- **Main Entry:** [src/app/layout.tsx](src/app/layout.tsx)
- **Home Page:** [src/app/page.tsx](src/app/page.tsx)
- **Firebase Config:** [src/firebase.ts](src/firebase.ts)
- **Exercise Database:** [src/data/exercises.ts](src/data/exercises.ts)
- **Workout Logger:** [src/components/workout/WorkoutLogger.tsx](src/components/workout/WorkoutLogger.tsx)
- **AI Suggestions:** [src/components/SuggestionSection/index.tsx](src/components/SuggestionSection/index.tsx)

### Important Links
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Firebase Docs:** https://firebase.google.com/docs
- **Groq API:** https://groq.com
- **Vercel:** https://vercel.com

---

## Conclusion

FitStreak-v2 is a well-architected, feature-rich fitness tracking application built with modern web technologies. The project demonstrates best practices in PWA development, real-time data synchronization, and AI integration. With a solid foundation and room for growth, it's positioned to become a comprehensive fitness platform.

For questions or contributions, refer to the codebase documentation and commit history for context on architectural decisions and implementation details.

---

**Last Updated:** 2025-11-04
**Maintained By:** FitStreak Development Team
**License:** [Add license information]
