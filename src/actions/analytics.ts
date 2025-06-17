"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/authorization";

// Types for analytics data
export interface StudentAnalytics {
  learningStats: {
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    totalLessonsCompleted: number;
    totalTimeSpent: number; // in minutes
    currentStreak: number;
    longestStreak: number;
    averageSessionDuration: number;
  };
  recentActivity: Array<{
    date: string;
    coursesStudied: number;
    lessonsCompleted: number;
    timeSpent: number;
  }>;
  courseProgress: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    timeSpent: number;
    lastAccessed: Date;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    points: number;
  }>;
}

export interface InstructorAnalytics {
  overallStats: {
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    averageRating: number;
    totalRevenue: number;
  };
  coursePerformance: Array<{
    courseId: string;
    courseTitle: string;
    enrollments: number;
    completionRate: number;
    averageTimeSpent: number;
    dropOffPoints: Array<{
      lessonId: string;
      lessonTitle: string;
      dropOffRate: number;
    }>;
  }>;
  studentEngagement: Array<{
    date: string;
    activeStudents: number;
    newEnrollments: number;
    completions: number;
  }>;
}

export interface LearningSessionData {
  courseId: string;
  lessonId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

/**
 * Get comprehensive analytics for a student
 */
export async function getStudentAnalytics(): Promise<StudentAnalytics | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
      return null;
    }

    // Get basic learning statistics
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: { userId: user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }); // Calculate lesson progress
    let completedLessons = 0;
    let totalTimeSpent = 0;

    const courseProgress = enrollments.map((enrollment) => {
      let courseLessons = 0;
      let courseCompleted = 0;
      let courseTimeSpent = 0;

      enrollment.course.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          courseLessons++;
          if (lesson.progress.length > 0 && lesson.progress[0].completed) {
            courseCompleted++;
          }
          if (lesson.progress.length > 0) {
            courseTimeSpent += lesson.progress[0].timeSpent || 0;
          }
        });
      });

      completedLessons += courseCompleted;
      totalTimeSpent += courseTimeSpent;

      return {
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        progress: courseLessons > 0 ? courseCompleted / courseLessons : 0,
        timeSpent: Math.round(courseTimeSpent / 60), // Convert to minutes
        lastAccessed: enrollment.enrolledAt,
      };
    });

    // Get learning streak
    const learningStreak = await db.learningStreak.findUnique({
      where: { userId: user.id },
    });

    // Get learning sessions for recent activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = await db.learningSession.findMany({
      where: {
        userId: user.id,
        startTime: { gte: thirtyDaysAgo },
      },
      orderBy: { startTime: "asc" },
    });

    // Group sessions by date for activity chart
    const activityByDate = new Map<
      string,
      {
        coursesStudied: Set<string>;
        lessonsCompleted: number;
        timeSpent: number;
      }
    >();

    recentSessions.forEach((session) => {
      const dateKey = session.startTime.toISOString().split("T")[0];

      if (!activityByDate.has(dateKey)) {
        activityByDate.set(dateKey, {
          coursesStudied: new Set(),
          lessonsCompleted: 0,
          timeSpent: 0,
        });
      }

      const dayActivity = activityByDate.get(dateKey)!;
      dayActivity.coursesStudied.add(session.courseId);
      if (session.completed) {
        dayActivity.lessonsCompleted++;
      }
      dayActivity.timeSpent += session.duration ?? 0;
    });

    const recentActivity = Array.from(activityByDate.entries()).map(
      ([date, activity]) => ({
        date,
        coursesStudied: activity.coursesStudied.size,
        lessonsCompleted: activity.lessonsCompleted,
        timeSpent: activity.timeSpent,
      })
    );

    // Get user achievements
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });

    const achievements = userAchievements.map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      earnedAt: ua.earnedAt,
      points: ua.achievement.points,
    }));

    // Calculate average session duration
    const completedSessions = recentSessions.filter(
      (s) => s.duration && s.duration > 0
    );
    const averageSessionDuration =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0) /
              completedSessions.length
          )
        : 0;

    return {
      learningStats: {
        totalCoursesEnrolled: enrollments.length,
        totalCoursesCompleted: enrollments.filter((e) => e.progress >= 1)
          .length,
        totalLessonsCompleted: completedLessons,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
        currentStreak: learningStreak?.currentStreak ?? 0,
        longestStreak: learningStreak?.longestStreak ?? 0,
        averageSessionDuration,
      },
      recentActivity,
      courseProgress,
      achievements,
    };
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    return null;
  }
}

/**
 * Get analytics for an instructor
 */
