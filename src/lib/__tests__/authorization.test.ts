import {
  authorize,
  getCurrentUser,
  hasRole,
  isEnrolledInCourse,
  requireEnrollment,
  canAccessCourse,
  requireCourseAccess,
} from "../authorization";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    enrollment: {
      findUnique: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// Mock console.error
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Mock data
const mockStudentSession = {
  user: {
    id: "student123",
    role: "STUDENT" as const,
    name: "John Student",
    email: "student@example.com",
  },
};

const mockInstructorSession = {
  user: {
    id: "instructor123",
    role: "INSTRUCTOR" as const,
    name: "Jane Instructor",
    email: "instructor@example.com",
  },
};

const mockAdminSession = {
  user: {
    id: "admin123",
    role: "ADMIN" as const,
    name: "Admin User",
    email: "admin@example.com",
  },
};

const mockEnrollment = {
  id: "enrollment123",
  userId: "student123",
  courseId: "course123",
  enrolledAt: new Date(),
};

const mockCourse = {
  id: "course123",
  instructorId: "instructor123",
  title: "Test Course",
};

describe("Authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("authorize", () => {
    it("should return user for valid session with allowed role", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);

      const result = await authorize(["STUDENT"]);

      expect(result).toEqual(mockStudentSession.user);
    });

    it("should return user for multiple allowed roles", async () => {
      (auth as jest.Mock).mockResolvedValue(mockInstructorSession);

      const result = await authorize(["INSTRUCTOR", "ADMIN"]);

      expect(result).toEqual(mockInstructorSession.user);
    });

    it("should redirect to login if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(authorize(["STUDENT"])).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should redirect to login if no user in session", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: null });

      await expect(authorize(["STUDENT"])).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should redirect to dashboard if role not allowed", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);

      await expect(authorize(["INSTRUCTOR", "ADMIN"])).rejects.toThrow(
        "NEXT_REDIRECT"
      );
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should allow admin for any role requirement", async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);

      const result = await authorize(["STUDENT"]);

      expect(result).toEqual(mockAdminSession.user);
    });
  });

  describe("getCurrentUser", () => {
    it("should return user when session exists", async () => {
      (auth as jest.Mock).mockResolvedValue(mockStudentSession);

      const result = await getCurrentUser();

      expect(result).toEqual(mockStudentSession.user);
    });

    it("should return null when no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it("should return null when session has no user", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: null });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe("hasRole", () => {
    it("should return true if user role is in allowed roles", () => {
      const result = hasRole("STUDENT", ["STUDENT", "INSTRUCTOR"]);
      expect(result).toBe(true);
    });

    it("should return false if user role is not in allowed roles", () => {
      const result = hasRole("STUDENT", ["INSTRUCTOR", "ADMIN"]);
      expect(result).toBe(false);
    });

    it("should return true for exact role match", () => {
      const result = hasRole("ADMIN", ["ADMIN"]);
      expect(result).toBe(true);
    });

    it("should return false for empty allowed roles", () => {
      const result = hasRole("STUDENT", []);
      expect(result).toBe(false);
    });
  });

  describe("isEnrolledInCourse", () => {
    it("should return true when user is enrolled", async () => {
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);

      const result = await isEnrolledInCourse("student123", "course123");

      expect(result).toBe(true);
      expect(db.enrollment.findUnique).toHaveBeenCalledWith({
        where: {
          userId_courseId: {
            userId: "student123",
            courseId: "course123",
          },
        },
      });
    });

    it("should return false when user is not enrolled", async () => {
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await isEnrolledInCourse("student123", "course123");

      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      (db.enrollment.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await isEnrolledInCourse("student123", "course123");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error checking course enrollment:",
        expect.any(Error)
      );
    });
  });

  describe("requireEnrollment", () => {
    it("should not throw when user is enrolled", async () => {
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);

      await expect(
        requireEnrollment("student123", "course123")
      ).resolves.not.toThrow();
    });

    it("should throw error when user is not enrolled", async () => {
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        requireEnrollment("student123", "course123")
      ).rejects.toThrow("Access denied: Not enrolled in this course");
    });

    it("should throw error on database error", async () => {
      (db.enrollment.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        requireEnrollment("student123", "course123")
      ).rejects.toThrow("Access denied: Not enrolled in this course");
    });
  });

  describe("canAccessCourse", () => {
    it("should return true for course instructor", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

      const result = await canAccessCourse("instructor123", "course123");

      expect(result).toBe(true);
      expect(db.course.findUnique).toHaveBeenCalledWith({
        where: { id: "course123" },
        select: { instructorId: true },
      });
    });

    it("should return true for enrolled student", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);

      const result = await canAccessCourse("student123", "course123");

      expect(result).toBe(true);
    });

    it("should return false for non-enrolled non-instructor", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await canAccessCourse("other123", "course123");

      expect(result).toBe(false);
    });

    it("should return false when course not found", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await canAccessCourse("student123", "course123");

      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      (db.course.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await canAccessCourse("student123", "course123");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error checking course access:",
        expect.any(Error)
      );
    });
  });

  describe("requireCourseAccess", () => {
    it("should not throw when user has access as instructor", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

      await expect(
        requireCourseAccess("instructor123", "course123")
      ).resolves.not.toThrow();
    });

    it("should not throw when user has access as enrolled student", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);

      await expect(
        requireCourseAccess("student123", "course123")
      ).resolves.not.toThrow();
    });

    it("should throw error when user has no access", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (db.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        requireCourseAccess("other123", "course123")
      ).rejects.toThrow("Access denied: Not authorized to access this course");
    });

    it("should throw error when course not found", async () => {
      (db.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        requireCourseAccess("student123", "course123")
      ).rejects.toThrow("Access denied: Not authorized to access this course");
    });
  });
});
