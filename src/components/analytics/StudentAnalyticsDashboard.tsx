"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProgressChart,
  CourseProgressChart,
  LearningHeatmap,
  AchievementCard,
  StatCard,
} from "./Charts";
import {
  getStudentAnalytics,
  type StudentAnalytics,
} from "@/actions/analytics";
import { Loader2 } from "lucide-react";

export function StudentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await getStudentAnalytics();
        if (data) {
          setAnalytics(data);
        } else {
          setError("Failed to load analytics data");
        }
      } catch (err) {
        setError("An error occurred while loading analytics");
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);
  const refreshAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getStudentAnalytics();
      if (data) {
        setAnalytics(data);
        setError(null);
      } else {
        setError("Failed to load analytics data");
      }
    } catch (err) {
      setError("An error occurred while loading analytics");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your learning analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          {error ?? "No analytics data available"}
        </p>
        <Button onClick={refreshAnalytics}>Try Again</Button>
      </div>
    );
  }

  const { learningStats, recentActivity, courseProgress, achievements } =
    analytics;

  // Transform recent activity for chart
  const chartData = recentActivity.map((activity) => ({
    date: activity.date,
    lessonsCompleted: activity.lessonsCompleted,
    timeSpent: activity.timeSpent,
  }));

  // Transform for heatmap
  const heatmapData = recentActivity.map((activity) => ({
    date: activity.date,
    activity: activity.lessonsCompleted + activity.coursesStudied,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your learning progress and achievements
          </p>
        </div>
        <Button onClick={refreshAnalytics} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Learning Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Learning Streak"
          value={learningStats.currentStreak}
          icon="🔥"
          description={`Longest: ${learningStats.longestStreak} days`}
          color="orange"
        />
        <StatCard
          title="Courses Enrolled"
          value={learningStats.totalCoursesEnrolled}
          icon="📚"
          description={`${learningStats.totalCoursesCompleted} completed`}
          color="blue"
        />
        <StatCard
          title="Lessons Completed"
          value={learningStats.totalLessonsCompleted}
          icon="✅"
          description="Total achievements"
          color="green"
        />
        <StatCard
          title="Time Invested"
          value={`${learningStats.totalTimeSpent}m`}
          icon="⏱️"
          description={`Avg: ${learningStats.averageSessionDuration}m/session`}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Learning Activity</CardTitle>
            <CardDescription>
              Your learning progress over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart
              data={chartData}
              dataKey="lessonsCompleted"
              color="#10b981"
              type="line"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Time Spent Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Study Time</CardTitle>
            <CardDescription>Minutes spent learning each day</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart
              data={chartData}
              dataKey="timeSpent"
              color="#8b5cf6"
              type="bar"
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>
            Your completion progress across all enrolled courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseProgressChart data={courseProgress} />
        </CardContent>
      </Card>

      {/* Learning Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Activity Heatmap</CardTitle>
          <CardDescription>
            Visual representation of your daily learning activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LearningHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
          <CardDescription>
            Your latest learning milestones and badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.slice(0, 6).map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No achievements yet!</p>
              <p className="text-sm text-gray-400">
                Complete lessons and maintain learning streaks to earn your
                first badges.
              </p>
            </div>
          )}

          {achievements.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline">View All Achievements</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Goals</CardTitle>
          <CardDescription>
            Set and track your learning objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium">Weekly Learning Goal</h4>
                <p className="text-sm text-gray-600">
                  Complete 5 lessons this week
                </p>
              </div>
              <Badge variant="secondary">3/5</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium">Monthly Streak Goal</h4>
                <p className="text-sm text-gray-600">
                  Maintain a 15-day learning streak
                </p>
              </div>
              <Badge variant="secondary">
                {learningStats.currentStreak}/15
              </Badge>
            </div>

            <Button className="w-full" variant="outline">
              Set New Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
