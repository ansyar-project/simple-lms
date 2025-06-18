"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Clock,
  Edit,
  X,
} from "lucide-react";
import { QuizList } from "./QuizList";
import type { QuizWithQuestions } from "@/types";

interface LessonPreviewProps {
  lesson: {
    id: string;
    title: string;
    content?: string;
    contentType: string;
    videoUrl?: string;
    duration?: number;
    quizzes?: QuizWithQuestions[];
  };
  onEdit?: () => void;
  onClose?: () => void;
  onUpdate?: () => void;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "VIDEO":
      return Video;
    case "TEXT":
      return FileText;
    case "QUIZ":
      return HelpCircle;
    case "ASSIGNMENT":
      return ClipboardList;
    default:
      return FileText;
  }
};

const getContentTypeBadge = (type: string) => {
  switch (type) {
    case "VIDEO":
      return { label: "Video", variant: "default" as const };
    case "TEXT":
      return { label: "Text", variant: "secondary" as const };
    case "QUIZ":
      return { label: "Quiz", variant: "outline" as const };
    case "ASSIGNMENT":
      return { label: "Assignment", variant: "outline" as const };
    default:
      return { label: "Unknown", variant: "secondary" as const };
  }
};

export default function LessonPreview({
  lesson,
  onEdit,
  onClose,
  onUpdate,
}: Readonly<LessonPreviewProps>) {
  const quizzes = lesson.quizzes || [];

  const handleQuizUpdate = async () => {
    // Refresh quizzes data when needed
    onUpdate?.();
  };
  const Icon = getContentTypeIcon(lesson.contentType);
  const badge = getContentTypeBadge(lesson.contentType);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="h-6 w-6 text-primary mt-1" />
            <div>
              <CardTitle className="text-xl">{lesson.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                {lesson.duration && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(lesson.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {lesson.contentType === "VIDEO" && lesson.videoUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Content</h3>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Video Preview
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  {lesson.videoUrl}
                </p>
              </div>
            </div>
          </div>
        )}
        {lesson.content && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {lesson.contentType === "VIDEO"
                ? "Additional Content"
                : "Lesson Content"}
            </h3>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}{" "}
        {lesson.contentType === "QUIZ" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quiz Management</h3>
            <QuizList
              quizzes={quizzes}
              lessonId={lesson.id}
              onUpdate={handleQuizUpdate}
            />
          </div>
        )}
        {lesson.contentType === "ASSIGNMENT" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment Content</h3>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Assignment functionality will be available in Phase 3
              </p>
            </div>
          </div>
        )}
        {!lesson.content && lesson.contentType === "TEXT" && (
          <div className="bg-muted/50 p-8 rounded-lg text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No content added yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
