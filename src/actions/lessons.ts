"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorize } from "@/lib/authorization";
import {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  type ReorderLessonsInput,
} from "@/lib/validations";

export interface LessonFormState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Create a new lesson
export async function createLesson(
  prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Validate form data
    const validatedFields = createLessonSchema.safeParse({
      moduleId: formData.get("moduleId"),
      title: formData.get("title"),
      content: formData.get("content") || undefined,
      contentType: formData.get("contentType"),
      videoUrl: formData.get("videoUrl") || undefined,
      duration: formData.get("duration")
        ? Number(formData.get("duration"))
        : undefined,
      order: Number(formData.get("order")) || 0,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { moduleId, title, content, contentType, videoUrl, duration, order } =
      validatedFields.data;

    // Verify user owns the module through course
    const moduleData = await db.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId: user.id,
        },
      },
      include: {
        course: true,
      },
    });

    if (!moduleData) {
      return {
        success: false,
        message: "Module not found or you don't have permission to modify it",
      };
    }

    // Get the next order if not provided
    let lessonOrder = order;
    if (order === 0) {
      const lastLesson = await db.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: "desc" },
      });
      lessonOrder = (lastLesson?.order ?? 0) + 1;
    }

    // Create lesson
    await db.lesson.create({
      data: {
        moduleId,
        title,
        content,
        contentType,
        videoUrl,
        duration,
        order: lessonOrder,
      },
    });

    revalidatePath(`/instructor/courses/${moduleData.courseId}`);
    revalidatePath(`/instructor/courses/${moduleData.courseId}/content`);

    return {
      success: true,
      message: "Lesson created successfully",
    };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return {
      success: false,
      message: "Failed to create lesson. Please try again.",
    };
  }
}

// Update an existing lesson
export async function updateLesson(
  prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Validate form data
    const validatedFields = updateLessonSchema.safeParse({
      id: formData.get("id"),
      moduleId: formData.get("moduleId"),
      title: formData.get("title"),
      content: formData.get("content") || undefined,
      contentType: formData.get("contentType"),
      videoUrl: formData.get("videoUrl") || undefined,
      duration: formData.get("duration")
        ? Number(formData.get("duration"))
        : undefined,
      order: formData.get("order") ? Number(formData.get("order")) : undefined,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { id, ...updateData } = validatedFields.data;

    // Verify user owns the lesson through module and course
    const lesson = await db.lesson.findFirst({
      where: {
        id,
        module: {
          course: {
            instructorId: user.id,
          },
        },
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return {
        success: false,
        message: "Lesson not found or you don't have permission to modify it",
      };
    }

    // Update lesson
    await db.lesson.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
    revalidatePath(`/instructor/courses/${lesson.module.courseId}/content`);

    return {
      success: true,
      message: "Lesson updated successfully",
    };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return {
      success: false,
      message: "Failed to update lesson. Please try again.",
    };
  }
}

// Delete a lesson
export async function deleteLesson(lessonId: string): Promise<LessonFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Verify user owns the lesson through module and course
    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId: user.id,
          },
        },
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return {
        success: false,
        message: "Lesson not found or you don't have permission to delete it",
      };
    }

    // Delete lesson
    await db.lesson.delete({
      where: { id: lessonId },
    });

    revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
    revalidatePath(`/instructor/courses/${lesson.module.courseId}/content`);

    return {
      success: true,
      message: "Lesson deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return {
      success: false,
      message: "Failed to delete lesson. Please try again.",
    };
  }
}

// Reorder lessons
export async function reorderLessons(
  input: ReorderLessonsInput
): Promise<LessonFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const validatedFields = reorderLessonsSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid input data",
      };
    }

    const { moduleId, lessonIds } = validatedFields.data;

    // Verify user owns the module through course
    const moduleData = await db.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId: user.id,
        },
      },
      include: {
        course: true,
      },
    });

    if (!moduleData) {
      return {
        success: false,
        message: "Module not found or you don't have permission to modify it",
      };
    }

    // Update lesson orders
    await db.$transaction(
      lessonIds.map((lessonId, index) =>
        db.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 },
        })
      )
    );

    revalidatePath(`/instructor/courses/${moduleData.courseId}`);
    revalidatePath(`/instructor/courses/${moduleData.courseId}/content`);

    return {
      success: true,
      message: "Lessons reordered successfully",
    };
  } catch (error) {
    console.error("Error reordering lessons:", error);
    return {
      success: false,
      message: "Failed to reorder lessons. Please try again.",
    };
  }
}

// Get lessons for a module
export async function getModuleLessons(moduleId: string) {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Verify user owns the module through course
    const moduleData = await db.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId: user.id,
        },
      },
    });

    if (!moduleData) {
      throw new Error("Module not found or access denied");
    }

    const lessons = await db.lesson.findMany({
      where: { moduleId },
      orderBy: { order: "asc" },
    });

    return lessons;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}

// Get a single lesson with details
export async function getLesson(lessonId: string) {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId: user.id,
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

    if (!lesson) {
      throw new Error("Lesson not found or access denied");
    }

    return lesson;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}
