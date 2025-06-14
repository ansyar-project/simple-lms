"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, TrendingUp } from "lucide-react";

interface ProgressTrackerProps {
  totalLessons: number;
  completedLessons: number;
  enrollmentProgress: number;
  showDetails?: boolean;
}

export function ProgressTracker({
  totalLessons,
  completedLessons,
  enrollmentProgress,
  showDetails = true,
}: Readonly<ProgressTrackerProps>) {
  const [progress, setProgress] = useState(enrollmentProgress);
  const [completed, setCompleted] = useState(completedLessons);

  useEffect(() => {
    setProgress(enrollmentProgress);
    setCompleted(completedLessons);
  }, [enrollmentProgress, completedLessons]);

  const isCompleted = progress === 100;
  const isInProgress = progress > 0 && progress < 100;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Course Progress
            </span>
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                <Trophy className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            {isInProgress && (
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>
              {completed} of {totalLessons} lessons completed
            </span>
          </div>
          {!isCompleted && (
            <span>{totalLessons - completed} lessons remaining</span>
          )}
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Trophy className="h-5 w-5 text-green-600" />
          <div className="text-sm">
            <div className="font-medium text-green-800">
              Congratulations! Course completed
            </div>
            <div className="text-green-600">
              You&apos;ve finished all lessons in this course
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
