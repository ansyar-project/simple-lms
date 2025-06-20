import { FC } from "react";
import { Assignment } from "@/types";

interface AssignmentListProps {
  assignments: Assignment[];
  onSelect?: (assignment: Assignment) => void;
}

export const AssignmentList: FC<AssignmentListProps> = ({
  assignments,
  onSelect,
}) => {
  if (!assignments.length) {
    return <div className="text-muted-foreground">No assignments found.</div>;
  }
  return (
    <ul className="divide-y divide-border rounded border">
      {assignments.map((assignment) => (
        <li
          key={assignment.id}
          className="p-4 hover:bg-muted cursor-pointer"
          onClick={() => onSelect?.(assignment)}
        >
          <div className="font-semibold text-lg">{assignment.title}</div>
          <div className="text-sm text-muted-foreground">
            Due:{" "}
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString()
              : "No due date"}
          </div>
          <div className="text-xs mt-1">Max Score: {assignment.maxScore}</div>
        </li>
      ))}
    </ul>
  );
};
