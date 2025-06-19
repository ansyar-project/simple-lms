import { Suspense } from "react";
import { getCurrentUser } from "@/lib/authorization";
import { redirect } from "next/navigation";
import { StudentAnalyticsDashboard } from "@/components/analytics/StudentAnalyticsDashboard";
import { Loader2 } from "lucide-react";

export default async function StudentAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  return (
    <main
      className="container mx-auto px-4 py-8"
      aria-labelledby="analytics-title"
    >
      <h1 id="analytics-title" className="sr-only">
        Learning Analytics
      </h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading analytics...</span>
          </div>
        }
      >
        <StudentAnalyticsDashboard />
      </Suspense>
    </main>
  );
}

export const metadata = {
  title: "Learning Analytics | LMS",
  description: "Track your learning progress, achievements, and analytics",
};
