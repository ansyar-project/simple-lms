import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsSection from "@/components/home/StatsSection";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import {
  getHomePageStats,
  formatStatNumber,
  formatSuccessRate,
} from "@/actions/stats";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we use server actions
export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />

      <div className="relative z-10">
        {/* Hero Section */}
        <section
          className="container mx-auto px-4 py-20"
          aria-labelledby="home-hero-title"
        >
          <h1 id="home-hero-title" className="sr-only">
            LMS - Learning Management System
          </h1>
          <HeroSection />
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

        {/* Features Section */}
        <section
          className="container mx-auto px-4 py-24"
          aria-labelledby="features-title"
        >
          <h2 id="features-title" className="sr-only">
            Platform Features
          </h2>
          <FeaturesSection features={features} />
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent mb-4"></div>

        {/* Stats Section */}
        <section
          className="bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative"
          aria-labelledby="stats-title"
        >
          <h2 id="stats-title" className="sr-only">
            Platform Statistics
          </h2>
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <StatsSection stats={stats} />
          </div>
        </section>
      </div>
    </main>
  );
}
