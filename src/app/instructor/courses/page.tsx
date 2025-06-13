import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CoursesList } from "@/components/course/CoursesList";
import { CourseListSkeleton } from "@/components/course/CourseListSkeleton";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function InstructorCoursesPage({ searchParams }: PageProps) {
  // Await searchParams to ensure we have the resolved values
  const resolvedSearchParams = await searchParams;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600">
            Manage and track your course content and student progress
          </p>
        </div>
        <Link href="/instructor/courses/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Courses List */}
      <Suspense fallback={<CourseListSkeleton />}>
        <CoursesList searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
