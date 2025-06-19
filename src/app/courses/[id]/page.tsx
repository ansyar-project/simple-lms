import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { getEnrollmentStatus } from "@/actions/enrollment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  Trophy,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { CourseEnrollButton } from "@/components/course/CourseEnrollButton";
import { formatDistanceToNow } from "date-fns";
import CourseStructuredData from "@/components/courses/CourseStructuredData";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

interface CourseDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailsPage({
  params,
}: Readonly<CourseDetailsPageProps>) {
  const { id } = await params;
  const session = await auth();
  const course = await db.course.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              duration: true,
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }
  // Get enrollment status
  const enrollmentStatus = await getEnrollmentStatus(id);

  // Calculate course stats
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const totalDuration = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (moduleTotal, lesson) => moduleTotal + (lesson.duration ?? 0),
        0
      ),
    0
  );
  return (
    <>
      <CourseStructuredData
        course={{
          id: course.id,
          title: course.title,
          description: course.description,
          category: { name: course.category.name },
          instructor: { name: course.instructor.name ?? "Unknown" },
          price:
            course.price &&
            typeof course.price === "object" &&
            "toNumber" in course.price
              ? course.price.toNumber()
              : typeof course.price === "number"
              ? course.price
              : null,
          modules: course.modules.map((m) => ({
            lessons: m.lessons.map((l) => ({
              title: l.title,
              duration: l.duration ?? null,
            })),
          })),
          _count: { enrollments: course._count.enrollments },
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: course.title },
        ]}
        className="mb-4"
      />
      <main
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100"
        aria-labelledby="course-title"
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-lg">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{course.category.name}</Badge>{" "}
                    {/* Remove level badge since it's not in schema */}
                    {enrollmentStatus.enrolled && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <h1
                    id="course-title"
                    className="text-3xl font-bold text-gray-900 mb-3"
                  >
                    {course.title}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {course.description}
                  </p>
                </div>
                {/* Course Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(totalDuration / 60)} hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course._count.enrollments} students</span>
                  </div>{" "}
                  {/* Remove rating since it's not in schema */}
                </div>{" "}
                {/* Instructor */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {course.instructor.name}
                    </div>
                    <div className="text-sm text-gray-600">Instructor</div>
                  </div>
                </div>
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="text-center">
                      {" "}
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {course.price && Number(course.price) > 0
                          ? `$${course.price}`
                          : "Free"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Full lifetime access
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enrollmentStatus.enrolled ? (
                      <div className="space-y-3">
                        <Link href={`/courses/${course.id}/learn`}>
                          <Button className="w-full" size="lg">
                            {enrollmentStatus.enrollment?.progress === 0
                              ? "Start Learning"
                              : "Continue Learning"}
                          </Button>
                        </Link>

                        {enrollmentStatus.enrollment && (
                          <div className="text-center text-sm text-gray-600">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Enrolled{" "}
                                {formatDistanceToNow(
                                  new Date(
                                    enrollmentStatus.enrollment.enrolledAt
                                  ),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>

                            {enrollmentStatus.enrollment.progress > 0 && (
                              <div className="flex items-center justify-center gap-1">
                                <Trophy className="h-4 w-4" />
                                <span>
                                  {enrollmentStatus.enrollment.progress}%
                                  completed
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <CourseEnrollButton
                        courseId={course.id}
                        isLoggedIn={!!session?.user}
                        isStudent={session?.user?.role === "STUDENT"}
                        className="w-full"
                      />
                    )}

                    {/* Course Features */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-900 mb-3">
                        This course includes:
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{totalLessons} on-demand lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Full lifetime access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Access on mobile and desktop</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Progress tracking</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>
                    {course.modules.length} modules • {totalLessons} lessons •{" "}
                    {Math.round(totalDuration / 60)} hours total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <h3 className="font-medium text-gray-900">
                            Module {moduleIndex + 1}: {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {module.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {module.lessons.length} lessons •{" "}
                            {Math.round(
                              module.lessons.reduce(
                                (total, lesson) =>
                                  total + (lesson.duration ?? 0),
                                0
                              ) / 60
                            )}{" "}
                            minutes
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                  {lessonIndex + 1}
                                </div>{" "}
                                <div>
                                  <div className="font-medium text-sm">
                                    {lesson.title}
                                  </div>
                                </div>
                              </div>
                              {lesson.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} min
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {" "}
                {/* Remove requirements since it's not in schema */}
                {/* Remove learning objectives since it's not in schema */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const canonicalUrl = `https://simple-lms.ansyar-world.top/courses/${awaitedParams.id}`;
  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
