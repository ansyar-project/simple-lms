import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export async function authorize(allowedRoles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard"); // Redirect to appropriate dashboard
  }

  return session.user;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is enrolled in a specific course
 */
export async function isEnrolledInCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    return !!enrollment;
  } catch (error) {
    console.error("Error checking course enrollment:", error);
    return false;
  }
}

/**
 * Require user to be enrolled in course - throws error if not
 */
export async function requireEnrollment(
  userId: string,
  courseId: string
): Promise<void> {
  const enrolled = await isEnrolledInCourse(userId, courseId);
  if (!enrolled) {
    throw new Error("Access denied: Not enrolled in this course");
  }
}

/**
 * Check if user can access course content (enrolled or is instructor)
 */
export async function canAccessCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    // Check if user is the course instructor
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (course?.instructorId === userId) {
      return true;
    }

    // Check if user is enrolled
    return await isEnrolledInCourse(userId, courseId);
  } catch (error) {
    console.error("Error checking course access:", error);
    return false;
  }
}

/**
 * Require user to have access to course - throws error if not
 */
export async function requireCourseAccess(
  userId: string,
  courseId: string
): Promise<void> {
  const hasAccess = await canAccessCourse(userId, courseId);
  if (!hasAccess) {
    throw new Error("Access denied: Not authorized to access this course");
  }
}
