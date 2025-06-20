"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  BookOpen,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { markLessonComplete, markLessonIncomplete } from "@/actions/progress";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { TextAnimate } from "@/components/magicui/text-animate";

interface CourseData {
  enrollment: {
    id: string;
    courseId: string;
    userId: string;
    enrolledAt: Date;
    completedAt: Date | null;
    progress: number;
  };
  course: {
    id: string;
    title: string;
    price: number | null;
    modules: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        duration?: number | null;
        order: number;
      }>;
    }>;
  };
  lessonProgress: Record<
    string,
    { completed: boolean; completedAt?: Date | null }
  >;
  stats: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  };
}

interface CourseLearningInterfaceProps {
  courseData: CourseData;
  currentLessonId?: string;
  userId: string;
}

export function CourseLearningInterface({
  courseData,
  currentLessonId,
}: Readonly<CourseLearningInterfaceProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonStates, setLessonStates] = useState(
    courseData.lessonProgress ?? {}
  );
  const router = useRouter();

  const { course } = courseData;

  // Flatten lessons for easy navigation
  const allLessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
    }))
  );

  // Set initial lesson
  useEffect(() => {
    if (currentLessonId && allLessons.find((l) => l.id === currentLessonId)) {
      setSelectedLessonId(currentLessonId);
    } else if (allLessons.length > 0) {
      // Find first incomplete lesson or first lesson
      const firstIncomplete = allLessons.find(
        (lesson) => !lessonStates[lesson.id]?.completed
      );
      setSelectedLessonId(firstIncomplete?.id ?? allLessons[0].id);
    }
  }, [currentLessonId, allLessons, lessonStates]);

  const currentLesson = allLessons.find(
    (lesson) => lesson.id === selectedLessonId
  );
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.id === selectedLessonId
  );

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    router.push(`/courses/${course.id}/learn?lesson=${lessonId}`, {
      scroll: false,
    });
    setSidebarOpen(false);
  };

  const handleToggleComplete = async (lessonId: string) => {
    const currentState = lessonStates[lessonId]?.completed ?? false;

    try {
      if (currentState) {
        await markLessonIncomplete(lessonId);
        setLessonStates((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            completed: false,
            completedAt: null,
          },
        }));
        toast({
          title: "Lesson marked as incomplete",
          description: "Progress has been updated",
        });
      } else {
        await markLessonComplete(lessonId);
        setLessonStates((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            completed: true,
            completedAt: new Date(),
          },
        }));
        toast({
          title: "Lesson completed!",
          description: "Great job! Keep up the good work.",
        });
      }
    } catch (error) {
      console.error("Toggle lesson complete error:", error);
      toast({
        title: "Error",
        description: "Failed to update lesson progress",
        variant: "destructive",
      });
    }
  };

  const navigateToLesson = (direction: "prev" | "next") => {
    if (direction === "prev" && currentLessonIndex > 0) {
      handleLessonSelect(allLessons[currentLessonIndex - 1].id);
    } else if (
      direction === "next" &&
      currentLessonIndex < allLessons.length - 1
    ) {
      handleLessonSelect(allLessons[currentLessonIndex + 1].id);
    }
  };

  const currentProgress = Math.round(
    (Object.values(lessonStates).filter((state) => state?.completed).length /
      allLessons.length) *
      100
  );

  return (
    <>
      <ScrollProgress className="from-blue-400 via-blue-500 to-blue-700" />
      {/* Main layout */}
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block w-80 bg-white border-r border-gray-200 overflow-y-auto`}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold line-clamp-2">
                {course.title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Course Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{currentProgress}%</span>
              </div>
              <div className="flex items-center justify-center my-4">
                <AnimatedCircularProgressBar
                  min={0}
                  max={100}
                  value={currentProgress}
                  gaugePrimaryColor="#3b82f6"
                  gaugeSecondaryColor="#1e40af"
                  className="w-32 h-32"
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {
                  Object.values(lessonStates).filter(
                    (state) => state?.completed
                  ).length
                }{" "}
                of {allLessons.length} lessons completed
              </div>
              {/* TODO: Add ScrollProgress for lesson tracking */}
              <div className="text-gray-400 italic mt-2">
                Scroll progress indicator coming soon...
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-6">
            {course.modules.map((module) => (
              <div key={module.id} className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {module.title}
                </h3>
                <div className="space-y-2">
                  {" "}
                  {module.lessons.map((lesson) => {
                    const isCompleted =
                      lessonStates[lesson.id]?.completed ?? false;
                    const isSelected = selectedLessonId === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(lesson.id);
                            }}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                            aria-label={
                              isCompleted
                                ? "Mark lesson incomplete"
                                : "Mark lesson complete"
                            }
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleLessonSelect(lesson.id)}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="font-medium text-sm line-clamp-2">
                              {lesson.title}
                            </div>
                            {lesson.duration && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration} min
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">
                    {currentLesson?.title ?? "Select a lesson"}
                  </h1>
                  {currentLesson && (
                    <p className="text-sm text-gray-600">
                      {currentLesson.moduleTitle} • Lesson{" "}
                      {currentLessonIndex + 1} of {allLessons.length}
                    </p>
                  )}
                </div>
              </div>
              <Link href={`/courses/${course.id}`}>
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </Link>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="flex-1 p-6">
            {currentLesson ? (
              <Card className="max-w-4xl mx-auto">
                {" "}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <BoxReveal boxColor="#2563eb">
                      <CardTitle className="text-2xl text-blue-900">
                        <TextAnimate animation="blurInUp" by="word">
                          {currentLesson.title}
                        </TextAnimate>
                      </CardTitle>
                    </BoxReveal>
                    <Badge
                      variant={
                        lessonStates[currentLesson.id]?.completed
                          ? "default"
                          : "secondary"
                      }
                      className={
                        lessonStates[currentLesson.id]?.completed
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }
                    >
                      {lessonStates[currentLesson.id]?.completed
                        ? "Completed"
                        : "In Progress"}
                    </Badge>
                  </div>
                  {currentLesson.duration && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span>{currentLesson.duration} minutes</span>
                    </div>
                  )}
                </CardHeader>{" "}
                <CardContent>
                  {/* Lesson content would go here */}
                  <div className="prose max-w-none">
                    <BoxReveal boxColor="#2563eb" duration={0.6}>
                      <p className="text-blue-800 mb-6">
                        {
                          "Lesson content will be displayed here. This could include video, text, interactive elements, and more."
                        }
                      </p>
                    </BoxReveal>{" "}
                    {/* Placeholder for lesson content */}
                    <BoxReveal boxColor="#2563eb" duration={0.8}>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                        <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <div className="text-blue-600">
                          <TextAnimate animation="blurInUp" by="word">
                            Lesson content will be rendered here based on the
                            lesson type and content.
                          </TextAnimate>
                        </div>
                      </div>
                    </BoxReveal>
                  </div>{" "}
                  {/* Lesson Actions */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-blue-200">
                    <Button
                      variant="outline"
                      onClick={() => navigateToLesson("prev")}
                      disabled={currentLessonIndex === 0}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Lesson
                    </Button>

                    <Button
                      onClick={() => handleToggleComplete(currentLesson.id)}
                      variant={
                        lessonStates[currentLesson.id]?.completed
                          ? "outline"
                          : "default"
                      }
                      className={
                        lessonStates[currentLesson.id]?.completed
                          ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                    >
                      {lessonStates[currentLesson.id]?.completed ? (
                        <>
                          <Circle className="h-4 w-4 mr-2" />
                          Mark Incomplete
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => navigateToLesson("next")}
                      disabled={currentLessonIndex === allLessons.length - 1}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      variant="outline"
                    >
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="max-w-4xl mx-auto">
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-xl mb-2">
                    Select a Lesson
                  </CardTitle>
                  <p className="text-gray-600">
                    Choose a lesson from the sidebar to start learning
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
