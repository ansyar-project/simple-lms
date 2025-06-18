"use client";

import React, { useState, useActionState, useEffect } from "react";
import {
  createLesson,
  updateLesson,
  type LessonFormState,
} from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Loader2,
  Plus,
  Save,
  X,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
} from "lucide-react";

interface LessonFormProps {
  moduleId: string;
  lesson?: {
    id: string;
    title: string;
    content?: string;
    contentType: string;
    videoUrl?: string;
    duration?: number;
    order: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const initialState: LessonFormState = {
  success: false,
};

const contentTypes = [
  {
    value: "TEXT",
    label: "Text Content",
    icon: FileText,
    description: "Rich text lesson content",
  },
  {
    value: "VIDEO",
    label: "Video",
    icon: Video,
    description: "Video lesson with optional text",
  },
  {
    value: "QUIZ",
    label: "Quiz",
    icon: HelpCircle,
    description: "Interactive quiz for assessment",
  },
  {
    value: "ASSIGNMENT",
    label: "Assignment",
    icon: ClipboardList,
    description: "Assignment task (Coming soon)",
  },
];

export default function LessonForm({
  moduleId,
  lesson,
  onSuccess,
  onCancel,
}: Readonly<LessonFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentType, setContentType] = useState(lesson?.contentType ?? "TEXT");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [state, formAction] = useActionState(
    lesson ? updateLesson : createLesson,
    initialState
  ); // Handle success state changes
  useEffect(() => {
    if (state.success && !isSubmitting) {
      onSuccess?.();
    }
  }, [state.success, isSubmitting, onSuccess]);

  // Reset loading state when action completes
  useEffect(() => {
    if (state.message && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [state.message, isSubmitting]);

  const handleSubmit = async (formData: FormData) => {
    // Add the rich text content to form data
    formData.set("content", content);
    formData.set("contentType", contentType);

    setIsSubmitting(true);
    formAction(formData);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {lesson ? "Edit Lesson" : "Create New Lesson"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="moduleId" value={moduleId} />
          {lesson && <input type="hidden" name="id" value={lesson.id} />}

          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter lesson title"
              defaultValue={lesson?.title}
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Content Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = contentType === type.value;
                const isDisabled = ["QUIZ", "ASSIGNMENT"].includes(type.value);

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => !isDisabled && setContentType(type.value)}
                    disabled={isDisabled}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50"
                    } ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 mt-0.5 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-sm">{type.label}</h4>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {state.errors?.contentType && (
              <p className="text-sm text-destructive">
                {state.errors.contentType[0]}
              </p>
            )}
          </div>

          {contentType === "VIDEO" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  defaultValue={lesson?.videoUrl}
                />
                {state.errors?.videoUrl && (
                  <p className="text-sm text-destructive">
                    {state.errors.videoUrl[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (in seconds)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="e.g., 300 for 5 minutes"
                  defaultValue={lesson?.duration}
                  min="0"
                />
                {state.errors?.duration && (
                  <p className="text-sm text-destructive">
                    {state.errors.duration[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {(contentType === "TEXT" || contentType === "VIDEO") && (
            <div className="space-y-2">
              <Label htmlFor="content">
                {contentType === "VIDEO"
                  ? "Additional Content (Optional)"
                  : "Lesson Content"}
              </Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder={
                  contentType === "VIDEO"
                    ? "Add supplementary text content for this video lesson..."
                    : "Write your lesson content here..."
                }
              />
              {state.errors?.content && (
                <p className="text-sm text-destructive">
                  {state.errors.content[0]}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              placeholder="0 for auto-order"
              defaultValue={lesson?.order ?? 0}
              min="0"
            />
            {state.errors?.order && (
              <p className="text-sm text-destructive">
                {state.errors.order[0]}
              </p>
            )}
          </div>

          {state.message && (
            <div
              className={`p-3 rounded-md ${
                state.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {lesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
