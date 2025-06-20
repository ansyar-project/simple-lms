import { FC } from "react";
import { AssignmentWithSubmissions, SubmissionWithUser } from "@/types";
import { SubmissionGradingForm } from "./SubmissionGradingForm";

interface AssignmentDetailProps {
  assignment: AssignmentWithSubmissions;
  onBack?: () => void;
}

export const AssignmentDetail: FC<AssignmentDetailProps> = ({
  assignment,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <button className="text-sm underline" onClick={onBack}>
        &larr; Back to list
      </button>
      <h2 className="text-2xl font-bold">{assignment.title}</h2>
      <div className="text-muted-foreground">
        Due:{" "}
        {assignment.dueDate
          ? new Date(assignment.dueDate).toLocaleDateString()
          : "No due date"}
      </div>
      <div className="text-sm">Max Score: {assignment.maxScore}</div>
      <div className="prose mt-2">{assignment.description}</div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Submissions</h3>
        {assignment.submissions.length === 0 ? (
          <div className="text-muted-foreground">No submissions yet.</div>
        ) : (
          <ul className="divide-y divide-border rounded border">
            {assignment.submissions.map((submission) => (
              <li key={submission.id} className="p-2">
                <div className="font-medium">
                  {(submission as SubmissionWithUser).user?.name ||
                    "Unknown Student"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </div>
                <div className="text-xs">
                  Score: {submission.score ?? "Ungraded"}
                </div>
                <div className="text-xs">
                  Feedback: {submission.feedback ?? "-"}
                  <SubmissionGradingForm
                    submission={submission as SubmissionWithUser}
                  />
                </div>
                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    Download File
                  </a>
                )}
                {submission.content && (
                  <div className="mt-1 text-sm bg-muted p-2 rounded">
                    {submission.content}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
