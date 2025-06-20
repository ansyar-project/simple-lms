"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    throw new Error("Only students can enroll in courses");
  }

  try {
    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    } // Check if course exists and is published
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, price: true, title: true },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.status !== "PUBLISHED") {
      throw new Error("Course is not published");
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        enrolledAt: new Date(),
        progress: 0,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);

    return { success: true, enrollment };
  } catch (error) {
    console.error("Enrollment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to enroll in course"
    );
  }
}

export async function unenrollFromCourse(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    // Check if enrolled
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      throw new Error("Not enrolled in this course");
    }

    // Delete related progress records
    await db.lessonProgress.deleteMany({
      where: {
        userId: session.user.id,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
      },
    });

    // Delete enrollment
    await db.enrollment.delete({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);

    return { success: true };
  } catch (error) {
    console.error("Unenrollment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to unenroll from course"
    );
  }
}

export async function getEnrollmentStatus(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { enrolled: false, canEnroll: true };
  }

  try {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
      select: {
        enrolledAt: true,
        progress: true,
        completedAt: true,
      },
    });

    return {
      enrolled: !!enrollment,
      canEnroll: session.user.role === "STUDENT",
      enrollment,
    };
  } catch (error) {
    console.error("Get enrollment status error:", error);
    return { enrolled: false, canEnroll: true };
  }
}

export async function getEnrolledCourses() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const enrollments = await db.enrollment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    duration: true,
                  },
                },
              },
            },
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return enrollments;
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    throw new Error("Failed to fetch enrolled courses");
  }
}

export async function getCourseProgress(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    // Get enrollment
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      throw new Error("Not enrolled in this course");
    }

    // Get course with modules and lessons
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                order: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // Get lesson progress
    const lessonProgress = await db.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
      },
    });

    // Calculate progress
    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );
    const completedLessons = lessonProgress.filter((p) => p.completed).length;
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    return {
      enrollment,
      course: {
        ...course,
        // Convert Decimal to number for client component compatibility
        price: course.price ? course.price.toNumber() : null,
      },
      lessonProgress: lessonProgress.reduce((acc, progress) => {
        acc[progress.lessonId] = progress;
        return acc;
      }, {} as Record<string, (typeof lessonProgress)[0]>),
      stats: {
        totalLessons,
        completedLessons,
        progressPercentage,
      },
    };
  } catch (error) {
    console.error("Get course progress error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch course progress"
    );
  }
}
