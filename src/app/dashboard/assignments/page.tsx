import { AssignmentList } from "@/components/assignments/AssignmentList";
import { getAssignmentsForStudent } from "@/actions/assignments";
import { getCurrentUser } from "@/lib/authorization";
import { Assignment } from "@/types";
import Link from "next/link";

// This is a placeholder. In a real app, you would fetch assignments for all lessons in enrolled courses.
export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) return <div>Please log in to view your assignments.</div>;

  // TODO: Replace with actual logic to get all assignments for the student
  const assignments: Assignment[] = await getAssignmentsForStudent();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
      <AssignmentList assignments={assignments} />
      {/* TODO: Add logic to select and view assignment details, and submit */}
      <div className="mt-8 text-sm text-muted-foreground">
        Need help?{" "}
        <Link href="/help" className="underline">
          Visit the help center
        </Link>
      </div>
    </div>
  );
}
