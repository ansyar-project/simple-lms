"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Play,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startQuizAttempt } from "@/actions/quizzes";
import { QuizTaker, QuizResults } from "./QuizTaker";
import type {
  QuizWithQuestions,
  QuizAttemptWithAnswers,
  QuizAttemptWithBasicUser,
  QuizResult,
} from "@/types";

interface QuizWrapperProps {
  quiz: QuizWithQuestions;
  attempts: QuizAttemptWithAnswers[] | QuizAttemptWithBasicUser[];
  onComplete?: () => void;
}

type QuizState = "intro" | "taking" | "results" | "completed";

export function QuizWrapper({ quiz, attempts, onComplete }: QuizWrapperProps) {
  const { toast } = useToast();
  const [state, setState] = useState<QuizState>("intro");
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);

  const canTakeQuiz = attempts.length < quiz.attemptsAllowed;
  const bestAttempt =
    attempts.length > 0
      ? attempts.reduce((best, current) =>
          current.score > best.score ? current : best
        )
      : null;
  const hasPassedQuiz = bestAttempt ? bestAttempt.passed : false;

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const result = await startQuizAttempt(quiz.id);
      if (result.success) {
        setState("taking");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (result: QuizResult) => {
    setCurrentResult(result);
    setState("results");
    onComplete?.();
  };

  const handleRetakeQuiz = () => {
    if (canTakeQuiz) {
      setState("intro");
    }
  };

  const handleViewResults = (attempt: QuizAttemptWithAnswers) => {
    // Convert attempt to QuizResult format
    const result: QuizResult = {
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent || 0,
      answers: attempt.answers,
    };
    setCurrentResult(result);
    setState("results");
  };

  const handleContinue = () => {
    setState("completed");
  };

  const renderIntro = () => (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-muted-foreground mt-2">{quiz.description}</p>
              )}
            </div>
            <Badge variant={quiz.isPublished ? "default" : "secondary"}>
              {quiz.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.instructions && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Instructions:
              </h4>
              <p className="text-blue-800">{quiz.instructions}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
              </div>
            </div>

            {quiz.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{quiz.timeLimit} min</div>
                  <div className="text-sm text-muted-foreground">
                    Time Limit
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{quiz.attemptsAllowed}</div>
                <div className="text-sm text-muted-foreground">
                  Attempts Allowed
                </div>
              </div>
            </div>
          </div>

          {quiz.passingScore && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need to score at least {quiz.passingScore}% to pass this
                quiz.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Previous Attempts ({attempts.length}/{quiz.attemptsAllowed})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {attempt.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        Attempt {attempts.length - index}
                      </span>
                    </div>
                    <Badge variant={attempt.passed ? "default" : "secondary"}>
                      {Math.round(attempt.score)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                    {quiz.showResults && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResults(attempt)}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {bestAttempt && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Best Score:</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={bestAttempt.passed ? "default" : "secondary"}
                    >
                      {Math.round(bestAttempt.score)}%
                    </Badge>
                    {bestAttempt.passed && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {canTakeQuiz ? (
              <Button
                onClick={handleStartQuiz}
                disabled={loading}
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                {(() => {
                  if (loading) return "Starting...";
                  if (attempts.length === 0) return "Start Quiz";
                  return "Retake Quiz";
                })()}
              </Button>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have used all {quiz.attemptsAllowed} attempts for this
                  quiz.
                  {hasPassedQuiz
                    ? " Congratulations on passing!"
                    : " Please contact your instructor if you need additional attempts."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaking = () => (
    <QuizTaker
      quiz={quiz}
      onComplete={handleQuizComplete}
      onExit={() => setState("intro")}
    />
  );

  const renderResults = () =>
    currentResult && (
      <QuizResults
        result={currentResult}
        quiz={quiz}
        onRetake={canTakeQuiz ? handleRetakeQuiz : undefined}
        onClose={handleContinue}
      />
    );

  const renderCompleted = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-muted-foreground mb-4">
          You can continue with the next lesson or review your results.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setState("intro")}>
            Review Quiz
          </Button>
          <Button onClick={() => window.history.back()}>
            Continue Learning
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  switch (state) {
    case "intro":
      return renderIntro();
    case "taking":
      return renderTaking();
    case "results":
      return renderResults();
    case "completed":
      return renderCompleted();
    default:
      return renderIntro();
  }
}
