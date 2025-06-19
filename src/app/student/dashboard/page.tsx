import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/actions/enrollment";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ModernCourseCard } from "@/components/course/ModernCourseCard";
import { BookOpen, TrendingUp, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      <h1 className="sr-only" id="student-dashboard-title">
        Student Dashboard
      </h1>
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
          <NeonGradientCard className="bg-white/70 border-blue-100">
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-blue-900">
                Total Courses
              </span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col items-center">
              <NumberTicker
                value={totalCourses}
                className="text-2xl font-bold text-blue-600"
              />
              <p className="text-xs text-muted-foreground">Enrolled courses</p>
            </div>
          </NeonGradientCard>

          <NeonGradientCard className="bg-white/70 border-blue-100">
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-blue-900">
                In Progress
              </span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col items-center">
              <NumberTicker
                value={inProgressCourses}
                className="text-2xl font-bold text-blue-600"
              />
              <p className="text-xs text-muted-foreground">Active learning</p>
            </div>
          </NeonGradientCard>

          <NeonGradientCard className="bg-white/70 border-blue-100">
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-blue-900">
                Completed
              </span>
              <Trophy className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col items-center">
              <NumberTicker
                value={completedCourses}
                className="text-2xl font-bold text-blue-600"
              />
              <p className="text-xs text-muted-foreground">Courses finished</p>
            </div>
          </NeonGradientCard>

          <NeonGradientCard className="bg-white/70 border-blue-100">
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-blue-900">
                Total Lessons
              </span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col items-center">
              <NumberTicker
                value={totalLessons}
                className="text-2xl font-bold text-blue-600"
              />
              <p className="text-xs text-muted-foreground">Learning content</p>
            </div>
          </NeonGradientCard>
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
                <ModernCourseCard
                  key={enrollment.id}
                  title={enrollment.course.title}
                  instructor={enrollment.course.instructor.name || ""}
                  modules={enrollment.course._count.modules}
                  progress={enrollment.progress}
                  enrolledAt={new Date(enrollment.enrolledAt)}
                  completedAt={
                    enrollment.completedAt
                      ? new Date(enrollment.completedAt)
                      : undefined
                  }
                  onStart={() => {
                    window.location.href = `/courses/${enrollment.course.id}/learn`;
                  }}
                  onView={() => {
                    window.location.href = `/courses/${enrollment.course.id}`;
                  }}
                  featured={enrollment.progress === 100}
                />
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
    </main>
  );
}
