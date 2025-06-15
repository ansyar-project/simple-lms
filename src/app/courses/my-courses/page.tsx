import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/actions/enrollment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trophy, Play, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

export default async function MyCourses() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const enrolledCourses = await getEnrolledCourses();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">
          Track your progress and continue learning
        </p>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="space-y-6">
          {/* Filter/Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {enrolledCourses.length} course
                {enrolledCourses.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Link href="/courses">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse More Courses
              </Button>
            </Link>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => {
              const totalLessons = enrollment.course.modules.reduce(
                (total, module) => total + module.lessons.length,
                0
              );
              const totalDuration = enrollment.course.modules.reduce(
                (total, module) =>
                  total +
                  module.lessons.reduce(
                    (moduleTotal, lesson) =>
                      moduleTotal + (lesson.duration ?? 0),
                    0
                  ),
                0
              );

              return (
                <Card
                  key={enrollment.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {enrollment.course.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mb-3">
                          <span>by {enrollment.course.instructor.name}</span>
                        </CardDescription>
                        <div className="flex items-center gap-2">
                          {" "}
                          <Badge variant="secondary" className="text-xs">
                            {enrollment.course.category.name}
                          </Badge>
                          {enrollment.completedAt && (
                            <Badge
                              variant="default"
                              className="bg-green-500 text-xs"
                            >
                              <Trophy className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{Math.round(totalDuration / 60)} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {enrollment.course._count.enrollments} students
                        </span>
                      </div>
                    </div>

                    {/* Enrollment Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Enrolled{" "}
                        {formatDistanceToNow(new Date(enrollment.enrolledAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {enrollment.completedAt && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Trophy className="h-4 w-4" />
                        <span>
                          Completed{" "}
                          {formatDistanceToNow(
                            new Date(enrollment.completedAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {" "}
                      <Link
                        href={`/courses/${enrollment.course.id}/learn`}
                        className="flex-1"
                      >
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          {(() => {
                            if (enrollment.progress === 0)
                              return "Start Learning";
                            if (enrollment.progress === 100) return "Review";
                            return "Continue";
                          })()}
                        </Button>
                      </Link>
                      <Link href={`/courses/${enrollment.course.id}`}>
                        <Button variant="outline" size="icon">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">No Enrolled Courses</CardTitle>
            <CardDescription className="mb-6">
              You haven&apos;t enrolled in any courses yet. Start your learning
              journey today!
            </CardDescription>
            <Link href="/courses">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
