import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/actions/courses";
import {
  ArrowLeft,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Plus,
} from "lucide-react";

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePage({
  params,
}: Readonly<CoursePageProps>) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  const statusColors = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
  };

  return (
    <main
      className="max-w-6xl mx-auto space-y-6"
      aria-labelledby="instructor-course-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/instructor/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/instructor/courses/${course.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          </Link>
        </div>
      </div>
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="md:flex">
          {/* Course Thumbnail */}
          <div className="md:w-1/3">
            <div className="relative h-64 w-full">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Course Details */}
          <div className="md:w-2/3 p-6">
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    statusColors[course.status]
                  }`}
                >
                  {course.status}
                </span>
                <p className="text-sm text-gray-500">
                  Created{" "}
                  {new Date(course.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Title and Description */}
              <div>
                <h1
                  id="instructor-course-title"
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                >
                  {course.title}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-gray-600">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Modules</p>
                    <p className="font-semibold">
                      {course._count?.modules ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="font-semibold">
                      {course._count?.enrollments ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-semibold">
                      {course.price ? `$${course.price}` : "Free"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold">{course.category.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Course Content Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Course Content
            </h2>
            <Link href={`/instructor/courses/${course.id}/content`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Manage Content
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {course.modules && course.modules.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {course.modules.length} Module
                    {course.modules.length > 1 ? "s" : ""} Created
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Manage your course modules and lessons.
                  </p>
                  <Link href={`/instructor/courses/${course.id}/content`}>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Course Content
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No modules yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start building your course by adding modules and lessons.
                </p>
                <Link href={`/instructor/courses/${course.id}/content`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Module
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Students Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Enrolled Students ({course._count?.enrollments ?? 0})
          </h2>
        </div>

        <div className="p-6">
          {course.enrollments && course.enrollments.length > 0 ? (
            <div className="space-y-3">
              {course.enrollments.slice(0, 10).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">
                        {enrollment.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {enrollment.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {enrollment.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Enrolled{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {course.enrollments.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Students
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No students enrolled yet
                </h3>{" "}
                <p className="text-gray-500">
                  When students enroll in your course, they&apos;ll appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
