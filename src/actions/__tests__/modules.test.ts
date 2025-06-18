import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  getCourseModules,
} from "../modules";
import { authorize } from "@/lib/authorization";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/lib/authorization", () => ({
  authorize: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    course: {
      findFirst: jest.fn(),
    },
    module: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    lesson: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock console.error
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Helper function to create FormData
const createMockFormData = (data: Record<string, string | undefined>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
};

// Mock data
const mockInstructor = {
  id: "instructor123",
  role: "INSTRUCTOR" as const,
  email: "instructor@example.com",
};

const mockCourse = {
  id: "course123",
  title: "Test Course",
  instructorId: "instructor123",
};

const mockModule = {
  id: "module123",
  courseId: "course123",
  title: "Test Module",
  description: "Module description",
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockModules = [
  { ...mockModule, id: "module1", order: 1 },
  { ...mockModule, id: "module2", order: 2 },
  { ...mockModule, id: "module3", order: 3 },
];

describe("Modules Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("createModule", () => {
    const validFormData = createMockFormData({
      courseId: "course123",
      title: "New Module",
      description: "Module description",
      order: "1",
    });

    it("should create module successfully", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (db.module.findFirst as jest.Mock).mockResolvedValue(null); // No previous modules      (db.module.create as jest.Mock).mockResolvedValue(mockModule);

      const result = await createModule({ success: false }, validFormData);

      expect(result).toEqual({
        success: true,
        message: "Module created successfully",
      });

      expect(authorize).toHaveBeenCalledWith(["INSTRUCTOR", "ADMIN"]);
      expect(db.course.findFirst).toHaveBeenCalledWith({
        where: {
          id: "course123",
          instructorId: "instructor123",
        },
      });
      expect(db.module.create).toHaveBeenCalledWith({
        data: {
          courseId: "course123",
          title: "New Module",
          description: "Module description",
          order: 1,
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123"
      );
      expect(revalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123/content"
      );
    });

    it("should auto-generate order when not provided", async () => {
      const formDataWithoutOrder = createMockFormData({
        courseId: "course123",
        title: "New Module",
        description: "Module description",
        order: "0", // 0 means auto-generate
      });

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (db.module.findFirst as jest.Mock).mockResolvedValue({ order: 3 }); // Last module has order 3      (db.module.create as jest.Mock).mockResolvedValue(mockModule);

      await createModule({ success: false }, formDataWithoutOrder);

      expect(db.module.create).toHaveBeenCalledWith({
        data: {
          courseId: "course123",
          title: "New Module",
          description: "Module description",
          order: 4, // Should be last order + 1
        },
      });
    });

    it("should fail validation with invalid data", async () => {
      const invalidFormData = createMockFormData({
        courseId: "", // Invalid: empty courseId
        title: "", // Invalid: empty title
      });
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);

      const result = await createModule({ success: false }, invalidFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation failed");
      expect(result.errors).toBeDefined();
    });

    it("should fail if course not found or no permission", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await createModule({ success: false }, validFormData);

      expect(result).toEqual({
        success: false,
        message: "Course not found or you don't have permission to modify it",
      });
    });

    it("should handle authorization failure", async () => {
      (authorize as jest.Mock).mockRejectedValue(new Error("Not authorized"));

      const result = await createModule({ success: false }, validFormData);

      expect(result).toEqual({
        success: false,
        message: "Failed to create module. Please try again.",
      });
    });
  });

  describe("updateModule", () => {
    const updateFormData = createMockFormData({
      id: "module123",
      courseId: "course123",
      title: "Updated Module",
      description: "Updated description",
    });

    it("should update module successfully", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue({
        ...mockModule,
        course: mockCourse,
      });
      (db.module.update as jest.Mock).mockResolvedValue({
        ...mockModule,
        title: "Updated Module",
      });

      const result = await updateModule({ success: false }, updateFormData);

      expect(result).toEqual({
        success: true,
        message: "Module updated successfully",
      });
      expect(db.module.update).toHaveBeenCalledWith({
        where: { id: "module123" },
        data: {
          courseId: "course123",
          title: "Updated Module",
          description: "Updated description",
          order: undefined,
        },
      });
    });

    it("should fail validation with invalid data", async () => {
      const invalidUpdateData = createMockFormData({
        id: "", // Invalid: empty id
        title: "", // Invalid: empty title
      });
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);

      const result = await updateModule({ success: false }, invalidUpdateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation failed");
    });

    it("should fail if module not found or no permission", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateModule({ success: false }, updateFormData);

      expect(result).toEqual({
        success: false,
        message: "Module not found or you don't have permission to modify it",
      });
    });
  });

  describe("deleteModule", () => {
    it("should delete module successfully", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue({
        ...mockModule,
        course: mockCourse,
      });
      (db.module.delete as jest.Mock).mockResolvedValue(mockModule);

      const result = await deleteModule("module123");

      expect(result).toEqual({
        success: true,
        message: "Module deleted successfully",
      });

      expect(db.module.delete).toHaveBeenCalledWith({
        where: { id: "module123" },
      });
      expect(revalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123"
      );
    });

    it("should fail if module not found or no permission", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await deleteModule("module123");

      expect(result).toEqual({
        success: false,
        message: "Module not found or you don't have permission to delete it",
      });
    });
    it("should handle database errors", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue({
        ...mockModule,
        course: mockCourse,
      });
      (db.module.delete as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await deleteModule("module123");

      expect(result).toEqual({
        success: false,
        message: "Failed to delete module. Please try again.",
      });
    });
  });

  describe("reorderModules", () => {
    const reorderInput = {
      courseId: "course123",
      moduleIds: ["module3", "module1", "module2"],
    };
    it("should reorder modules successfully", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (db.$transaction as jest.Mock).mockImplementation((queries) =>
        Promise.all(queries.map(() => ({ id: "module123", order: 1 })))
      );

      const result = await reorderModules(reorderInput);

      expect(result).toEqual({
        success: true,
        message: "Modules reordered successfully",
      });

      // Should call db.$transaction with the module update queries
      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123"
      );
      expect(revalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123/content"
      );
    });

    it("should fail validation with invalid input", async () => {
      const invalidInput = {
        courseId: "", // Invalid: empty courseId
        moduleIds: [], // Invalid: empty array
      };

      (authorize as jest.Mock).mockResolvedValue(mockInstructor);

      const result = await reorderModules(invalidInput);

      expect(result).toEqual({
        success: false,
        message: "Invalid input data",
      });
    });

    it("should fail if course not found or no permission", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await reorderModules(reorderInput);

      expect(result).toEqual({
        success: false,
        message: "Course not found or you don't have permission to modify it",
      });
    });
  });

  describe("getCourseModules", () => {
    const mockModulesWithDetails = mockModules.map((module) => ({
      ...module,
      lessons: [
        { id: "lesson1", order: 1 },
        { id: "lesson2", order: 2 },
      ],
      _count: { lessons: 2 },
    }));

    it("should return modules for authorized user", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (db.module.findMany as jest.Mock).mockResolvedValue(
        mockModulesWithDetails
      );

      const result = await getCourseModules("course123");

      expect(result).toEqual(mockModulesWithDetails);
      expect(db.module.findMany).toHaveBeenCalledWith({
        where: { courseId: "course123" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              lessons: true,
            },
          },
        },
        orderBy: { order: "asc" },
      });
    });

    it("should throw error if course not found or no access", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getCourseModules("course123")).rejects.toThrow(
        "Course not found or access denied"
      );
    });

    it("should throw error on authorization failure", async () => {
      (authorize as jest.Mock).mockRejectedValue(new Error("Not authorized"));

      await expect(getCourseModules("course123")).rejects.toThrow(
        "Not authorized"
      );
    });

    it("should handle database errors", async () => {
      (authorize as jest.Mock).mockResolvedValue(mockInstructor);
      (db.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (db.module.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(getCourseModules("course123")).rejects.toThrow(
        "Database error"
      );
    });
  });
});
