import { AssignmentDetail } from "@/components/assignments/AssignmentDetail";
import { getAssignmentById } from "@/actions/assignments";
import { notFound } from "next/navigation";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignmentById(id);
  if (!assignment) return notFound();
  return (
    <div className="max-w-2xl mx-auto py-8">
      <AssignmentDetail assignment={assignment} />
    </div>
  );
}
