import { notFound } from "next/navigation";
import { getCourseById } from "@/actions/courses";
import CourseContentManager from "@/components/course/CourseContentManager";

interface ContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContentPage({
  params,
}: Readonly<ContentPageProps>) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return (
    <CourseContentManager courseId={course.id} courseTitle={course.title} />
  );
}
