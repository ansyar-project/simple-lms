import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Clock, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CourseEnrollButton } from "@/components/course/CourseEnrollButton";
import { CourseStatus } from "@prisma/client";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

interface CoursesCatalogProps {
  readonly searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function CoursesCatalog({
  searchParams,
}: CoursesCatalogProps) {
  const session = await auth();
  const { search, category } = await searchParams;
  // Build where clause for filtering
  const whereClause: {
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      description?: { contains: string; mode: "insensitive" };
    }>;
    category?: {
      slug: string;
    };
  } = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    whereClause.category = {
      slug: category,
    };
  }

  // Fetch published courses
  const courses = await db.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
      ...whereClause,
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              duration: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get user enrollments if logged in
  let userEnrollments: string[] = [];
  if (session?.user?.id) {
    const enrollments = await db.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    });
    userEnrollments = enrollments.map((e) => e.courseId);
  }

  // Get unique categories
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      <h1 className="text-3xl font-bold mb-6 sr-only">Courses Catalog</h1>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            width="100%"
            height="100%"
            viewBox="0 0 700 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <circle
                cx="117.5"
                cy="117.5"
                r="317.5"
                fill="#3b82f6"
                fillOpacity="0.1"
              />
              <circle
                cx="582.5"
                cy="582.5"
                r="217.5"
                fill="#1e40af"
                fillOpacity="0.15"
              />
              <circle
                cx="350"
                cy="350"
                r="150"
                fill="#60a5fa"
                fillOpacity="0.05"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent mb-4">
            Course Catalog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and enroll in courses to advance your skills and unlock new
            opportunities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                defaultValue={search ?? ""}
                className="pl-10 bg-white/70 backdrop-blur-sm border-blue-100"
                name="search"
              />
            </div>
            <Button
              type="submit"
              className="sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Search
            </Button>
          </div>

          {/* Category Filters */}
          <div className="overflow-x-auto">
            <div className="flex gap-2">
              <Link
                href="/courses"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  !category
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-blue-100"
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    category === cat.slug
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-blue-100"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const totalLessons = course.modules.reduce(
                (total, module) => total + module.lessons.length,
                0
              );
              const totalDuration = course.modules.reduce(
                (total, module) =>
                  total +
                  module.lessons.reduce(
                    (moduleTotal, lesson) =>
                      moduleTotal + (lesson.duration ?? 0),
                    0
                  ),
                0
              );
              const formattedDuration = Math.round(totalDuration / 60); // Convert to minutes

              return (
                <Card
                  key={course.id}
                  className="overflow-hidden bg-white/70 backdrop-blur-sm border border-blue-100 hover:shadow-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {course.thumbnail && (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        {course.category.name}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="line-clamp-2 text-lg">
                        {course.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{totalLessons} lessons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formattedDuration}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course._count.enrollments} students</span>
                          </div>
                        </div>
                      </div>

                      {/* Instructor */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {" "}
                          {course.instructor.avatar ? (
                            <Image
                              src={course.instructor.avatar}
                              alt={course.instructor.name ?? "Instructor"}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {course.instructor.name?.charAt(0) ?? "I"}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {course.instructor.name}
                        </span>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {!course.price || course.price.toNumber() === 0
                            ? "Free"
                            : `$${course.price.toString()}`}
                        </span>
                      </div>

                      {/* Enroll Button */}
                      <div className="space-y-2">
                        {userEnrollments.includes(course.id) ? (
                          <div className="flex gap-2">
                            <Link
                              href={`/courses/${course.id}/learn`}
                              className="flex-1"
                            >
                              <Button className="w-full">
                                Continue Learning
                              </Button>
                            </Link>
                            <Link href={`/courses/${course.id}`}>
                              <Button variant="outline">View Details</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {" "}
                            <div className="flex-1">
                              <CourseEnrollButton
                                courseId={course.id}
                                isLoggedIn={!!session?.user}
                                isStudent={session?.user?.role === "STUDENT"}
                              />
                            </div>
                            <Link href={`/courses/${course.id}`}>
                              <Button variant="outline">View Details</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}{" "}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-blue-100">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                {search || category
                  ? "Try adjusting your search or filter criteria."
                  : "No courses are available at the moment."}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
