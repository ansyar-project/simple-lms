import { CourseForm } from "@/components/course/CourseForm";
import { getCategories } from "@/actions/courses";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewCoursePage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Create New Course
        </h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below to create your new course. You can always
          edit these later.
        </p>
      </div>

      {/* Course Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <CourseForm categories={categories} />
      </div>
    </div>
  );
}
