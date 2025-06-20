"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BentoGrid } from "@/components/magicui/bento-grid";
import {
  BookOpen,
  TrendingUp,
  Trophy,
  Clock,
  Users,
  Star,
  Award,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  PlayCircle,
  DollarSign,
} from "lucide-react";

// Icon mapping for server/client boundary safety
const iconMap = {
  BookOpen,
  TrendingUp,
  Trophy,
  Clock,
  Users,
  Star,
  Award,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  PlayCircle,
  DollarSign,
} as const;

type IconName = keyof typeof iconMap;

interface DashboardBentoGridProps {
  children: ReactNode;
  className?: string;
}

interface DashboardBentoItemProps {
  children: ReactNode;
  className?: string;
  span?: "1" | "2" | "3" | "full";
  height?: "sm" | "md" | "lg" | "xl";
}

export function DashboardBentoGrid({
  children,
  className,
}: Readonly<DashboardBentoGridProps>) {
  return (
    <BentoGrid
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr",
        className
      )}
    >
      {children}
    </BentoGrid>
  );
}

export function DashboardBentoItem({
  children,
  className,
  span = "1",
  height = "md",
}: Readonly<DashboardBentoItemProps>) {
  const spanClasses = {
    "1": "col-span-1",
    "2": "md:col-span-2",
    "3": "lg:col-span-3",
    full: "col-span-full",
  };

  const heightClasses = {
    sm: "min-h-[120px]",
    md: "min-h-[200px]",
    lg: "min-h-[280px]",
    xl: "min-h-[360px]",
  };

  return (
    <div
      className={cn(
        "bg-white/70 backdrop-blur-sm border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-6",
        spanClasses[span],
        heightClasses[height],
        "group relative overflow-hidden",
        className
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}

// Specialized components for common dashboard widgets
export function StatsBentoItem({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: Readonly<{
  title: string;
  value: string | number;
  icon: IconName;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}>) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-blue-600",
  };

  const IconComponent = iconMap[icon];

  return (
    <DashboardBentoItem className={cn("", className)} height="sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <IconComponent className="h-5 w-5 text-blue-600" />
        </div>
        {trend && (
          <div className={cn("text-sm font-medium", trendColors[trend])}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-blue-600 mb-2">{value}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </DashboardBentoItem>
  );
}

export function ChartBentoItem({
  title,
  description,
  children,
  className,
}: Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <DashboardBentoItem className={cn("", className)} span="2" height="lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-blue-900 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <div className="flex-1 flex items-center justify-center">{children}</div>
    </DashboardBentoItem>
  );
}

export function ListBentoItem({
  title,
  description,
  children,
  className,
}: Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <DashboardBentoItem className={cn("", className)} height="lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-blue-900 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </DashboardBentoItem>
  );
}
