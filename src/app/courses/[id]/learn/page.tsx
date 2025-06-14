import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseProgress } from "@/actions/enrollment";
import { requireCourseAccess } from "@/lib/authorization";
import { CourseLearningInterface } from "@/components/course/CourseLearningInterface";

interface CourseLearnPageProps {
  params: { id: string };
  searchParams: { lesson?: string };
}

export default async function CourseLearnPage({
  params,
  searchParams,
}: CourseLearnPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    // Check if user has access to this course
    await requireCourseAccess(session.user.id, params.id);

    // Get course progress and content
    const courseData = await getCourseProgress(params.id);

    if (!courseData) {
      notFound();
    }

    return (
      <CourseLearningInterface
        courseData={courseData}
        currentLessonId={searchParams.lesson}
        userId={session.user.id}
      />
    );
  } catch (error) {
    console.error("Course access error:", error);

    if (error instanceof Error && error.message.includes("Not enrolled")) {
      redirect(`/courses/${params.id}`);
    }

    redirect("/courses");
  }
}
