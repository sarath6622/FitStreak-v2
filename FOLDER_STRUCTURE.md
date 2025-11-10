# FitStreak-v2 Folder Structure

## Overview
This project follows a **feature-based architecture** that organizes code by domain/feature rather than by technical role. This approach improves maintainability, scalability, and developer experience.

## New Structure

```
src/
├── app/                          # Next.js 15 App Router pages
│   ├── api/                      # API routes
│   ├── diet/                     # Diet tracking page
│   ├── friends/                  # Social features page
│   ├── offline/                  # Offline fallback page
│   ├── profile/                  # User profile page
│   ├── setup-profile/            # Profile setup page
│   ├── workouts/                 # Workout pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── features/                     # Feature-based modules
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Auth-specific components
│   │   └── utils/                # Auth utilities (signInWithGoogle)
│   │
│   ├── diet/                     # Diet tracking feature
│   │   ├── components/           # Diet components (CaloriesRing, MealCard, etc.)
│   │   └── utils/                # Diet utilities (openfoodfacts API)
│   │
│   ├── friends/                  # Social features
│   │   └── components/           # Friends components (Leaderboard, FriendsList, etc.)
│   │
│   ├── history/                  # Workout history feature
│   │   ├── components/           # History components (WorkoutTimeline, Filters, etc.)
│   │   └── utils/                # History utilities (historyUtils)
│   │
│   ├── profile/                  # User profile feature
│   │   └── components/           # Profile components (ProfileCard)
│   │
│   ├── workout/                  # Workout feature (largest feature)
│   │   ├── components/           # Workout components
│   │   │   ├── history/          # Workout history subcomponents
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── WorkoutGroup.tsx
│   │   │   ├── WorkoutModal.tsx
│   │   │   └── ... (25+ components)
│   │   ├── hooks/                # Workout-specific hooks
│   │   │   └── useWorkoutReminder.ts
│   │   └── utils/                # Workout utilities
│   │       ├── strength.ts
│   │       ├── exerciseCategories.ts
│   │       ├── recoveryTimes.ts
│   │       └── recommendationEngine.ts
│   │
│   └── shared/                   # Shared across features
│       ├── components/           # Shared components
│       │   ├── Navbar.tsx
│       │   ├── Header.tsx
│       │   ├── AuthenticatedLayout.tsx
│       │   ├── ErrorBoundary.tsx
│       │   └── ... (layout components)
│       ├── ui/                   # shadcn/ui components
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── dialog.tsx
│       │   └── ... (18 UI components)
│       ├── hooks/                # Shared hooks
│       │   └── useFCM.ts
│       ├── utils/                # Shared utilities
│       │   ├── utils.ts          # General utilities (cn helper)
│       │   ├── validations.ts    # Zod schemas
│       │   └── notificationService.ts
│       ├── services/             # Shared services
│       │   ├── workoutService.ts
│       │   ├── streakService.ts
│       │   ├── firebaseAdmin.ts
│       │   └── seedExercises.ts
│       ├── types/                # TypeScript types
│       │   ├── index.ts
│       │   └── UserProfile.ts
│       └── data/                 # Static data
│           └── exercises.json
│
├── config/                       # Configuration files
│   └── firebase.ts               # Firebase configuration
│
└── constants/                    # App-wide constants
    (empty - for future use)
```

## Key Principles

### 1. **Feature-Based Organization**
- Code is grouped by business domain (auth, workout, diet, etc.)
- Each feature is self-contained with its own components, hooks, and utilities
- Easier to understand, maintain, and scale individual features

### 2. **Shared Resources**
- Common code lives in `features/shared/`
- UI components from shadcn/ui in `features/shared/ui/`
- Shared services, hooks, and utilities are centralized

### 3. **Clear Import Paths**
All imports use absolute paths with the `@/` alias:
```typescript
// ✅ Good
import { Button } from '@/features/shared/ui/button';
import WorkoutGroup from '@/features/workout/components/WorkoutGroup';

// ❌ Bad
import { Button } from '../../../shared/ui/button';
import WorkoutGroup from './WorkoutGroup';
```

### 4. **Colocation**
- Related files are kept close together
- Feature-specific utilities stay within their feature folder
- Reduces cognitive load when working on a feature

## Migration Summary

### Files Removed (15 total)
- 5 outdated component files (ExerciseList, old WorkoutLogger, etc.)
- 3 mock data files (foods.json, workoutHistory.json, dumbbell.json)
- 1 empty file (inspectPlanStructure.ts)
- 5 unused SVG files (Next.js boilerplate)
- 1 commented-out component (WorkoutPage.tsx)

### Files Reorganized
- **62 components** moved to feature folders
- **7 utility files** redistributed to appropriate features
- **4 service files** moved to shared/services
- **2 hook files** moved to appropriate locations
- **2 type files** moved to shared/types

### Key Changes
1. `src/components/` → `src/features/[feature]/components/`
2. `src/lib/` → `src/features/shared/utils/` or feature-specific utils
3. `src/utils/` → `src/features/workout/utils/`
4. `src/hooks/` → `src/features/shared/hooks/` or feature-specific hooks
5. `src/services/` → `src/features/shared/services/`
6. `src/types/` → `src/features/shared/types/`
7. `src/firebase.ts` → `src/config/firebase.ts`

## Benefits

### Before
```
src/
├── components/       (23 files + 8 subdirectories - mixed concerns)
├── lib/              (7 utility files)
├── utils/            (2 utility files)
├── hooks/            (2 hooks)
├── services/         (4 services)
├── types/            (2 type files)
└── firebase.ts
```

### After
```
src/
├── features/
│   ├── auth/         (self-contained)
│   ├── workout/      (self-contained)
│   ├── diet/         (self-contained)
│   ├── friends/      (self-contained)
│   ├── history/      (self-contained)
│   ├── profile/      (self-contained)
│   └── shared/       (common resources)
└── config/
```

### Advantages
1. **Better Discoverability**: Find all workout-related code in `/workout/`
2. **Easier Refactoring**: Move or delete features without breaking unrelated code
3. **Faster Onboarding**: New developers can understand one feature at a time
4. **Scalability**: Add new features without cluttering existing structure
5. **Clear Dependencies**: Feature dependencies are explicit in imports
6. **Reduced Merge Conflicts**: Teams can work on different features independently

## Build Status
✅ **Build successful** - All imports updated and verified

## Next Steps (Optional Future Improvements)

1. **Add barrel exports**: Create index.ts files in each feature for cleaner imports
2. **Feature documentation**: Add README.md in each feature explaining its purpose
3. **Storybook integration**: Isolate and document components
4. **Feature flags**: Enable/disable features dynamically
5. **Lazy loading**: Code-split features for better performance

## ✅ All Issues Resolved

### Build Status
✅ **Production build successful**

### Files Verified
- exercises.json restored to `src/features/shared/data/`
- All import paths updated and working
- No build errors or warnings

### Final Structure Confirmed
```
src/features/shared/data/
└── exercises.json (150+ exercise definitions)
```

