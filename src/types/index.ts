import {
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  Category,
} from "@prisma/client";

export type { User, Course, Module, Lesson, Enrollment, Category };

export interface CourseWithDetails extends Course {
  instructor: User;
  category: Category;
  modules: ModuleWithLessons[];
  enrollments: Enrollment[];
  _count?: {
    enrollments: number;
    modules: number;
  };
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface EnrollmentWithCourse extends Enrollment {
  course: CourseWithDetails;
}

export interface UserProgress {
  courseId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: Date;
}

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLearningTime: number;
}

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}
