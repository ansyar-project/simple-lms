"use client";
import { AssignmentList } from "@/components/assignments/AssignmentList";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsForInstructor,
} from "@/actions/assignments";
import { Assignment } from "@/types";
import { useState } from "react";

interface InstructorAssignmentsClientProps {
  initialAssignments: Assignment[];
  instructorId: string;
}

export function InstructorAssignmentsClient({
  initialAssignments,
  instructorId,
}: InstructorAssignmentsClientProps) {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function refreshAssignments() {
    const res = await getAssignmentsForInstructor(instructorId);
    setAssignments(res);
  }

  async function handleCreateOrUpdate(data: {
    title: string;
    description: string;
    maxScore: number;
    submissionFormat: "TEXT" | "FILE" | "BOTH";
    lessonId?: string;
    dueDate?: Date;
  }) {
    setIsLoading(true);
    const cleanData = {
      ...data,
      lessonId: data.lessonId ?? undefined,
      dueDate: data.dueDate ?? undefined,
    };
    if (editing) {
      await updateAssignment(editing.id, cleanData);
      setEditing(null);
    } else {
      await createAssignment(cleanData);
    }
    setIsLoading(false);
    await refreshAssignments();
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this assignment?")) {
      setIsLoading(true);
      await deleteAssignment(id);
      setIsLoading(false);
      await refreshAssignments();
    }
  }

  return (
    <>
      <AssignmentForm
        onSubmit={handleCreateOrUpdate}
        defaultValues={
          editing
            ? {
                ...editing,
                lessonId: editing.lessonId ?? undefined,
                dueDate: editing.dueDate
                  ? new Date(editing.dueDate)
                  : undefined,
              }
            : undefined
        }
        isLoading={isLoading}
      />
      <div className="my-8" />
      <AssignmentList assignments={assignments} onSelect={setEditing} />
      {editing && (
        <button
          className="mt-2 text-red-600 underline"
          onClick={() => handleDelete(editing.id)}
          disabled={isLoading}
        >
          Delete Assignment
        </button>
      )}
    </>
  );
}
