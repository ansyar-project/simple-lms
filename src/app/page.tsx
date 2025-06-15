import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsSection from "@/components/home/StatsSection";
import {
  getHomePageStats,
  formatStatNumber,
  formatSuccessRate,
} from "@/actions/stats";

// Force dynamic rendering since we use server actions
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch dynamic stats from database
  const statsData = await getHomePageStats();

  const features = [
    {
      title: "For Students",
      description:
        "Access courses, track your progress, and earn certificates with our comprehensive learning platform.",
      iconName: "BookOpen" as const,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "For Instructors",
      description:
        "Create and manage courses, engage with students, and track analytics with powerful tools.",
      iconName: "Users" as const,
      gradient: "from-blue-500 to-blue-700",
    },
    {
      title: "For Admins",
      description:
        "Manage users, oversee platform operations, and generate comprehensive reports.",
      iconName: "Shield" as const,
      gradient: "from-blue-600 to-blue-800",
    },
  ];

  const stats = [
    {
      iconName: "BookOpen" as const,
      label: "Courses",
      value: formatStatNumber(statsData.courses),
      id: "courses",
    },
    {
      iconName: "Users" as const,
      label: "Students",
      value: formatStatNumber(statsData.students),
      id: "students",
    },
    {
      iconName: "Award" as const,
      label: "Certificates",
      value: formatStatNumber(statsData.certificates),
      id: "certificates",
    },
    {
      iconName: "TrendingUp" as const,
      label: "Success Rate",
      value: formatSuccessRate(statsData.successRate),
      id: "success",
    },
  ];

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
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection features={features} />

        {/* Stats Section */}
        <StatsSection stats={stats} />
      </div>
    </div>
  );
}
