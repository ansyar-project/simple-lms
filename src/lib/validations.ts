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
export type CourseSearchInput = z.infer<typeof courseSearchSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