export async function getInstructorAnalytics(
  courseId?: string
): Promise<InstructorAnalytics | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "INSTRUCTOR") {
      return null;
    }

    // Base query for instructor's courses
    const courseFilter = courseId
      ? { id: courseId, instructorId: user.id }
      : { instructorId: user.id };

    const courses = await db.course.findMany({
      where: courseFilter,
      include: {
        enrollments: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        modules: {
          include: {
            lessons: {
              include: {
                progress: true,
                learningSessions: true,
              },
            },
          },
        },
      },
    });

    if (courses.length === 0) {
      return null;
    }

    // Calculate overall statistics
    const totalEnrollments = courses.reduce(
      (sum, course) => sum + course.enrollments.length,
      0
    );
    const uniqueStudents = new Set(
      courses.flatMap((course) => course.enrollments.map((e) => e.userId))
    ).size;

    // Calculate course performance metrics
    const coursePerformance = courses.map((course) => {
      const enrollments = course.enrollments.length;

      // Calculate completion rate
      let totalLessons = 0;
      let totalCompletions = 0;
      let totalTimeSpent = 0;
      const lessonDropOffs = new Map<
        string,
        { completed: number; started: number }
      >();

      course.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          totalLessons++;
          const lessonProgress = lesson.progress;
          const completedCount = lessonProgress.filter(
            (p) => p.completed
          ).length;
          const startedCount = lessonProgress.length;

          totalCompletions += completedCount;
          totalTimeSpent += lessonProgress.reduce(
            (sum, p) => sum + (p.timeSpent ?? 0),
            0
          );

          lessonDropOffs.set(lesson.id, {
            completed: completedCount,
            started: Math.max(startedCount, 1), // Avoid division by zero
          });
        });
      });

      const completionRate =
        enrollments > 0 && totalLessons > 0
          ? (totalCompletions / (enrollments * totalLessons)) * 100
          : 0;

      // Calculate drop-off points (lessons with low completion rates)
      const dropOffPoints = Array.from(lessonDropOffs.entries())
        .map(([lessonId, stats]) => {
          const lesson = course.modules
            .flatMap((m) => m.lessons)
            .find((l) => l.id === lessonId);

          return {
            lessonId,
            lessonTitle: lesson?.title ?? "Unknown Lesson",
            dropOffRate:
              ((stats.started - stats.completed) / stats.started) * 100,
          };
        })
        .filter((point) => point.dropOffRate > 30) // Show lessons with >30% drop-off
        .sort((a, b) => b.dropOffRate - a.dropOffRate)
        .slice(0, 5); // Top 5 drop-off points

      return {
        courseId: course.id,
        courseTitle: course.title,
        enrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageTimeSpent: Math.round(
          totalTimeSpent / 60 / Math.max(enrollments, 1)
        ), // Minutes per student
        dropOffPoints,
      };
    });

    // Get recent enrollment activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments = await db.enrollment.findMany({
      where: {
        courseId: { in: courses.map((c) => c.id) },
        enrolledAt: { gte: thirtyDaysAgo },
      },
      orderBy: { enrolledAt: "asc" },
    });

    // Group by date for engagement timeline
    const engagementByDate = new Map<
      string,
      { newEnrollments: number; completions: number }
    >();

    recentEnrollments.forEach((enrollment) => {
      const dateKey = enrollment.enrolledAt.toISOString().split("T")[0];

      if (!engagementByDate.has(dateKey)) {
        engagementByDate.set(dateKey, { newEnrollments: 0, completions: 0 });
      }

      const dayData = engagementByDate.get(dateKey)!;
      dayData.newEnrollments++;
      if (enrollment.completedAt) {
        dayData.completions++;
      }
    });

    const studentEngagement = Array.from(engagementByDate.entries()).map(
      ([date, data]) => ({
        date,
        activeStudents: 0, // Will be implemented when learning sessions are tracked
        newEnrollments: data.newEnrollments,
        completions: data.completions,
      })
    );

    return {
      overallStats: {
        totalCourses: courses.length,
        totalStudents: uniqueStudents,
        totalEnrollments,
        averageRating: 4.5, // Placeholder - rating system pending
        totalRevenue: 0, // Placeholder - revenue calculation pending
      },
      coursePerformance,
      studentEngagement,
    };
  } catch (error) {
    console.error("Error fetching instructor analytics:", error);
    return null;
  }
}

/**
 * Start or update a learning session
 */
export async function startLearningSession(
  data: LearningSessionData
): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // Check if there's an ongoing session for this user
    const existingSession = await db.learningSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: "desc" },
    });

    // End the existing session if it exists
    if (existingSession) {
      const duration = Math.round(
        (Date.now() - existingSession.startTime.getTime()) / 1000 / 60
      ); // in minutes
      await db.learningSession.update({
        where: { id: existingSession.id },
        data: {
          endTime: new Date(),
          duration: Math.max(duration, 1), // At least 1 minute
        },
      });
    }

    // Create new session
    const session = await db.learningSession.create({
      data: {
        userId: user.id,
        courseId: data.courseId,
        lessonId: data.lessonId,
        startTime: data.startTime,
      },
    });

    return session.id;
  } catch (error) {
    console.error("Error starting learning session:", error);
    return null;
  }
}

