import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInstructorDashboard } from "@/actions/courses";
import { BookOpen, Users, DollarSign, PlusCircle } from "lucide-react";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  const dashboardData = await getInstructorDashboard();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.publishedCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Students
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.totalEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/instructor/courses/new">
            <Button className="w-full justify-start h-auto p-4">
              <PlusCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Create New Course</div>
                <div className="text-sm text-gray-300">
                  Start building a new course
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/instructor/courses">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Manage Courses</div>
                <div className="text-sm text-gray-600">
                  Edit and organize your courses
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/instructor/analytics">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-gray-600">
                  Track performance metrics
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Courses
            </h2>
            <Link href="/instructor/courses">
              <Button variant="ghost" size="sm">
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
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
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

        {/* Recent Enrollments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Enrollments
          </h2>
          <div className="space-y-3">
            {dashboardData.recentEnrollments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No enrollments yet.
              </p>
            ) : (
              dashboardData.recentEnrollments.slice(0, 5).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {enrollment.user.name || enrollment.user.email}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Enrolled{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
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
  );
}
