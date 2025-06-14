import {
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderModulesSchema,
  reorderLessonsSchema,
} from "../validations";

describe("Module Validation Schemas", () => {
  describe("createModuleSchema", () => {
    it("should validate valid module data", () => {
      const validData = {
        courseId: "course_123",
        title: "Introduction to React",
        description: "Learn the basics of React development",
        order: 1,
      };

      const result = createModuleSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate module data without optional description", () => {
      const validData = {
        courseId: "course_123",
        title: "Introduction to React",
        order: 1,
      };

      const result = createModuleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject module with missing required fields", () => {
      const invalidData = {
        title: "Introduction to React",
        order: 1,
      };

      const result = createModuleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.courseId).toContain(
          "Required"
        );
      }
    });

    it("should reject module with title too short", () => {
      const invalidData = {
        courseId: "course_123",
        title: "Ab",
        order: 1,
      };

      const result = createModuleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain(
          "Title must be at least 3 characters"
        );
      }
    });

    it("should reject module with title too long", () => {
      const invalidData = {
        courseId: "course_123",
        title: "A".repeat(101),
        order: 1,
      };

      const result = createModuleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain(
          "Title must be less than 100 characters"
        );
      }
    });

    it("should reject module with negative order", () => {
      const invalidData = {
        courseId: "course_123",
        title: "Introduction to React",
        order: -1,
      };

      const result = createModuleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.order).toContain(
          "Order must be non-negative"
        );
      }
    });

    it("should reject module with description too long", () => {
      const invalidData = {
        courseId: "course_123",
        title: "Introduction to React",
        description: "A".repeat(1001),
        order: 1,
      };

      const result = createModuleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.description).toContain(
          "Description must be less than 1000 characters"
        );
      }
    });
  });

  describe("updateModuleSchema", () => {
    it("should validate module update with id", () => {
      const validData = {
        id: "module_123",
        title: "Updated Module Title",
      };

      const result = updateModuleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject module update without id", () => {
      const invalidData = {
        title: "Updated Module Title",
      };

      const result = updateModuleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.id).toContain("Required");
      }
    });
  });

  describe("reorderModulesSchema", () => {
    it("should validate valid reorder data", () => {
      const validData = {
        courseId: "course_123",
        moduleIds: ["module_1", "module_2", "module_3"],
      };

      const result = reorderModulesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty module ids array", () => {
      const invalidData = {
        courseId: "course_123",
        moduleIds: [],
      };

      const result = reorderModulesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.moduleIds).toContain(
          "At least one module is required"
        );
      }
    });
  });
});

describe("Lesson Validation Schemas", () => {
  describe("createLessonSchema", () => {
    it("should validate valid text lesson data", () => {
      const validData = {
        moduleId: "module_123",
        title: "Introduction to Components",
        content: "<p>This is lesson content</p>",
        contentType: "TEXT",
        order: 1,
      };

      const result = createLessonSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe("TEXT");
      }
    });

    it("should validate valid video lesson data", () => {
      const validData = {
        moduleId: "module_123",
        title: "Video Tutorial",
        contentType: "VIDEO",
        videoUrl: "https://example.com/video.mp4",
        duration: 3600,
        order: 1,
      };

      const result = createLessonSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe("VIDEO");
        expect(result.data.videoUrl).toBe("https://example.com/video.mp4");
      }
    });

    it("should validate quiz lesson type", () => {
      const validData = {
        moduleId: "module_123",
        title: "React Quiz",
        contentType: "QUIZ",
        order: 1,
      };

      const result = createLessonSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe("QUIZ");
      }
    });

    it("should validate assignment lesson type", () => {
      const validData = {
        moduleId: "module_123",
        title: "Build a React App",
        contentType: "ASSIGNMENT",
        order: 1,
      };

      const result = createLessonSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe("ASSIGNMENT");
      }
    });
    it("should reject lesson with missing required fields", () => {
      const invalidData = {
        title: "Introduction to Components",
        contentType: "TEXT",
        order: 1,
      };

      const result = createLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.moduleId).toContain(
          "Required"
        );
      }
    });

    it("should reject lesson with invalid content type", () => {
      const invalidData = {
        moduleId: "module_123",
        title: "Introduction to Components",
        contentType: "INVALID_TYPE",
        order: 1,
      };

      const result = createLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.contentType).toBeDefined();
      }
    });

    it("should reject lesson with invalid video URL", () => {
      const invalidData = {
        moduleId: "module_123",
        title: "Video Tutorial",
        contentType: "VIDEO",
        videoUrl: "not-a-valid-url",
        order: 1,
      };

      const result = createLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.videoUrl).toContain(
          "Invalid video URL"
        );
      }
    });

    it("should reject lesson with negative duration", () => {
      const invalidData = {
        moduleId: "module_123",
        title: "Video Tutorial",
        contentType: "VIDEO",
        videoUrl: "https://example.com/video.mp4",
        duration: -100,
        order: 1,
      };

      const result = createLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.duration).toContain(
          "Duration must be non-negative"
        );
      }
    });

    it("should reject lesson with title too short", () => {
      const invalidData = {
        moduleId: "module_123",
        title: "Ab",
        contentType: "TEXT",
        order: 1,
      };

      const result = createLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain(
          "Title must be at least 3 characters"
        );
      }
    });
  });

  describe("updateLessonSchema", () => {
    it("should validate lesson update with id", () => {
      const validData = {
        id: "lesson_123",
        title: "Updated Lesson Title",
      };

      const result = updateLessonSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject lesson update without id", () => {
      const invalidData = {
        title: "Updated Lesson Title",
      };

      const result = updateLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.id).toContain("Required");
      }
    });
  });

  describe("reorderLessonsSchema", () => {
    it("should validate valid reorder data", () => {
      const validData = {
        moduleId: "module_123",
        lessonIds: ["lesson_1", "lesson_2", "lesson_3"],
      };

      const result = reorderLessonsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty lesson ids array", () => {
      const invalidData = {
        moduleId: "module_123",
        lessonIds: [],
      };

      const result = reorderLessonsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.lessonIds).toContain(
          "At least one lesson is required"
        );
      }
    });
  });
});
