import {
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  getInstructorCourses,
  getInstructorDashboard,
  getCategories,
} from "../courses";
import { db } from "@/lib/db";
import { authorize } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    course: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    enrollment: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

jest.mock("@/lib/authorization", () => ({
  authorize: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock console.error
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Helper function to create FormData
const createMockFormData = (data: Record<string, string | number>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });
  return formData;
};

// Mock user objects
const mockInstructor = {
  id: "instructor-1",
  role: "INSTRUCTOR" as const,
  name: "John Instructor",
  email: "instructor@example.com",
};

const mockAdmin = {
  id: "admin-1",
  role: "ADMIN" as const,
  name: "Admin User",
  email: "admin@example.com",
};

describe("Course Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("createCourse", () => {
    it("should create a course with valid data", async () => {
      const formData = createMockFormData({
        title: "Test Course",
        description: "A test course description",
        categoryId: "category-1",
        price: 99,
        thumbnail: "https://example.com/image.jpg",
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue(null); // No existing slug
      (db.course.create as jest.Mock).mockResolvedValue({
        id: "course-1",
        title: "Test Course",
        slug: "test-course",
      });

      const result = await createCourse({}, formData);

      expect(result).toEqual({
        success: true,
        message: "Course created successfully!",
      });

      expect(db.course.create).toHaveBeenCalledWith({
        data: {
          title: "Test Course",
          description: "A test course description",
          slug: "test-course",
          instructorId: "instructor-1",
          categoryId: "category-1",
          price: 99,
          thumbnail: "https://example.com/image.jpg",
          status: "DRAFT",
        },
        include: expect.any(Object),
      });

      expect(revalidatePath).toHaveBeenCalledWith("/instructor/courses");
    });

    it("should return validation errors for invalid data", async () => {
      const formData = createMockFormData({
        title: "", // Invalid - empty title
        description: "A test course description",
        categoryId: "category-1",
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);

      const result = await createCourse({}, formData);

      expect(result).toEqual({
        errors: expect.objectContaining({
          title: expect.any(Array),
        }),
        message: "Invalid form data. Please check your inputs.",
      });

      expect(db.course.create).not.toHaveBeenCalled();
    });

    it("should handle slug conflicts by appending counter", async () => {
      const formData = createMockFormData({
        title: "Test Course",
        description: "A test course description",
        categoryId: "category-1",
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: "existing" }) // First slug exists
        .mockResolvedValueOnce(null); // Second slug doesn't exist
      (db.course.create as jest.Mock).mockResolvedValue({
        id: "course-1",
        title: "Test Course",
        slug: "test-course-1",
      });

      const result = await createCourse({}, formData);

      expect(result.success).toBe(true);
      expect(db.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: "test-course-1",
        }),
        include: expect.any(Object),
      });
    });

    it("should handle unauthorized access", async () => {
      const formData = createMockFormData({
        title: "Test Course",
        description: "A test course description",
        categoryId: "category-1",
      });

      (authorize as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

      const result = await createCourse({}, formData);

      expect(result).toEqual({
        errors: {
          _form: ["Failed to create course. Please try again."],
        },
      });
    });
  });

  describe("updateCourse", () => {
    it("should update a course with valid data", async () => {
      const formData = createMockFormData({
        id: "course-1",
        title: "Updated Course",
        description: "Updated description",
        categoryId: "category-1",
        price: 149,
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        id: "course-1",
        instructorId: "instructor-1",
      });
      (db.course.findFirst as jest.Mock).mockResolvedValue(null); // No slug conflict
      (db.course.update as jest.Mock).mockResolvedValue({
        id: "course-1",
        title: "Updated Course",
      });

      const result = await updateCourse({}, formData);

      expect(result).toEqual({
        success: true,
        message: "Course updated successfully!",
      });

      expect(db.course.update).toHaveBeenCalledWith({
        where: { id: "course-1" },
        data: expect.objectContaining({
          title: "Updated Course",
          description: "Updated description",
          categoryId: "category-1",
          price: 149,
          slug: "updated-course",
        }),
      });
    });

    it("should return error for non-existent course", async () => {
      const formData = createMockFormData({
        id: "non-existent",
        title: "Updated Course",
        description: "Updated description",
        categoryId: "category-1",
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await updateCourse({}, formData);

      expect(result).toEqual({
        errors: {
          _form: ["Course not found."],
        },
      });
    });

    it("should return error for unauthorized user", async () => {
      const formData = createMockFormData({
        id: "course-1",
        title: "Updated Course",
        description: "Updated description",
        categoryId: "category-1",
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        id: "course-1",
        instructorId: "different-instructor", // Different instructor
      });

      const result = await updateCourse({}, formData);

      expect(result).toEqual({
        errors: {
          _form: ["You don't have permission to edit this course."],
        },
      });
    });
  });

  describe("updateCourseStatus", () => {
    it("should update course status successfully", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        instructorId: "instructor-1",
        title: "Test Course",
      });
      (db.course.update as jest.Mock).mockResolvedValue({});

      const result = await updateCourseStatus("course-1", "PUBLISHED");

      expect(result).toEqual({
        success: true,
        message: "Course published successfully!",
      });

      expect(db.course.update).toHaveBeenCalledWith({
        where: { id: "course-1" },
        data: { status: "PUBLISHED" },
      });
    });

    it("should return error for non-existent course", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await updateCourseStatus("non-existent", "PUBLISHED");

      expect(result).toEqual({
        success: false,
        message: "Course not found.",
      });
    });

    it("should return error for unauthorized user", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        instructorId: "different-instructor",
        title: "Test Course",
      });

      const result = await updateCourseStatus("course-1", "PUBLISHED");

      expect(result).toEqual({
        success: false,
        message: "You don't have permission to modify this course.",
      });
    });
  });

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        instructorId: "instructor-1",
        title: "Test Course",
        _count: { enrollments: 0 },
      });
      (db.course.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteCourse("course-1");

      expect(result).toEqual({
        success: true,
        message: "Course deleted successfully!",
      });

      expect(db.course.delete).toHaveBeenCalledWith({
        where: { id: "course-1" },
      });
    });

    it("should prevent deletion of course with enrollments", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findUnique as jest.Mock).mockResolvedValue({
        instructorId: "instructor-1",
        title: "Test Course",
        _count: { enrollments: 5 },
      });

      const result = await deleteCourse("course-1");

      expect(result).toEqual({
        success: false,
        message:
          "Cannot delete course with active enrollments. Archive it instead.",
      });

      expect(db.course.delete).not.toHaveBeenCalled();
    });
  });

  describe("getInstructorCourses", () => {
    it("should return paginated courses for instructor", async () => {
      const mockCourses = [
        {
          id: "course-1",
          title: "Course 1",
          description: "Test description",
          slug: "course-1",
          price: {
            toNumber: () => 99,
            toString: () => "99",
            valueOf: () => 99,
          }, // Mock Decimal
          thumbnail: "test.jpg",
          status: "PUBLISHED",
          createdAt: new Date(),
          updatedAt: new Date(),
          instructor: {
            id: "instructor-1",
            name: "John",
            email: "john@test.com",
          },
          category: { id: "cat-1", name: "Tech", slug: "tech" },
          _count: { modules: 3, enrollments: 10 },
        },
      ];

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.count as jest.Mock).mockResolvedValue(1);
      (db.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      const result = await getInstructorCourses({
        query: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].price).toBe(99); // Should be converted from Decimal
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("should filter courses by search query", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.count as jest.Mock).mockResolvedValue(0);
      (db.course.findMany as jest.Mock).mockResolvedValue([]);
      await getInstructorCourses({
        query: "JavaScript",
        page: 1,
        limit: 10,
        sortBy: "title",
        sortOrder: "asc",
      });
      expect(db.course.findMany).toHaveBeenCalledWith({
        where: {
          instructorId: "instructor-1",
          OR: [
            {
              AND: [
                {
                  title: {
                    contains: "JavaScript",
                    mode: "insensitive",
                  },
                },
              ],
            },
            {
              description: {
                contains: "JavaScript",
                mode: "insensitive",
              },
            },
          ],
        },
        select: expect.objectContaining({
          id: true,
          title: true,
          description: true,
          price: true,
          status: true,
          thumbnail: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        }),
        orderBy: { title: "asc" },
        skip: 0,
        take: 10,
      });
    });
  });

  describe("getInstructorDashboard", () => {
    it("should return dashboard data for instructor", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalCourses
        .mockResolvedValueOnce(7) // publishedCourses
        .mockResolvedValueOnce(3); // draftCourses

      (db.enrollment.aggregate as jest.Mock).mockResolvedValue({
        _count: 25,
      });
      (db.course.findMany as jest.Mock)
        .mockResolvedValueOnce([
          {
            price: {
              toNumber: () => 99,
              toString: () => "99",
              valueOf: () => 99,
            },
            _count: { enrollments: 5 },
          },
          {
            price: null,
            _count: { enrollments: 3 },
          },
        ]) // coursesWithRevenue
        .mockResolvedValueOnce([
          {
            id: "course-1",
            title: "Recent Course",
            description: "Test description",
            slug: "recent-course",
            price: {
              toNumber: () => 99,
              toString: () => "99",
              valueOf: () => 99,
            },
            thumbnail: "test.jpg",
            status: "PUBLISHED",
            createdAt: new Date(),
            updatedAt: new Date(),
            instructor: {
              id: "instructor-1",
              name: "John",
              email: "john@test.com",
            },
            category: { id: "cat-1", name: "Tech", slug: "tech" },
            modules: [],
            _count: { modules: 0, enrollments: 0 },
          },
        ]); // recentCourses

      (db.enrollment.findMany as jest.Mock).mockResolvedValue([
        {
          id: "enrollment-1",
          user: { id: "user-1", name: "Student", email: "student@test.com" },
        },
      ]);

      const result = await getInstructorDashboard();

      expect(result.stats).toEqual({
        totalCourses: 10,
        publishedCourses: 7,
        draftCourses: 3,
        totalEnrollments: 25,
        totalRevenue: 495, // 99 * 5 enrollments
      });
      expect(result.recentCourses).toHaveLength(1);
      expect(result.recentEnrollments).toHaveLength(1);
    });

    it("should handle errors gracefully", async () => {
      (authorize as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

      const result = await getInstructorDashboard();

      expect(result).toEqual({
        stats: {
          totalCourses: 0,
          publishedCourses: 0,
          draftCourses: 0,
          totalEnrollments: 0,
          totalRevenue: 0,
        },
        recentCourses: [],
        recentEnrollments: [],
      });
    });
  });

  describe("getCategories", () => {
    it("should return all categories", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Technology", slug: "technology" },
        { id: "cat-2", name: "Design", slug: "design" },
      ];

      (db.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(result).toEqual(mockCategories);
      expect(db.category.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { name: "asc" },
      });
    });

    it("should return empty array on error", async () => {
      (db.category.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getCategories();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching categories:",
        expect.any(Error)
      );
    });
  });
});
