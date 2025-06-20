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
import { ModernCourseCard } from "@/components/course/ModernCourseCard";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardWidgetsSheet } from "@/components/dashboard/DashboardWidgetsSheet";
import {
  DashboardBentoGrid,
  StatsBentoItem,
} from "@/components/dashboard/DashboardBentoGrid";

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
        {" "}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent mb-4">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Continue your learning journey and track your progress
          </p>

          {/* Mobile Dashboard Menu */}
          <div className="mt-6 flex justify-center md:hidden">
            <DashboardWidgetsSheet
              title="Dashboard Overview"
              description="Quick access to your learning stats and progress"
              triggerLabel="View Stats"
            >
              {" "}
              <div className="space-y-4">
                <StatsBentoItem
                  title="Total Courses"
                  value={totalCourses}
                  icon="BookOpen"
                  description="Enrolled courses"
                  trend="neutral"
                />
                <StatsBentoItem
                  title="In Progress"
                  value={inProgressCourses}
                  icon="TrendingUp"
                  description="Active learning"
                  trend="up"
                />
                <StatsBentoItem
                  title="Completed"
                  value={completedCourses}
                  icon="Trophy"
                  description="Courses finished"
                  trend="up"
                />
                <StatsBentoItem
                  title="Total Lessons"
                  value={totalLessons}
                  icon="Clock"
                  description="Learning content"
                  trend="neutral"
                />
              </div>
            </DashboardWidgetsSheet>
          </div>
        </div>
        {/* Desktop Bento Grid Layout */}{" "}
        <div className="hidden md:block mb-8">
          <DashboardBentoGrid>
            <StatsBentoItem
              title="Total Courses"
              value={totalCourses}
              icon="BookOpen"
              description="Enrolled courses"
              trend="neutral"
            />
            <StatsBentoItem
              title="In Progress"
              value={inProgressCourses}
              icon="TrendingUp"
              description="Active learning"
              trend="up"
            />
            <StatsBentoItem
              title="Completed"
              value={completedCourses}
              icon="Trophy"
              description="Courses finished"
              trend="up"
            />
            <StatsBentoItem
              title="Total Lessons"
              value={totalLessons}
              icon="Clock"
              description="Learning content"
              trend="neutral"
            />
          </DashboardBentoGrid>
        </div>{" "}
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
            {/* Mobile: Show in Sheet */}
            <div className="md:hidden">
              <DashboardWidgetsSheet
                title="Recent Courses"
                description="Continue your learning journey"
                triggerLabel="View Courses"
              >
                <div className="space-y-4">
                  {recentCourses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 bg-white/80 rounded-lg border border-blue-200"
                    >
                      <h3 className="font-semibold text-blue-900 mb-2">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Progress: {enrollment.progress}%
                      </p>
                      <div className="flex gap-2">
                        {" "}
                        <Link
                          href={`/courses/${enrollment.course.id}/learn`}
                          className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-3 text-xs font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                          Continue
                        </Link>
                        <Link
                          href={`/courses/${enrollment.course.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardWidgetsSheet>
            </div>
            {/* Desktop: Bento Grid Layout */}{" "}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  courseId={enrollment.course.id}
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
