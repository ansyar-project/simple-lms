import { db } from "@/lib/db";
import { z } from "zod";
import { Assignment, Submission } from "@/types";
import { authorize } from "@/lib/authorization";
import { AssignmentWithSubmissions, SubmissionWithUser } from "@/types";
import { assignmentSchema, submissionSchema } from "@/lib/validations";

// Instructor: Create assignment
export async function createAssignment(
  data: z.infer<typeof assignmentSchema>
): Promise<Assignment> {
  const user = await authorize(["INSTRUCTOR", "ADMIN"]);
  const assignment = await db.assignment.create({
    data: {
      ...data,
      instructorId: user.id,
    },
  });
  return assignment;
}

// Instructor: Update assignment
export async function updateAssignment(
  id: string,
  data: Partial<z.infer<typeof assignmentSchema>>
): Promise<Assignment> {
  await authorize(["INSTRUCTOR", "ADMIN"]);
  const assignment = await db.assignment.update({
    where: { id },
    data,
  });
  return assignment;
}

// Instructor: Delete assignment
export async function deleteAssignment(id: string): Promise<void> {
  await authorize(["INSTRUCTOR", "ADMIN"]);
  await db.assignment.delete({ where: { id } });
}

// Student: Submit assignment
export async function submitAssignment(
  data: z.infer<typeof submissionSchema>
): Promise<Submission> {
  const user = await authorize(["STUDENT"]);
  const submission = await db.submission.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  return submission;
}

// Shared: Get assignments for a lesson
export async function getAssignmentsForLesson(
  lessonId: string
): Promise<Assignment[]> {
  return db.assignment.findMany({ where: { lessonId } });
}

// Shared: Get assignment by id (with submissions)
export async function getAssignmentById(
  id: string
): Promise<AssignmentWithSubmissions | null> {
  return db.assignment.findUnique({
    where: { id },
    include: { submissions: true },
  });
}

// Instructor: Get submissions for an assignment
export async function getSubmissionsForAssignment(
  assignmentId: string
): Promise<SubmissionWithUser[]> {
  return db.submission.findMany({
    where: { assignmentId },
    include: { user: true },
  });
}

// Student: Get my submissions
export async function getMySubmissions(userId: string): Promise<Submission[]> {
  // 'userId' is used directly in the query, so this is not an unused variable error.
  return db.submission.findMany({ where: { userId } });
}

// Get all assignments for an instructor (across all lessons/courses)
export async function getAssignmentsForInstructor(
  instructorId: string
): Promise<Assignment[]> {
  return db.assignment.findMany({ where: { instructorId } });
}

// Get all assignments for a student (across all enrolled lessons/courses)
export async function getAssignmentsForStudent(): Promise<Assignment[]> {
  // This is a placeholder. You should join with enrollments and lessons for real logic.
  return db.assignment.findMany({});
}

// Instructor: Grade a submission
export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback?: string
): Promise<Submission> {
  return db.submission.update({
    where: { id: submissionId },
    data: { score, feedback },
  });
}
