import {
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  Category,
  Quiz,
  Question,
  QuizAttempt,
  QuestionAnswer,
  QuestionType,
} from "@prisma/client";

export type {
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  Category,
  Quiz,
  Question,
  QuizAttempt,
  QuestionAnswer,
  QuestionType,
};

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

// Quiz System Types
export interface QuizWithQuestions extends Quiz {
  questions: Question[];
  lesson: Lesson;
}

export interface QuizAttemptWithAnswers extends QuizAttempt {
  answers: QuestionAnswer[];
  user: User;
  quiz: QuizWithQuestions;
}

export interface QuizAttemptWithBasicUser extends QuizAttempt {
  answers: QuestionAnswer[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  quiz: QuizWithQuestions;
}

export interface QuestionWithAnswers extends Question {
  answers: QuestionAnswer[];
}

export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  questionId: string;
  question: string;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
}

export interface QuizFormData {
  lessonId: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  passingScore?: number;
  questions: QuestionFormData[];
}

export interface QuestionFormData {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[] | boolean;
  explanation?: string;
  points: number;
}

export interface QuizTakingState {
  currentQuestionIndex: number;
  answers: Record<string, string | boolean | number>;
  timeRemaining?: number;
  isSubmitted: boolean;
  startTime: Date;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  passed: boolean;
  timeSpent: number;
  answers: QuestionAnswer[];
  feedback?: string;
}
