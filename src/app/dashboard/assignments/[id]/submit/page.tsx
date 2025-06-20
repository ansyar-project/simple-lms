import { AssignmentSubmissionForm } from "@/components/assignments/AssignmentSubmissionForm";
import { getAssignmentById, submitAssignment } from "@/actions/assignments";
import { notFound } from "next/navigation";

export default async function AssignmentSubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignmentById(id);
  if (!assignment) return notFound();

  // Only allow submission if assignment exists
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Submit Assignment: {assignment.title}
      </h1>
      <AssignmentSubmissionForm
        assignmentId={assignment.id}
        submissionFormat={assignment.submissionFormat}
        onSubmit={async (data) => {
          await submitAssignment(data);
          // Optionally, show a success message or redirect
        }}
      />
    </div>
  );
}
