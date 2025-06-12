import { auth } from "@/lib/auth";
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
  return session?.user || null;
}

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccessCourse(
  userRole: Role,
  isInstructor: boolean,
  isEnrolled: boolean
): boolean {
  if (userRole === "ADMIN") return true;
  if (isInstructor) return true;
  if (userRole === "STUDENT" && isEnrolled) return true;
  return false;
}
