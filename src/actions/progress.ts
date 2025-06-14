"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireEnrollment } from "@/lib/authorization";

export async function markLessonComplete(lessonId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    // Get lesson and course info
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Check if user is enrolled in the course
    await requireEnrollment(session.user.id, lesson.module.courseId);

    // Create or update lesson progress
    const lessonProgress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Update course progress
    await updateCourseProgress(session.user.id, lesson.module.courseId);

    revalidatePath(`/courses/${lesson.module.courseId}`);
    revalidatePath("/dashboard");

    return { success: true, lessonProgress };
  } catch (error) {
    console.error("Mark lesson complete error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to mark lesson as complete"
    );
  }
}

export async function markLessonIncomplete(lessonId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    // Get lesson and course info
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Check if user is enrolled in the course
    await requireEnrollment(session.user.id, lesson.module.courseId);

    // Update lesson progress
    const lessonProgress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: false,
        completedAt: null,
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completed: false,
        completedAt: null,
      },
    });

    // Update course progress
    await updateCourseProgress(session.user.id, lesson.module.courseId);

    revalidatePath(`/courses/${lesson.module.courseId}`);
    revalidatePath("/dashboard");

    return { success: true, lessonProgress };
  } catch (error) {
    console.error("Mark lesson incomplete error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to mark lesson as incomplete"
    );
  }
}

async function updateCourseProgress(userId: string, courseId: string) {
  try {
    // Get total lessons in the course
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    if (totalLessons === 0) {
      return;
    }

    // Get completed lessons count
    const completedLessons = await db.lessonProgress.count({
      where: {
        userId: userId,
        completed: true,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
      },
    });

    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100
    );
    const isCompleted = progressPercentage === 100;

    // Update enrollment progress
    await db.enrollment.update({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
      data: {
        progress: progressPercentage,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("Update course progress error:", error);
    // Don't throw error here to avoid breaking the main lesson progress flow
  }
}

export async function getLessonProgress(lessonId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const lessonProgress = await db.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
    });

    return lessonProgress;
  } catch (error) {
    console.error("Get lesson progress error:", error);
    return null;
  }
}

export async function getModuleProgress(moduleId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    // Get all lessons in the module
    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    });

    if (!moduleData) {
      return null;
    }

    const totalLessons = moduleData.lessons.length;

    if (totalLessons === 0) {
      return {
        moduleId,
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
      };
    }

    // Get completed lessons count
    const completedLessons = await db.lessonProgress.count({
      where: {
        userId: session.user.id,
        completed: true,
        lessonId: {
          in: moduleData.lessons.map((lesson) => lesson.id),
        },
      },
    });

    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100
    );

    return {
      moduleId,
      totalLessons,
      completedLessons,
      progressPercentage,
    };
  } catch (error) {
    console.error("Get module progress error:", error);
    return null;
  }
}
