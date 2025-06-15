import {
  markLessonComplete,
  markLessonIncomplete,
  getLessonProgress,
  getModuleProgress,
} from "../progress";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireEnrollment } from "@/lib/authorization";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    lesson: {
      findUnique: jest.fn(),
    },
    lessonProgress: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    enrollment: {
      update: jest.fn(),
    },
    module: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/authorization", () => ({
  requireEnrollment: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock console.error
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Mock data
const mockStudentSession = {
  user: {
    id: "user123",
    role: "STUDENT" as const,
    email: "test@example.com",
  },
};

const mockLesson = {
  id: "lesson123",
  title: "Test Lesson",
  module: {
    courseId: "course123",
  },
};

const mockLessonProgress = {
  id: "progress123",
  userId: "user123",
  lessonId: "lesson123",
  completed: true,
  completedAt: new Date(),
};

const mockCourse = {
  id: "course123",
  title: "Test Course",
  modules: [
    {
      id: "module123",
      lessons: [{ id: "lesson123" }, { id: "lesson456" }],
    },
  ],
};

const mockModule = {
  id: "module123",
  title: "Test Module",
  lessons: [{ id: "lesson123" }, { id: "lesson456" }],
};

describe("Progress Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("markLessonComplete", () => {
    it("should successfully mark lesson as complete", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (requireEnrollment as jest.Mock).mockResolvedValue(true);
      (db.lessonProgress.upsert as jest.Mock).mockResolvedValue(
        mockLessonProgress
      );
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.lessonProgress.count as jest.Mock).mockResolvedValue(1);
      (db.enrollment.update as jest.Mock).mockResolvedValue({ progress: 50 });

      const result = await markLessonComplete("lesson123");

      expect(result).toEqual({
        success: true,
        lessonProgress: mockLessonProgress,
      });

      expect(db.lesson.findUnique).toHaveBeenCalledWith({
        where: { id: "lesson123" },
        include: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      });

      expect(requireEnrollment).toHaveBeenCalledWith("user123", "course123");

      expect(db.lessonProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_lessonId: {
            userId: "user123",
            lessonId: "lesson123",
          },
        },
        update: {
          completed: true,
          completedAt: expect.any(Date),
        },
        create: {
          userId: "user123",
          lessonId: "lesson123",
          completed: true,
          completedAt: expect.any(Date),
        },
      });

      expect(revalidatePath).toHaveBeenCalledWith("/courses/course123");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should redirect to login if user is not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(markLessonComplete("lesson123")).rejects.toThrow(
        "NEXT_REDIRECT"
      );
    });

    it("should throw error if lesson not found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(markLessonComplete("lesson123")).rejects.toThrow(
        "Lesson not found"
      );
    });

    it("should throw error if enrollment check fails", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (requireEnrollment as jest.Mock).mockRejectedValue(
        new Error("Not enrolled")
      );

      await expect(markLessonComplete("lesson123")).rejects.toThrow(
        "Not enrolled"
      );
    });

    it("should handle database errors gracefully", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (requireEnrollment as jest.Mock).mockResolvedValue(true);
      (db.lessonProgress.upsert as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(markLessonComplete("lesson123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("markLessonIncomplete", () => {
    it("should successfully mark lesson as incomplete", async () => {
      const incompleteLessonProgress = {
        ...mockLessonProgress,
        completed: false,
        completedAt: null,
      };

      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (requireEnrollment as jest.Mock).mockResolvedValue(true);
      (db.lessonProgress.upsert as jest.Mock).mockResolvedValue(
        incompleteLessonProgress
      );
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.lessonProgress.count as jest.Mock).mockResolvedValue(0);
      (db.enrollment.update as jest.Mock).mockResolvedValue({ progress: 0 });

      const result = await markLessonIncomplete("lesson123");

      expect(result).toEqual({
        success: true,
        lessonProgress: incompleteLessonProgress,
      });

      expect(db.lessonProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_lessonId: {
            userId: "user123",
            lessonId: "lesson123",
          },
        },
        update: {
          completed: false,
          completedAt: null,
        },
        create: {
          userId: "user123",
          lessonId: "lesson123",
          completed: false,
          completedAt: null,
        },
      });
    });

    it("should redirect to login if user is not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(markLessonIncomplete("lesson123")).rejects.toThrow(
        "NEXT_REDIRECT"
      );
    });

    it("should throw error if lesson not found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(markLessonIncomplete("lesson123")).rejects.toThrow(
        "Lesson not found"
      );
    });
  });

  describe("getLessonProgress", () => {
    it("should return lesson progress for authenticated user", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lessonProgress.findUnique as jest.Mock).mockResolvedValue(
        mockLessonProgress
      );

      const result = await getLessonProgress("lesson123");

      expect(result).toEqual(mockLessonProgress);

      expect(db.lessonProgress.findUnique).toHaveBeenCalledWith({
        where: {
          userId_lessonId: {
            userId: "user123",
            lessonId: "lesson123",
          },
        },
      });
    });

    it("should return null for unauthenticated user", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getLessonProgress("lesson123");

      expect(result).toBeNull();
    });

    it("should return null on database error", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lessonProgress.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getLessonProgress("lesson123");

      expect(result).toBeNull();
    });
  });

  describe("getModuleProgress", () => {
    it("should return module progress for authenticated user", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.module.findUnique as jest.Mock).mockResolvedValue(mockModule);
      (db.lessonProgress.count as jest.Mock).mockResolvedValue(1);

      const result = await getModuleProgress("module123");

      expect(result).toEqual({
        moduleId: "module123",
        totalLessons: 2,
        completedLessons: 1,
        progressPercentage: 50,
      });
    });

    it("should handle empty module", async () => {
      const emptyModule = {
        ...mockModule,
        lessons: [],
      };
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.module.findUnique as jest.Mock).mockResolvedValue(emptyModule);

      const result = await getModuleProgress("module123");

      expect(result).toEqual({
        moduleId: "module123",
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
      });
    });

    it("should return null for unauthenticated user", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getModuleProgress("module123");

      expect(result).toBeNull();
    });

    it("should return null if module not found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.module.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getModuleProgress("module123");

      expect(result).toBeNull();
    });

    it("should return null on database error", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.module.findUnique as jest.Mock).mockResolvedValue(mockModule);
      (db.lessonProgress.count as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getModuleProgress("module123");

      expect(result).toBeNull();
    });
  });

  describe("updateCourseProgress (internal function)", () => {
    it("should calculate progress correctly with 100% completion", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (requireEnrollment as jest.Mock).mockResolvedValue(true);
      (db.lessonProgress.upsert as jest.Mock).mockResolvedValue(
        mockLessonProgress
      );
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.lessonProgress.count as jest.Mock).mockResolvedValue(2); // All lessons complete
      (db.enrollment.update as jest.Mock).mockResolvedValue({ progress: 100 });

      await markLessonComplete("lesson123");

      // Check that enrollment is updated with 100% and completedAt
      expect(db.enrollment.update).toHaveBeenCalledWith({
        where: {
          userId_courseId: {
            userId: "user123",
            courseId: "course123",
          },
        },
        data: {
          progress: 100,
          completedAt: expect.any(Date),
        },
      });
    });

    it("should calculate progress correctly with partial completion", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (requireEnrollment as jest.Mock).mockResolvedValue(true);
      (db.lessonProgress.upsert as jest.Mock).mockResolvedValue(
        mockLessonProgress
      );
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.lessonProgress.count as jest.Mock).mockResolvedValue(1); // 1 of 2 lessons complete
      (db.enrollment.update as jest.Mock).mockResolvedValue({ progress: 50 });

      await markLessonComplete("lesson123");

      // Check that enrollment is updated with 50% and no completedAt
      expect(db.enrollment.update).toHaveBeenCalledWith({
        where: {
          userId_courseId: {
            userId: "user123",
            courseId: "course123",
          },
        },
        data: {
          progress: 50,
          completedAt: null,
        },
      });
    });
  });
});
