import Link from "next/link";
import { Suspense } from "react";
import { PlusCircle } from "lucide-react";
import { CoursesList } from "@/components/course/CoursesList";
import { CourseListSkeleton } from "@/components/course/CourseListSkeleton";
import ThemeBackground from "@/components/ui/ThemeBackground";
import GradientHeading from "@/components/ui/GradientHeading";
import GradientButton from "@/components/ui/GradientButton";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function InstructorCoursesPage({
  searchParams,
}: Readonly<PageProps>) {
  // Await searchParams to ensure we have the resolved values
  const resolvedSearchParams = await searchParams;
  return (
    <ThemeBackground>
      <div className="space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <GradientHeading className="text-4xl md:text-5xl font-bold mb-4">
            My Courses
          </GradientHeading>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Manage and track your course content and student progress
          </p>
          <Link href="/instructor/courses/new">
            <GradientButton size="lg">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Course
            </GradientButton>
          </Link>
        </div>

        {/* Courses List */}
        <div className="container mx-auto px-4">
          <Suspense fallback={<CourseListSkeleton />}>
            <CoursesList searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </div>
    </ThemeBackground>
  );
}
