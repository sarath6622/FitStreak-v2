import { z } from 'zod';

// Common schemas
export const firebaseUidSchema = z.string().min(1, 'User ID is required');

export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Invalid date format. Expected YYYY-MM-DD'
);

export const muscleGroupSchema = z.enum([
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Full Body',
]);

// Exercise schema
export const exerciseSchema = z.object({
  name: z.string().min(1).max(200),
  muscleGroup: z.string().min(1).max(100),
  subGroup: z.string().min(1).max(100).optional().nullable(),
  equipment: z.array(z.string()).optional().default([]),
  movementType: z.string().max(100).optional().nullable(),
  difficulty: z.string().max(50).optional().nullable(),
  secondaryMuscleGroups: z.array(z.string()).optional().default([]),
  sets: z.number().int().min(1).max(20).optional().nullable(),
  reps: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  exerciseId: z.string().optional().nullable(),
});

// API Schemas

// /api/save-workout
export const saveWorkoutSchema = z.object({
  userId: firebaseUidSchema,
  muscleGroups: z.array(z.string()).min(1, 'At least one muscle group required').max(8),
  workoutPlan: z.array(exerciseSchema).min(1, 'At least one exercise required').max(50),
});

// /api/recommend
export const recommendWorkoutSchema = z.object({
  userId: firebaseUidSchema,
  muscleGroups: z.array(z.string()).min(1).max(8).optional(),
  duration: z.union([z.string(), z.number()]).optional(),
});

// /api/add-exercise
export const addExerciseSchema = z.object({
  userId: firebaseUidSchema,
  dateStr: dateStringSchema.optional(),
  planId: z.string().min(1).max(100).default('current'),
  exercise: exerciseSchema,
});

// /api/edit-exercise
export const editExerciseSchema = z.object({
  userId: firebaseUidSchema,
  dateStr: dateStringSchema,
  planId: z.string().min(1).max(100),
  exerciseIndex: z.number().int().min(0).max(100),
  updatedExercise: exerciseSchema,
});

// /api/delete-exercise
export const deleteExerciseSchema = z.object({
  userId: firebaseUidSchema,
  dateStr: dateStringSchema,
  planId: z.string().min(1).max(100),
  exerciseId: z.string().min(1).max(200),
});

// /api/analyze-muscles
export const analyzeMusclesSchema = z.object({
  userId: firebaseUidSchema,
});

// /api/analyze-exercise-progress (query params)
export const analyzeExerciseProgressSchema = z.object({
  userId: firebaseUidSchema,
  muscleGroups: z.string().min(1).max(500), // comma-separated
});

// Food/Nutrition schemas
export const nutrientsSchema = z.object({
  calories: z.number().min(0).max(10000).optional().default(0),
  protein: z.number().min(0).max(1000).optional().default(0),
  carbs: z.number().min(0).max(1000).optional().default(0),
  fat: z.number().min(0).max(1000).optional().default(0),
  fiber: z.number().min(0).max(1000).optional().default(0),
  sugars: z.number().min(0).max(1000).optional().default(0),
});

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snacks']);

// /api/food/save-meal
export const saveMealSchema = z.object({
  userId: firebaseUidSchema,
  mealType: mealTypeSchema,
  foodId: z.string().max(200).optional(),
  foodName: z.string().min(1).max(300),
  quantity: z.number().min(0).max(10000),
  measure: z.string().min(1).max(100),
  servingWeight: z.number().min(0).max(100000).optional(),
  nutrients: nutrientsSchema,
});

// /api/food/get-meals (query params)
export const getMealsSchema = z.object({
  userId: firebaseUidSchema,
  date: dateStringSchema.optional(),
});

// /api/food/save-water
export const saveWaterSchema = z.object({
  userId: firebaseUidSchema,
  amount: z.number().min(0).max(20000), // ml
  date: dateStringSchema.optional(),
});

// /api/food/get-water (query params)
export const getWaterSchema = z.object({
  userId: firebaseUidSchema,
  date: dateStringSchema.optional(),
});

// /api/food/search (query params)
export const searchFoodSchema = z.object({
  q: z.string().min(1).max(200),
});

// /api/food/recent-foods (query params)
export const getRecentFoodsSchema = z.object({
  userId: firebaseUidSchema,
});

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Helper function to validate query params
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): { success: true; data: T } | { success: false; error: string } {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return validateRequestBody(schema, obj);
}
