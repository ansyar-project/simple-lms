"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ModuleForm from "@/components/course/ModuleForm";
import ModuleList from "@/components/course/ModuleList";
import LessonForm from "@/components/course/LessonForm";
import LessonPreview from "@/components/course/LessonPreview";
import { getCourseModules } from "@/actions/modules";
import { getLesson } from "@/actions/lessons";
import { Plus, ArrowLeft } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    contentType: string;
    duration?: number;
  }>;
  _count: {
    lessons: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

interface CourseContentManagerProps {
  courseId: string;
  courseTitle: string;
}

type ViewMode =
  | "list"
  | "add-module"
  | "edit-module"
  | "add-lesson"
  | "edit-lesson"
  | "preview-lesson";

export default function CourseContentManager({
  courseId,
  courseTitle,
}: Readonly<CourseContentManagerProps>) {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadModules = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCourseModules(courseId);
      // Convert null to undefined for type compatibility
      const convertedModules = data.map((module) => ({
        ...module,
        description: module.description ?? undefined,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          duration: lesson.duration ?? undefined,
        })),
      }));
      setModules(convertedModules);
    } catch (error) {
      console.error("Error loading modules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);
  useEffect(() => {
    loadModules();
  }, [courseId, loadModules]);

  const handleCreateModule = () => {
    setSelectedModule(null);
    setCurrentView("add-module");
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setCurrentView("edit-module");
  };

  const handleCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLesson(null);
    setCurrentView("add-lesson");
  };
  const handleEditLesson = async (moduleId: string, lessonId: string) => {
    try {
      const lesson = await getLesson(lessonId);
      // Convert null to undefined for type compatibility
      const convertedLesson = {
        ...lesson,
        content: lesson.content ?? undefined,
        videoUrl: lesson.videoUrl ?? undefined,
        duration: lesson.duration ?? undefined,
      };
      setSelectedLesson(convertedLesson);
      setSelectedModuleId(moduleId);
      setCurrentView("edit-lesson");
    } catch (error) {
      console.error("Error loading lesson:", error);
      alert("Failed to load lesson");
    }
  };

  const handlePreviewLesson = async (lessonId: string) => {
    try {
      const lesson = await getLesson(lessonId);
      // Convert null to undefined for type compatibility
      const convertedLesson = {
        ...lesson,
        content: lesson.content ?? undefined,
        videoUrl: lesson.videoUrl ?? undefined,
        duration: lesson.duration ?? undefined,
      };
      setSelectedLesson(convertedLesson);
      setCurrentView("preview-lesson");
    } catch (error) {
      console.error("Error loading lesson:", error);
      alert("Failed to load lesson");
    }
  };

  const handleSuccess = () => {
    setCurrentView("list");
    setSelectedModule(null);
    setSelectedLesson(null);
    setSelectedModuleId(null);
    loadModules();
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedModule(null);
    setSelectedLesson(null);
    setSelectedModuleId(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case "add-module":
      case "edit-module":
        return (
          <ModuleForm
            courseId={courseId}
            module={selectedModule ?? undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        );

      case "add-lesson":
      case "edit-lesson":
        if (!selectedModuleId) return null;
        return (
          <LessonForm
            moduleId={selectedModuleId}
            lesson={selectedLesson ?? undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        );

      case "preview-lesson":
        if (!selectedLesson) return null;
        return (
          <LessonPreview
            lesson={selectedLesson}
            onEdit={() => {
              setCurrentView("edit-lesson");
            }}
            onClose={handleCancel}
          />
        );

      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Course Content</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Manage modules and lessons for {courseTitle}
                    </p>
                  </div>
                  <Button onClick={handleCreateModule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Module List */}
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading modules...</p>
                </CardContent>
              </Card>
            ) : (
              <ModuleList
                courseId={courseId}
                modules={modules}
                onEditModule={handleEditModule}
                onCreateLesson={handleCreateLesson}
                onEditLesson={handleEditLesson}
                onPreviewLesson={handlePreviewLesson}
                onRefresh={loadModules}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              currentView === "list" ? router.back() : handleCancel()
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentView === "list" ? "Back to Course" : "Back to Content"}
          </Button>
        </div>

        {currentView !== "list" && (
          <div className="text-sm text-muted-foreground">
            {currentView === "add-module" && "Creating New Module"}
            {currentView === "edit-module" && "Editing Module"}
            {currentView === "add-lesson" && "Creating New Lesson"}
            {currentView === "edit-lesson" && "Editing Lesson"}
            {currentView === "preview-lesson" && "Lesson Preview"}
          </div>
        )}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
