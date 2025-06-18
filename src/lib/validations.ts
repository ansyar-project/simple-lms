import { z } from "zod";

// Course validation schemas
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative").optional(),
  thumbnail: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string().min(1, "Course ID is required"),
});

export const courseStatusSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

// Module validation schemas
export const createModuleSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  order: z.number().int().min(0, "Order must be non-negative"),
});

export const updateModuleSchema = createModuleSchema.partial().extend({
  id: z.string().min(1, "Module ID is required"),
});

// Lesson validation schemas
export const createLessonSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z.string().optional(),
  contentType: z.enum(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"]),
  videoUrl: z.string().url("Invalid video URL").optional(),
  duration: z.number().int().min(0, "Duration must be non-negative").optional(),
  order: z.number().int().min(0, "Order must be non-negative"),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  id: z.string().min(1, "Lesson ID is required"),
});

// Quiz validation schemas
export const createQuizSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  instructions: z
    .string()
    .max(2000, "Instructions must be less than 2000 characters")
    .optional(),
  timeLimit: z
    .number()
    .int()
    .min(1, "Time limit must be at least 1 minute")
    .max(300, "Time limit must be less than 300 minutes")
    .optional(),
  attemptsAllowed: z
    .number()
    .int()
    .min(1, "At least 1 attempt must be allowed")
    .max(10, "Maximum 10 attempts allowed")
    .default(1),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  passingScore: z
    .number()
    .min(0, "Passing score must be at least 0%")
    .max(100, "Passing score must be at most 100%")
    .optional(),
});

export const updateQuizSchema = createQuizSchema.partial().extend({
  id: z.string().min(1, "Quiz ID is required"),
});

export const createQuestionSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "FILL_IN_BLANK",
    "ESSAY",
    "SHORT_ANSWER",
  ]),
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(2000, "Question must be less than 2000 characters"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required for multiple choice")
    .max(6, "Maximum 6 options allowed")
    .optional(),
  correctAnswer: z.union([
    z.string().min(1, "Correct answer is required"),
    z.array(z.string().min(1, "Correct answer cannot be empty")),
    z.boolean(),
  ]),
  explanation: z
    .string()
    .max(1000, "Explanation must be less than 1000 characters")
    .optional(),
  points: z
    .number()
    .int()
    .min(1, "Points must be at least 1")
    .max(100, "Points must be at most 100")
    .default(1),
  order: z.number().int().min(0, "Order must be non-negative"),
});

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  id: z.string().min(1, "Question ID is required"),
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  answers: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])),
  timeSpent: z.number().int().min(0, "Time spent must be non-negative"),
});

export const quizAttemptSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Reordering schemas
export const reorderModulesSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  moduleIds: z.array(z.string()).min(1, "At least one module is required"),
});

export const reorderLessonsSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  lessonIds: z.array(z.string()).min(1, "At least one lesson is required"),
});

// Validation for reordering questions
export const reorderQuestionsSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  questionIds: z.array(z.string().min(1, "Question ID is required")),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["thumbnail", "video", "document"]),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
});

// Search and filter schemas
export const courseSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "price"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

// Types derived from schemas
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseStatusInput = z.infer<typeof courseStatusSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;
export type CourseSearchInput = z.infer<typeof courseSearchSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
