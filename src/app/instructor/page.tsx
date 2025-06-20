import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInstructorDashboard } from "@/actions/courses";
import { BookOpen, Users, PlusCircle } from "lucide-react";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/magicui/animated-list";
import { File, Folder, Tree } from "@/components/magicui/file-tree";
import { ProgressChart } from "@/components/analytics/Charts";
import { DashboardWidgetsSheet } from "@/components/dashboard/DashboardWidgetsSheet";
import {
  DashboardBentoGrid,
  StatsBentoItem,
  ListBentoItem,
  ChartBentoItem,
} from "@/components/dashboard/DashboardBentoGrid";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

// Helper function to get status badge styles
function getStatusBadgeStyles(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-800";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function InstructorDashboardPage() {
  const dashboardData = await getInstructorDashboard();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      <h1 className="sr-only">Instructor Dashboard</h1>
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
            Instructor Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your courses and track your teaching progress
          </p>

          {/* Mobile Dashboard Menu */}
          <div className="mt-6 flex justify-center md:hidden">
            <DashboardWidgetsSheet
              title="Teaching Overview"
              description="Your course management and student metrics"
              triggerLabel="View Dashboard"
            >
              {" "}
              <div className="space-y-4">
                <StatsBentoItem
                  title="Total Courses"
                  value={dashboardData.stats.totalCourses}
                  icon="BookOpen"
                  description="All created courses"
                  trend="neutral"
                />
                <StatsBentoItem
                  title="Published"
                  value={dashboardData.stats.publishedCourses}
                  icon="BookOpen"
                  description="Live courses"
                  trend="up"
                />
                <StatsBentoItem
                  title="Total Students"
                  value={dashboardData.stats.totalEnrollments}
                  icon="Users"
                  description="Enrolled learners"
                  trend="up"
                />
                <StatsBentoItem
                  title="Revenue"
                  value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
                  icon="DollarSign"
                  description="Total earnings"
                  trend="up"
                />
              </div>
            </DashboardWidgetsSheet>
          </div>
        </div>

        <div className="space-y-6">
          {/* Desktop Bento Grid Layout */}
          <div className="hidden md:block">
            {" "}
            <DashboardBentoGrid>
              <StatsBentoItem
                title="Total Courses"
                value={dashboardData.stats.totalCourses}
                icon="BookOpen"
                description="All created courses"
                trend="neutral"
              />
              <StatsBentoItem
                title="Published"
                value={dashboardData.stats.publishedCourses}
                icon="BookOpen"
                description="Live courses"
                trend="up"
              />
              <StatsBentoItem
                title="Total Students"
                value={dashboardData.stats.totalEnrollments}
                icon="Users"
                description="Enrolled learners"
                trend="up"
              />
              <StatsBentoItem
                title="Revenue"
                value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
                icon="DollarSign"
                description="Total earnings"
                trend="up"
              />
            </DashboardBentoGrid>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2 sm:mb-0">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/instructor/courses/new">
                <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <PlusCircle className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Create New Course</div>
                    <div className="text-sm text-blue-100">
                      Start building a new course
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/instructor/courses">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Courses</div>
                    <div className="text-sm text-gray-500">
                      Edit and organize your courses
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/instructor/students">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90"
                >
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Students</div>
                    <div className="text-sm text-gray-500">
                      See enrolled students
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Courses and Enrollments Bento Grid */}
          <DashboardBentoGrid className="grid-cols-1 lg:grid-cols-2">
            <ListBentoItem
              title="Recent Courses"
              description="Your latest course creations"
            >
              <div className="space-y-3">
                {dashboardData.recentCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No courses yet. Create your first course!
                  </p>
                ) : (
                  <AnimatedList>
                    {dashboardData.recentCourses.map((course) => (
                      <AnimatedListItem key={course.id}>
                        <div className="flex items-center justify-between p-3 border border-blue-100 rounded-lg hover:bg-white/50 transition-all duration-300">
                          <div className="flex-1 min-w-0">
                            <Link href={`/instructor/courses/${course.id}`}>
                              <h3 className="font-medium text-gray-900 truncate hover:text-blue-600">
                                {course.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500">
                              {course._count?.modules ?? 0} modules •{" "}
                              {course._count?.enrollments ?? 0} students
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyles(
                                course.status
                              )}`}
                            >
                              {course.status}
                            </span>
                          </div>
                        </div>
                      </AnimatedListItem>
                    ))}
                  </AnimatedList>
                )}
                <div className="mt-4 text-center">
                  <Link href="/instructor/courses">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50"
                    >
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </ListBentoItem>

            <ListBentoItem
              title="Recent Enrollments"
              description="Latest student enrollments"
            >
              <div className="space-y-3">
                {dashboardData.recentEnrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No enrollments yet.
                  </p>
                ) : (
                  dashboardData.recentEnrollments
                    .slice(0, 5)
                    .map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 border border-blue-100 rounded-lg hover:bg-white/50 transition-all duration-300"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {enrollment.user.name ?? enrollment.user.email}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Enrolled in {enrollment.course.title} on{" "}
                            {new Date(
                              enrollment.enrolledAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {Math.round(enrollment.progress * 100)}% Complete
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </ListBentoItem>
          </DashboardBentoGrid>

          {/* Course Structure and Analytics Bento Grid */}
          <DashboardBentoGrid className="grid-cols-1 lg:grid-cols-2">
            <ListBentoItem
              title="Course Content Structure"
              description="Visual course organization"
            >
              <div className="flex justify-center">
                <Tree className="w-full max-w-md">
                  <Folder element="Courses" value="courses-root">
                    {dashboardData.recentCourses.map((course) => (
                      <Folder
                        key={course.id}
                        element={course.title}
                        value={course.id}
                      >
                        <File value={course.id + "-modules"}>
                          modules: {course._count?.modules ?? 0}
                        </File>
                        <File value={course.id + "-students"}>
                          students: {course._count?.enrollments ?? 0}
                        </File>
                      </Folder>
                    ))}
                  </Folder>
                </Tree>
              </div>
            </ListBentoItem>

            <ChartBentoItem
              title="Course Enrollment Trends"
              description="Analytics overview"
            >
              <ProgressChart
                title=""
                data={dashboardData.recentEnrollments.reduce(
                  (acc, enrollment) => {
                    const date = new Date(enrollment.enrolledAt)
                      .toISOString()
                      .split("T")[0];
                    const found = acc.find((item) => item.date === date);
                    if (found) {
                      found.coursesStudied += 1;
                    } else {
                      acc.push({ date, coursesStudied: 1 });
                    }
                    return acc;
                  },
                  [] as { date: string; coursesStudied: number }[]
                )}
                dataKey="coursesStudied"
                color="#2563eb"
                type="line"
                height={240}
              />
            </ChartBentoItem>
          </DashboardBentoGrid>
        </div>
      </div>
    </main>
  );
}
