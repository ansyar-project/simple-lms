"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteQuiz, publishQuiz } from "@/actions/quizzes";
import { QuizBuilder } from "./QuizBuilder";
import type { QuizWithQuestions } from "@/types";

interface QuizListProps {
  quizzes: QuizWithQuestions[];
  lessonId: string;
  onUpdate: () => void;
}

export function QuizList({ quizzes, lessonId, onUpdate }: QuizListProps) {
  const { toast } = useToast();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
    null
  );
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (quizId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(quizId);
    try {
      const result = await deleteQuiz(quizId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Quiz deleted successfully",
        });
        onUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handlePublish = async (quizId: string) => {
    setLoading(quizId);
    try {
      const result = await publishQuiz(quizId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Quiz published successfully",
        });
        onUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to publish quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = (quiz: QuizWithQuestions) => {
    setSelectedQuiz(quiz);
    setShowBuilder(true);
  };

  const handleCreate = () => {
    setSelectedQuiz(null);
    setShowBuilder(true);
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setSelectedQuiz(null);
    onUpdate();
  };

  if (showBuilder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectedQuiz ? "Edit Quiz" : "Create Quiz"}
          </h2>
          <Button variant="outline" onClick={handleBuilderClose}>
            Back to Quiz List
          </Button>
        </div>
        <QuizBuilder
          lessonId={lessonId}
          initialData={
            selectedQuiz
              ? {
                  id: selectedQuiz.id,
                  lessonId: selectedQuiz.lessonId,
                  title: selectedQuiz.title,
                  description: selectedQuiz.description || "",
                  instructions: selectedQuiz.instructions || "",
                  timeLimit: selectedQuiz.timeLimit || undefined,
                  attemptsAllowed: selectedQuiz.attemptsAllowed,
                  shuffleQuestions: selectedQuiz.shuffleQuestions,
                  showResults: selectedQuiz.showResults,
                  passingScore: selectedQuiz.passingScore || undefined,
                  questions: selectedQuiz.questions.map((q) => ({
                    type: q.type,
                    question: q.question,
                    options: (q.options as string[]) || undefined,
                    correctAnswer: q.correctAnswer as
                      | string
                      | boolean
                      | string[],
                    explanation: q.explanation || "",
                    points: q.points,
                  })),
                }
              : undefined
          }
          onSave={handleBuilderClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quizzes</h2>
          <p className="text-muted-foreground">
            Manage quizzes for this lesson
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quiz to test students&apos; understanding of
              this lesson.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={() => handleEdit(quiz)}
              onDelete={() => handleDelete(quiz.id)}
              onPublish={() => handlePublish(quiz.id)}
              loading={loading === quiz.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuizCardProps {
  quiz: QuizWithQuestions;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  loading: boolean;
}

function QuizCard({
  quiz,
  onEdit,
  onDelete,
  onPublish,
  loading,
}: QuizCardProps) {
  const questionsCount = quiz.questions.length;
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                {quiz.isPublished ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Published
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Draft
                  </>
                )}
              </Badge>
            </div>
            {quiz.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {quiz.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Quiz
              </DropdownMenuItem>
              {!quiz.isPublished && questionsCount > 0 && (
                <DropdownMenuItem onClick={onPublish}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish Quiz
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/instructor/quizzes/${quiz.id}/stats`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Stats
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/quiz/${quiz.id}/preview`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Quiz
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span>{questionsCount} Questions</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{totalPoints} Points</span>
          </div>

          {quiz.timeLimit && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{quiz.timeLimit} min</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.attemptsAllowed} attempts</span>
          </div>
        </div>

        {quiz.passingScore && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <span className="font-medium text-blue-900">Passing Score: </span>
              <span className="text-blue-800">{quiz.passingScore}%</span>
            </div>
          </div>
        )}

        {questionsCount === 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-800">
              <span className="font-medium">Action needed: </span>
              Add questions to publish this quiz
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
