import { db } from "@/lib/db";
import { unstable_cache, revalidateTag } from "next/cache";

export interface HomePageStats {
  courses: number;
  students: number;
  certificates: number;
  successRate: number;
}

// Format numbers with K, M suffixes
export function formatStatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

// Format success rate as percentage
export function formatSuccessRate(rate: number): string {
  return Math.round(rate) + "%";
}

async function getStatsFromDatabase(): Promise<HomePageStats> {
  try {
    // Run all queries in parallel for better performance
    const [coursesCount, studentsCount, certificatesCount, enrollmentStats] =
      await Promise.all([
        // Count all courses (DRAFT and PUBLISHED)
        db.course.count(),

        // Count all users (STUDENT and INSTRUCTOR roles)
        db.user.count({
          where: {
            role: {
              in: ["STUDENT", "INSTRUCTOR"],
            },
          },
        }),

        // Count completed enrollments (certificates)
        db.enrollment.count({
          where: {
            completedAt: {
              not: null,
            },
          },
        }),

        // Get enrollment statistics for success rate
        db.enrollment
          .aggregate({
            _count: {
              id: true,
            },
            where: {
              completedAt: {
                not: null,
              },
            },
          })
          .then(async (completed) => {
            const total = await db.enrollment.count();
            return {
              completed: completed._count.id,
              total,
            };
          }),
      ]);

    // Calculate success rate
    const successRate =
      enrollmentStats.total > 0
        ? (enrollmentStats.completed / enrollmentStats.total) * 100
        : 0;

    return {
      courses: coursesCount,
      students: studentsCount,
      certificates: certificatesCount,
      successRate,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);

    // Return fallback stats if database query fails
    return {
      courses: 500,
      students: 10000,
      certificates: 2000,
      successRate: 95,
    };
  }
}

// Cache the stats for 5 minutes (300 seconds)
export const getHomePageStats = unstable_cache(
  getStatsFromDatabase,
  ["home-page-stats"],
  {
    revalidate: 300, // 5 minutes
    tags: ["stats"],
  }
);

// Function to manually revalidate stats cache
// This can be called when courses, users, or enrollments are modified
export async function revalidateStats() {
  revalidateTag("stats");
}
