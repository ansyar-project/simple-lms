"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ProgressChartProps {
  readonly data: Array<{
    date: string;
    coursesStudied?: number;
    lessonsCompleted?: number;
    timeSpent?: number;
  }>;
  readonly type?: "line" | "bar";
  readonly dataKey: string;
  readonly color?: string;
  readonly title?: string;
  readonly height?: number;
}

export function ProgressChart({
  data,
  type = "line",
  dataKey,
  color = "#3b82f6",
  title,
  height = 300,
}: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const Chart = type === "line" ? LineChart : BarChart;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number, name: string) => [
              value,
              name.replace(/([A-Z])/g, " $1").toLowerCase(),
            ]}
          />
          {type === "line" ? (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ) : (
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

interface CourseProgressChartProps {
  readonly data: Array<{
    courseTitle: string;
    progress: number;
    timeSpent: number;
  }>;
}

export function CourseProgressChart({ data }: CourseProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No courses enrolled</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="courseTitle"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            domain={[0, 1]}
          />
          <Tooltip
            formatter={(value: number) => [
              `${Math.round(value * 100)}%`,
              "Progress",
            ]}
            labelFormatter={(label) => `Course: ${label}`}
          />
          <Bar dataKey="progress" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LearningHeatmapProps {
  readonly data: Array<{
    date: string;
    activity: number;
  }>;
}

interface DayData {
  date: string;
  activity: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export function LearningHeatmap({ data }: LearningHeatmapProps) {
  // Create a 7x12 grid for the last 3 months (approximate)
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  const activityMap = new Map(data.map((d) => [d.date, d.activity]));

  const weeks: Array<Array<DayData | null>> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const week: Array<DayData | null> = [];

    // Start from Sunday
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      if (date <= today) {
        const dateStr = date.toISOString().split("T")[0];
        const activity = activityMap.get(dateStr) ?? 0;

        week.push({
          date: dateStr,
          activity,
          isToday: dateStr === today.toISOString().split("T")[0],
          isCurrentMonth: date.getMonth() === today.getMonth(),
        });
      } else {
        week.push(null);
      }
    }

    weeks.push(week);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  const getActivityColor = (activity: number) => {
    if (activity === 0) return "bg-gray-100";
    if (activity <= 2) return "bg-green-200";
    if (activity <= 4) return "bg-green-400";
    return "bg-green-600";
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Learning Activity</h3>
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={day ? `day-${day.date}` : `empty-${weekIndex}-${dayIndex}`}
                className={`
                  w-3 h-3 rounded-sm
                  ${day ? getActivityColor(day.activity) : "bg-transparent"}
                  ${day?.isToday ? "ring-2 ring-blue-500" : ""}
                `}
                title={day ? `${day.date}: ${day.activity} activities` : ""}
              />
            ))}
          </div>
        ))}

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

interface AchievementCardProps {
  readonly achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    points: number;
  };
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{achievement.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {achievement.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              Earned {achievement.earnedAt.toLocaleDateString()}
            </span>
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
              +{achievement.points} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: string;
  readonly description?: string;
  readonly color?: "blue" | "green" | "purple" | "orange";
}

export function StatCard({
  title,
  value,
  icon,
  description,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
