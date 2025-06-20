import {
  enrollInCourse,
  unenrollFromCourse,
  getEnrollmentStatus,
  getEnrolledCourses,
  getCourseProgress,
} from "../enrollment";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    enrollment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    lessonProgress: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
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

// Mock session objects
const mockStudentSession = {
  user: {
    id: "student-1",
    role: "STUDENT" as const,
    name: "John Student",
    email: "student@example.com",
  },
};

const mockInstructorSession = {
  user: {
    id: "instructor-1",
    role: "INSTRUCTOR" as const,
    name: "Jane Instructor",
    email: "instructor@example.com",
  },
};

describe("Enrollment Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("enrollInCourse", () => {
    it("should enroll student in course successfully", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        id: "course-1",
        status: "PUBLISHED",
        price: 99,
        title: "Test Course",
      });
      (db.enrollment.create as jest.Mock).mockResolvedValue({
        id: "enrollment-1",
        userId: "student-1",
        courseId: "course-1",
      });

      const result = await enrollInCourse("course-1");

      expect(result).toEqual({
        success: true,
        enrollment: expect.objectContaining({
          userId: "student-1",
          courseId: "course-1",
        }),
      });

      expect(db.enrollment.create).toHaveBeenCalledWith({
        data: {
          userId: "student-1",
          courseId: "course-1",
          enrolledAt: expect.any(Date),
          progress: 0,
        },
      });

      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/courses");
      expect(revalidatePath).toHaveBeenCalledWith("/courses/course-1");
    });

    it("should redirect unauthenticated users to login", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(enrollInCourse("course-1")).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should throw error for non-student users", async () => {
      (auth as jest.Mock).mockResolvedValue(mockInstructorSession);

      await expect(enrollInCourse("course-1")).rejects.toThrow(
        "Only students can enroll in courses"
      );
    });

    it("should throw error if already enrolled", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-enrollment",
      });

      await expect(enrollInCourse("course-1")).rejects.toThrow(
        "Already enrolled in this course"
      );
    });

    it("should throw error if course not found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
      (db.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(enrollInCourse("course-1")).rejects.toThrow(
        "Course not found"
      );
    });

    it("should throw error if course not published", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        id: "course-1",
        status: "DRAFT",
        price: 99,
        title: "Test Course",
      });

      await expect(enrollInCourse("course-1")).rejects.toThrow(
        "Course is not published"
      );
    });
  });

  describe("unenrollFromCourse", () => {
    it("should unenroll student from course successfully", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue({
        id: "enrollment-1",
        userId: "student-1",
        courseId: "course-1",
      });
      (db.lessonProgress.deleteMany as jest.Mock).mockResolvedValue({});
      (db.enrollment.delete as jest.Mock).mockResolvedValue({});

      const result = await unenrollFromCourse("course-1");

      expect(result).toEqual({ success: true });

      expect(db.lessonProgress.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: "student-1",
          lesson: {
            module: {
              courseId: "course-1",
            },
          },
        },
      });

      expect(db.enrollment.delete).toHaveBeenCalledWith({
        where: {
          userId_courseId: {
            userId: "student-1",
            courseId: "course-1",
          },
        },
      });
    });

    it("should throw error if not enrolled", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(unenrollFromCourse("course-1")).rejects.toThrow(
        "Not enrolled in this course"
      );
    });

    it("should handle database errors", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue({
        id: "enrollment-1",
      });
      (db.lessonProgress.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(unenrollFromCourse("course-1")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getEnrollmentStatus", () => {
    it("should return enrollment status for authenticated user", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue({
        id: "enrollment-1",
        enrolledAt: new Date(),
        progress: 45,
      });

      const result = await getEnrollmentStatus("course-1");
      expect(result).toEqual({
        enrolled: true,
        canEnroll: true,
        enrollment: expect.objectContaining({
          id: "enrollment-1",
          progress: 45,
        }),
      });
    });
    it("should return not enrolled for unauthenticated user", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getEnrollmentStatus("course-1");

      expect(result).toEqual({
        enrolled: false,
        canEnroll: true,
      });
    });
    it("should return not enrolled if no enrollment found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getEnrollmentStatus("course-1");

      expect(result).toEqual({
        enrolled: false,
        canEnroll: true,
        enrollment: null,
      });
    });
  });

  describe("getEnrolledCourses", () => {
    it("should return enrolled courses for authenticated user", async () => {
      const mockEnrollments = [
        {
          id: "enrollment-1",
          enrolledAt: new Date(),
          progress: 60,
          completedAt: null,
          course: {
            id: "course-1",
            title: "Course 1",
            instructor: {
              id: "instructor-1",
              name: "Instructor",
              avatar: null,
            },
            category: {
              id: "cat-1",
              name: "Tech",
              slug: "tech",
            },
            modules: [
              {
                lessons: [{ id: "lesson-1", title: "Lesson 1", duration: 30 }],
              },
            ],
            _count: {
              modules: 1,
              enrollments: 10,
            },
          },
        },
      ];

      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);

      const result = await getEnrolledCourses();

      expect(result).toEqual(mockEnrollments);
      expect(db.enrollment.findMany).toHaveBeenCalledWith({
        where: {
          userId: "student-1",
        },
        include: expect.objectContaining({
          course: expect.any(Object),
        }),
        orderBy: {
          enrolledAt: "desc",
        },
      });
    });

    it("should redirect unauthenticated users to login", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(getEnrolledCourses()).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should handle database errors", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(getEnrolledCourses()).rejects.toThrow(
        "Failed to fetch enrolled courses"
      );
    });
  });

  describe("getCourseProgress", () => {
    it("should return course progress for enrolled student", async () => {
      const mockEnrollment = {
        id: "enrollment-1",
        userId: "student-1",
        courseId: "course-1",
        enrolledAt: new Date(),
        progress: 50,
      };

      const mockCourse = {
        id: "course-1",
        title: "Test Course",
        modules: [
          {
            id: "module-1",
            lessons: [
              { id: "lesson-1", title: "Lesson 1", duration: 30, order: 1 },
              { id: "lesson-2", title: "Lesson 2", duration: 45, order: 2 },
            ],
          },
        ],
      };

      const mockLessonProgress = [
        {
          lessonId: "lesson-1",
          completed: true,
          completedAt: new Date(),
        },
        {
          lessonId: "lesson-2",
          completed: false,
          completedAt: null,
        },
      ];

      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.lessonProgress.findMany as jest.Mock).mockResolvedValue(
        mockLessonProgress
      );

      const result = await getCourseProgress("course-1");
      expect(result).toEqual({
        enrollment: mockEnrollment,
        course: {
          ...mockCourse,
          price: null, // Added serialized price field
        },
        lessonProgress: {
          "lesson-1": mockLessonProgress[0],
          "lesson-2": mockLessonProgress[1],
        },
        stats: {
          totalLessons: 2,
          completedLessons: 1,
          progressPercentage: 50,
        },
      });
    });

    it("should throw error if not enrolled", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getCourseProgress("course-1")).rejects.toThrow(
        "Not enrolled in this course"
      );
    });

    it("should throw error if course not found", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue({
        id: "enrollment-1",
      });
      (db.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getCourseProgress("course-1")).rejects.toThrow(
        "Course not found"
      );
    });

    it("should calculate progress correctly for empty course", async () => {
      const mockEnrollment = {
        id: "enrollment-1",
        userId: "student-1",
        courseId: "course-1",
      };

      const mockCourse = {
        id: "course-1",
        title: "Empty Course",
        modules: [],
      };

      (auth as jest.Mock).mockResolvedValue(mockStudentSession);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.lessonProgress.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getCourseProgress("course-1");

      expect(result.stats).toEqual({
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
      });
    });
  });
});
