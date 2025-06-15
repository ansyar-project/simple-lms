import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic rendering since we use auth()
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect students to their specific dashboard
  if (session.user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  // Redirect instructors to their specific dashboard
  if (session.user.role === "INSTRUCTOR") {
    redirect("/instructor");
  }
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

      <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent mb-4">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xl text-gray-600">Role: {session.user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-blue-600">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your learning dashboard is ready!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-blue-600">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent activity yet.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/80 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-blue-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Start your learning journey!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
