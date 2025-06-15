import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInstructorDashboard } from "@/actions/courses";
import { BookOpen, Users, DollarSign, PlusCircle } from "lucide-react";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  const dashboardData = await getInstructorDashboard();

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
            Instructor Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your courses and track your teaching progress
          </p>
        </div>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData.stats.totalCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.stats.publishedCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData.stats.totalEnrollments}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${dashboardData.stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
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

          {/* Recent Courses and Enrollments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Recent Courses
                </h2>
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
              <div className="space-y-3">
                {dashboardData.recentCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No courses yet. Create your first course!
                  </p>
                ) : (
                  dashboardData.recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 border border-blue-100 rounded-lg hover:bg-white/50 transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <Link href={`/instructor/courses/${course.id}`}>
                          <h3 className="font-medium text-gray-900 truncate hover:text-blue-600">
                            {course.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">
                          {course._count?.modules || 0} modules •{" "}
                          {course._count?.enrollments || 0} students
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            course.status === "PUBLISHED"
                              ? "bg-green-100 text-green-800"
                              : course.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
                Recent Enrollments
              </h2>
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
                            {enrollment.user.name || enrollment.user.email}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
