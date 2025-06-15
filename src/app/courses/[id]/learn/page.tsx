import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseProgress } from "@/actions/enrollment";
import { requireCourseAccess } from "@/lib/authorization";
import { CourseLearningInterface } from "@/components/course/CourseLearningInterface";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

interface CourseLearnPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function CourseLearnPage({
  params,
  searchParams,
}: Readonly<CourseLearnPageProps>) {
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    // Check if user has access to this course
    await requireCourseAccess(session.user.id, awaitedParams.id);

    // Get course progress and content
    const courseData = await getCourseProgress(awaitedParams.id);

    if (!courseData) {
      notFound();
    }

    return (
      <CourseLearningInterface
        courseData={courseData}
        currentLessonId={awaitedSearchParams.lesson}
        userId={session.user.id}
      />
    );
  } catch (error) {
    console.error("Course access error:", error);

    if (error instanceof Error && error.message.includes("Not enrolled")) {
      redirect(`/courses/${awaitedParams.id}`);
    }

    redirect("/courses");
  }
}
