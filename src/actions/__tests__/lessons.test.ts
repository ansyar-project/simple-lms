/**
 * @jest-environment node
 */

import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getModuleLessons,
  getLesson,
} from "../lessons";
import { authorize } from "@/lib/authorization";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/lib/authorization", () => ({
  authorize: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    module: {
      findFirst: jest.fn(),
    },
    lesson: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockAuthorize = authorize as jest.MockedFunction<typeof authorize>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

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

const mockModule = {
  id: "module123",
  courseId: "course123",
  course: {
    id: "course123",
    title: "Test Course",
    instructorId: "instructor123",
  },
};

const mockLesson = {
  id: "lesson123",
  moduleId: "module123",
  title: "Test Lesson",
  content: "Lesson content",
  contentType: "TEXT",
  videoUrl: null,
  duration: 30,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLessons = [
  { ...mockLesson, id: "lesson1", order: 1 },
  { ...mockLesson, id: "lesson2", order: 2 },
  { ...mockLesson, id: "lesson3", order: 3 },
];

describe("Lessons Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("createLesson", () => {
    const validFormData = createMockFormData({
      moduleId: "module123",
      title: "New Lesson",
      content: "Lesson content",
      contentType: "TEXT",
      duration: "30",
      order: "1",
    });

    it("should create lesson successfully", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(mockModule);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue(null);
      (db.lesson.create as jest.Mock).mockResolvedValue(mockLesson);

      const result = await createLesson({ success: false }, validFormData);

      expect(result).toEqual({
        success: true,
        message: "Lesson created successfully",
      });

      expect(mockAuthorize).toHaveBeenCalledWith(["INSTRUCTOR", "ADMIN"]);
      expect(db.module.findFirst).toHaveBeenCalledWith({
        where: {
          id: "module123",
          course: {
            instructorId: "instructor123",
          },
        },
        include: {
          course: true,
        },
      });
      expect(db.lesson.create).toHaveBeenCalledWith({
        data: {
          moduleId: "module123",
          title: "New Lesson",
          content: "Lesson content",
          contentType: "TEXT",
          videoUrl: undefined,
          duration: 30,
          order: 1,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123"
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123/content"
      );
    });

    it("should auto-generate order when not provided", async () => {
      const formDataWithoutOrder = createMockFormData({
        moduleId: "module123",
        title: "New Lesson",
        content: "Lesson content",
        contentType: "TEXT",
        order: "0",
      });
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(mockModule);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue({ order: 3 });
      (db.lesson.create as jest.Mock).mockResolvedValue(mockLesson);

      await createLesson({ success: false }, formDataWithoutOrder);

      expect(db.lesson.create).toHaveBeenCalledWith({
        data: {
          moduleId: "module123",
          title: "New Lesson",
          content: "Lesson content",
          contentType: "TEXT",
          videoUrl: undefined,
          duration: undefined,
          order: 4,
        },
      });
    });

    it("should fail validation with invalid data", async () => {
      const invalidFormData = createMockFormData({
        moduleId: "",
        title: "",
        contentType: "INVALID_TYPE",
      });
      mockAuthorize.mockResolvedValue(mockInstructor);

      const result = await createLesson({ success: false }, invalidFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation failed");
      expect(result.errors).toBeDefined();
    });

    it("should fail if module not found or no permission", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await createLesson({ success: false }, validFormData);

      expect(result).toEqual({
        success: false,
        message: "Module not found or you don't have permission to modify it",
      });
    });

    it("should handle authorization failure", async () => {
      mockAuthorize.mockRejectedValue(new Error("Not authorized"));

      const result = await createLesson({ success: false }, validFormData);

      expect(result).toEqual({
        success: false,
        message: "Failed to create lesson. Please try again.",
      });
    });
  });

  describe("updateLesson", () => {
    const updateFormData = createMockFormData({
      id: "lesson123",
      moduleId: "module123",
      title: "Updated Lesson",
      content: "Updated content",
      contentType: "TEXT",
      duration: "45",
    });

    it("should update lesson successfully", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue({
        ...mockLesson,
        module: mockModule,
      });
      (db.lesson.update as jest.Mock).mockResolvedValue({
        ...mockLesson,
        title: "Updated Lesson",
      });

      const result = await updateLesson({ success: false }, updateFormData);

      expect(result).toEqual({
        success: true,
        message: "Lesson updated successfully",
      });
      expect(db.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson123" },
        data: {
          moduleId: "module123",
          title: "Updated Lesson",
          content: "Updated content",
          contentType: "TEXT",
          videoUrl: undefined,
          duration: 45,
          order: undefined,
        },
      });
    });

    it("should fail validation with invalid data", async () => {
      const invalidUpdateData = createMockFormData({
        id: "",
        title: "",
      });
      mockAuthorize.mockResolvedValue(mockInstructor);

      const result = await updateLesson({ success: false }, invalidUpdateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Validation failed");
    });

    it("should fail if lesson not found or no permission", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateLesson({ success: false }, updateFormData);

      expect(result).toEqual({
        success: false,
        message: "Lesson not found or you don't have permission to modify it",
      });
    });
  });

  describe("deleteLesson", () => {
    it("should delete lesson successfully", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue({
        ...mockLesson,
        module: mockModule,
      });
      (db.lesson.delete as jest.Mock).mockResolvedValue(mockLesson);

      const result = await deleteLesson("lesson123");

      expect(result).toEqual({
        success: true,
        message: "Lesson deleted successfully",
      });

      expect(db.lesson.delete).toHaveBeenCalledWith({
        where: { id: "lesson123" },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/instructor/courses/course123"
      );
    });

    it("should fail if lesson not found or no permission", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await deleteLesson("lesson123");

      expect(result).toEqual({
        success: false,
        message: "Lesson not found or you don't have permission to delete it",
      });
    });

    it("should handle database errors", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue({
        ...mockLesson,
        module: mockModule,
      });
      (db.lesson.delete as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await deleteLesson("lesson123");

      expect(result).toEqual({
        success: false,
        message: "Failed to delete lesson. Please try again.",
      });
    });
  });

  describe("reorderLessons", () => {
    const reorderInput = {
      moduleId: "module123",
      lessonIds: ["lesson3", "lesson1", "lesson2"],
    };

    it("should reorder lessons successfully", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(mockModule);
      (db.$transaction as jest.Mock).mockResolvedValue([
        { id: "lesson3", order: 1 },
        { id: "lesson1", order: 2 },
        { id: "lesson2", order: 3 },
      ]);

      const result = await reorderLessons(reorderInput);

      expect(result).toEqual({
        success: true,
        message: "Lessons reordered successfully",
      });

      expect(db.$transaction).toHaveBeenCalledTimes(1);
      const transactionCalls = (db.$transaction as jest.Mock).mock.calls[0][0];
      expect(transactionCalls).toHaveLength(3);
    });

    it("should fail validation with invalid input", async () => {
      const invalidInput = {
        moduleId: "",
        lessonIds: [],
      };

      mockAuthorize.mockResolvedValue(mockInstructor);

      const result = await reorderLessons(invalidInput);

      expect(result).toEqual({
        success: false,
        message: "Invalid input data",
      });
    });

    it("should fail if module not found or no permission", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await reorderLessons(reorderInput);

      expect(result).toEqual({
        success: false,
        message: "Module not found or you don't have permission to modify it",
      });
    });
  });

  describe("getModuleLessons", () => {
    it("should return lessons for authorized user", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(mockModule);
      (db.lesson.findMany as jest.Mock).mockResolvedValue(mockLessons);

      const result = await getModuleLessons("module123");

      expect(result).toEqual(mockLessons);
      expect(db.lesson.findMany).toHaveBeenCalledWith({
        where: { moduleId: "module123" },
        orderBy: { order: "asc" },
      });
    });

    it("should throw error if module not found or no access", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.module.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getModuleLessons("module123")).rejects.toThrow(
        "Module not found or access denied"
      );
    });

    it("should throw error on authorization failure", async () => {
      mockAuthorize.mockRejectedValue(new Error("Not authorized"));

      await expect(getModuleLessons("module123")).rejects.toThrow(
        "Not authorized"
      );
    });
  });

  describe("getLesson", () => {
    it("should return lesson for authorized user", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue({
        ...mockLesson,
        module: mockModule,
      });

      const result = await getLesson("lesson123");

      expect(result).toEqual({
        ...mockLesson,
        module: mockModule,
      });
      expect(db.lesson.findFirst).toHaveBeenCalledWith({
        where: {
          id: "lesson123",
          module: {
            course: {
              instructorId: "instructor123",
            },
          },
        },
        include: {
          module: {
            include: {
              course: true,
            },
          },
          quizzes: {
            include: {
              questions: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    it("should throw error if lesson not found or no access", async () => {
      mockAuthorize.mockResolvedValue(mockInstructor);
      (db.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getLesson("lesson123")).rejects.toThrow(
        "Lesson not found or access denied"
      );
    });

    it("should throw error on authorization failure", async () => {
      mockAuthorize.mockRejectedValue(new Error("Not authorized"));

      await expect(getLesson("lesson123")).rejects.toThrow("Not authorized");
    });
  });
});
