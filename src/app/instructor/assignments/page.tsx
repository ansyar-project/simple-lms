import { Assignment } from "@/types";
import { getCurrentUser } from "@/lib/authorization";
import { getAssignmentsForInstructor } from "@/actions/assignments";
import { InstructorAssignmentsClient } from "./InstructorAssignmentsClient";
import Link from "next/link";

export default async function InstructorAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) return <div>Please log in as an instructor.</div>;
  const assignments: Assignment[] = await getAssignmentsForInstructor(user.id);
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Assignments</h1>
      <InstructorAssignmentsClient
        initialAssignments={assignments}
        instructorId={user.id}
      />
      <div className="mt-8 text-sm text-muted-foreground">
        Need help?{" "}
        <Link href="/help" className="underline">
          Visit the help center
        </Link>
      </div>
    </div>
  );
}
