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
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const enrolledCourses = await getEnrolledCourses();

  // Calculate dashboard stats
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(
    (e) => e.progress === 100
  ).length;
  const inProgressCourses = enrolledCourses.filter(
    (e) => e.progress > 0 && e.progress < 100
  ).length;
  const totalLessons = enrolledCourses.reduce((total, enrollment) => {
    return (
      total +
      enrollment.course.modules.reduce((moduleTotal, module) => {
        return moduleTotal + module.lessons.length;
      }, 0)
    );
  }, 0);

  // Get recently enrolled courses
  const recentCourses = enrolledCourses.slice(0, 3);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
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
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent mb-4">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Continue your learning journey and track your progress
          </p>
        </div>{" "}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalCourses}
              </div>
              <p className="text-xs text-muted-foreground">Enrolled courses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {inProgressCourses}
              </div>
              <p className="text-xs text-muted-foreground">Active learning</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {completedCourses}
              </div>
              <p className="text-xs text-muted-foreground">Courses finished</p>{" "}
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Lessons
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalLessons}
              </div>
              <p className="text-xs text-muted-foreground">Learning content</p>
            </CardContent>
          </Card>
        </div>
        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Continue Learning
              </h2>
              <Link href="/courses/my-courses">
                <Button
                  variant="outline"
                  className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90"
                >
                  View All Courses
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {enrollment.course.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <span>by {enrollment.course.instructor.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {enrollment.course._count.modules} modules
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Enrolled{" "}
                          {formatDistanceToNow(
                            new Date(enrollment.enrolledAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                      {enrollment.completedAt && (
                        <Badge variant="default" className="bg-green-500">
                          <Trophy className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/courses/${enrollment.course.id}/learn`}
                        className="flex-1"
                      >
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          {enrollment.progress === 0
                            ? "Start Learning"
                            : "Continue"}
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
              ))}
            </div>
          </div>
        )}
        {/* Empty State */}
        {enrolledCourses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              {" "}
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No Courses Yet</CardTitle>
              <CardDescription className="mb-6">
                Start your learning journey by enrolling in your first course
              </CardDescription>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
