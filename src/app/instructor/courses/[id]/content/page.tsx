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

  // Explicitly create serializable props
  const props = {
    courseId: String(course.id),
    courseTitle: String(course.title),
  };

  return (
    <main aria-labelledby="course-content-title">
      <h1 id="course-content-title" className="sr-only">
        Course Content Manager
      </h1>
      <CourseContentManager {...props} />
    </main>
  );
}
