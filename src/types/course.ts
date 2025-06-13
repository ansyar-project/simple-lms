import {
  Course,
  Module,
  Lesson,
  Category,
  User,
  Enrollment,
} from "@prisma/client";

// Extended types for course management
export interface CourseWithDetails extends Omit<Course, "price"> {
  price: number | null;
  instructor: Pick<User, "id" | "name" | "email">;
  category: Pick<Category, "id" | "name" | "slug">;
  modules: ModuleWithLessons[];
  enrollments?: EnrollmentWithUser[];
  _count?: {
    modules: number;
    enrollments: number;
  };
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
  _count?: {
    lessons: number;
  };
}

export interface LessonWithProgress extends Lesson {
  progress?: {
    completed: boolean;
    completedAt: Date | null;
  };
}

export interface EnrollmentWithUser extends Enrollment {
  user: Pick<User, "id" | "name" | "email">;
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Pick<Course, "id" | "title" | "thumbnail" | "slug">;
}

// Course statistics
export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

// Instructor dashboard data
export interface InstructorDashboard {
  stats: CourseStats;
  recentCourses: CourseWithDetails[];
  recentEnrollments: EnrollmentWithUser[];
}

// Course search and filtering
export interface CourseFilters {
  query?: string;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priceMin?: number;
  priceMax?: number;
  sortBy?: "title" | "createdAt" | "updatedAt" | "price";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedCourses {
  courses: CourseWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Form states
export interface CourseFormState {
  errors?: {
    title?: string[];
    description?: string[];
    categoryId?: string[];
    price?: string[];
    thumbnail?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

export interface ModuleFormState {
  errors?: {
    title?: string[];
    description?: string[];
    order?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

export interface LessonFormState {
  errors?: {
    title?: string[];
    content?: string[];
    contentType?: string[];
    videoUrl?: string[];
    duration?: string[];
    order?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

// File upload types
export interface FileUploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Course creation wizard steps
export type CourseWizardStep = "basic" | "content" | "pricing" | "publish";

export interface CourseWizardData {
  step: CourseWizardStep;
  basicInfo?: {
    title: string;
    description: string;
    categoryId: string;
    thumbnail?: string;
  };
  content?: {
    modules: Array<{
      title: string;
      description?: string;
      lessons: Array<{
        title: string;
        contentType: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";
        content?: string;
        videoUrl?: string;
        duration?: number;
      }>;
    }>;
  };
  pricing?: {
    price?: number;
    isFree: boolean;
  };
  settings?: {
    status: "DRAFT" | "PUBLISHED";
  };
}