/**
 * End a learning session
 */
export async function endLearningSession(
  sessionId: string,
  completed: boolean = false
): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const session = await db.learningSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return false;
    }

    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 1000 / 60
    ); // in minutes

    await db.learningSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration: Math.max(duration, 1), // At least 1 minute
        completed,
      },
    });

    // Update learning streak if session was completed
    if (completed) {
      await updateLearningStreak(user.id);
    }

    return true;
  } catch (error) {
    console.error("Error ending learning session:", error);
    return false;
  }
}

/**
 * Update user's learning streak
 */
export async function updateLearningStreak(userId: string): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Start of yesterday

    // Check if user has any completed sessions today
    const todaySessions = await db.learningSession.findFirst({
      where: {
        userId,
        completed: true,
        startTime: { gte: today },
      },
    });

    if (!todaySessions) {
      return; // No activity today, don't update streak
    } // Get or create learning streak record
    const streak = await db.learningStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      await db.learningStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivity: today,
        },
      });
      return;
    }

    // Check if last activity was yesterday (continuing streak) or today (already counted)
    const lastActivity = streak.lastActivity
      ? new Date(streak.lastActivity)
      : null;

    if (lastActivity && lastActivity >= today) {
      return; // Already counted today
    }

    let newCurrentStreak = 1;
    if (lastActivity && lastActivity >= yesterday && lastActivity < today) {
      // Last activity was yesterday, continue streak
      newCurrentStreak = streak.currentStreak + 1;
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

    await db.learningStreak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivity: today,
      },
    });

    // Check for streak achievements
    await checkStreakAchievements(userId, newCurrentStreak);
  } catch (error) {
    console.error("Error updating learning streak:", error);
  }
}

/**
 * Check and award streak-based achievements
 */
async function checkStreakAchievements(
  userId: string,
  currentStreak: number
): Promise<void> {
  try {
    const streakMilestones = [3, 7, 14, 30, 60, 100];

    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone) {
        // Check if user already has this achievement
        const existingAchievement = await db.userAchievement.findFirst({
          where: {
            userId,
            achievement: {
              category: "streak",
              criteria: {
                path: ["days"],
                equals: milestone,
              },
            },
          },
        });

        if (!existingAchievement) {
          // Find the achievement
          const achievement = await db.achievement.findFirst({
            where: {
              category: "streak",
              criteria: {
                path: ["days"],
                equals: milestone,
              },
            },
          });

          if (achievement) {
            await db.userAchievement.create({
              data: {
                userId,
                achievementId: achievement.id,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking streak achievements:", error);
  }
}

/**
 * Seed initial achievements
 */
export async function seedAchievements(): Promise<void> {
  try {
    const achievements = [
      // Streak achievements
      {
        name: "🔥 First Streak",
        description: "Complete lessons for 3 consecutive days",
        icon: "🔥",
        category: "streak",
        criteria: { days: 3 },
        points: 10,
      },
      {
        name: "🔥 Week Warrior",
        description: "Complete lessons for 7 consecutive days",
        icon: "🔥",
        category: "streak",
        criteria: { days: 7 },
        points: 25,
      },
      {
        name: "🔥 Fortnight Fighter",
        description: "Complete lessons for 14 consecutive days",
        icon: "🔥",
        category: "streak",
        criteria: { days: 14 },
        points: 50,
      },
      {
        name: "🔥 Monthly Master",
        description: "Complete lessons for 30 consecutive days",
        icon: "🔥",
        category: "streak",
        criteria: { days: 30 },
        points: 100,
      },
      // Completion achievements
      {
        name: "🎓 First Graduate",
        description: "Complete your first course",
        icon: "🎓",
        category: "completion",
        criteria: { courses: 1 },
        points: 50,
      },
      {
        name: "🎓 Course Collector",
        description: "Complete 5 courses",
        icon: "🎓",
        category: "completion",
        criteria: { courses: 5 },
        points: 200,
      },
      {
        name: "📚 Lesson Learner",
        description: "Complete 10 lessons",
        icon: "📚",
        category: "completion",
        criteria: { lessons: 10 },
        points: 25,
      },
      {
        name: "📚 Knowledge Seeker",
        description: "Complete 50 lessons",
        icon: "📚",
        category: "completion",
        criteria: { lessons: 50 },
        points: 100,
      },
    ];

    for (const achievementData of achievements) {
      const existing = await db.achievement.findFirst({
        where: {
          category: achievementData.category,
          criteria: { equals: achievementData.criteria },
        },
      });

      if (!existing) {
        await db.achievement.create({
          data: achievementData,
        });
      }
    }
  } catch (error) {
    console.error("Error seeding achievements:", error);
  }
}
