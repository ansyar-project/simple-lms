"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitQuizAttempt } from "@/actions/quizzes";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { ScratchToReveal } from "@/components/magicui/scratch-to-reveal";
import type { QuizWithQuestions, QuizTakingState, QuizResult } from "@/types";

interface QuizTakerProps {
  quiz: QuizWithQuestions;
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export function QuizTaker({ quiz, onComplete, onExit }: QuizTakerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizTakingState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: quiz.timeLimit ? quiz.timeLimit * 60 : undefined, // Convert minutes to seconds
    isSubmitted: false,
    startTime: new Date(),
  });

  // Timer effect
  useEffect(() => {
    if (!quizState.timeRemaining || quizState.isSubmitted) return;

    const timer = setInterval(() => {
      setQuizState((prev) => {
        if (prev.timeRemaining && prev.timeRemaining > 0) {
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        } else {
          // Time's up, auto-submit
          handleSubmit();
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState.timeRemaining, quizState.isSubmitted]);

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress =
    ((quizState.currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const updateAnswer = (
    questionId: string,
    answer: string | boolean | number
  ) => {
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: index,
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const timeSpent = Math.floor(
        (new Date().getTime() - quizState.startTime.getTime()) / 1000
      );

      const result = await submitQuizAttempt({
        quizId: quiz.id,
        answers: quizState.answers,
        timeSpent,
      });

      if (result.success && result.result) {
        setQuizState((prev) => ({ ...prev, isSubmitted: true }));
        onComplete(result.result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(quizState.answers).length;
  };

  const isCurrentQuestionAnswered = () => {
    return quizState.answers[currentQuestion.id] !== undefined;
  };

  if (quizState.isSubmitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz Submitted!</h2>
          <p className="text-muted-foreground">
            Your answers have been submitted successfully.
            {quiz.showResults
              ? " You can view your results now."
              : " Results will be available soon."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <p className="text-muted-foreground">
                Question {quizState.currentQuestionIndex + 1} of{" "}
                {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {quizState.timeRemaining && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span
                    className={`font-mono ${
                      quizState.timeRemaining < 300 ? "text-red-500" : ""
                    }`}
                  >
                    {formatTime(quizState.timeRemaining)}
                  </span>
                </div>
              )}
              <Badge variant="secondary">
                {getAnsweredQuestionsCount()}/{totalQuestions} Answered
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Question {quizState.currentQuestionIndex + 1}
            {isCurrentQuestionAnswered() && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQuestion.question}</div>

          {/* Multiple Choice */}
          {currentQuestion.type === "MULTIPLE_CHOICE" &&
            currentQuestion.options && (
              <div className="space-y-3">
                {(currentQuestion.options as string[]).map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={quizState.answers[currentQuestion.id] === option}
                      onChange={(e) =>
                        updateAnswer(currentQuestion.id, e.target.value)
                      }
                      className="text-primary"
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}

          {/* True/False */}
          {currentQuestion.type === "TRUE_FALSE" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="true-option"
                  name={`question-${currentQuestion.id}`}
                  value="true"
                  checked={quizState.answers[currentQuestion.id] === true}
                  onChange={() => updateAnswer(currentQuestion.id, true)}
                  className="text-primary"
                />
                <label
                  htmlFor="true-option"
                  className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  True
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="false-option"
                  name={`question-${currentQuestion.id}`}
                  value="false"
                  checked={quizState.answers[currentQuestion.id] === false}
                  onChange={() => updateAnswer(currentQuestion.id, false)}
                  className="text-primary"
                />
                <label
                  htmlFor="false-option"
                  className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  False
                </label>
              </div>
            </div>
          )}

          {/* Fill in the Blank / Short Answer */}
          {(currentQuestion.type === "FILL_IN_BLANK" ||
            currentQuestion.type === "SHORT_ANSWER") && (
            <div>
              {" "}
              <Input
                value={String(quizState.answers[currentQuestion.id] ?? "")}
                onChange={(e) =>
                  updateAnswer(currentQuestion.id, e.target.value)
                }
                placeholder="Enter your answer"
                className="text-lg"
              />
            </div>
          )}

          {/* Essay */}
          {currentQuestion.type === "ESSAY" && (
            <div>
              {" "}
              <Textarea
                value={String(quizState.answers[currentQuestion.id] || "")}
                onChange={(e) =>
                  updateAnswer(currentQuestion.id, e.target.value)
                }
                placeholder="Write your essay answer here..."
                rows={8}
                className="text-lg"
              />
            </div>
          )}

          {/* Question Points */}
          <div className="text-sm text-muted-foreground">
            Points: {currentQuestion.points}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => goToQuestion(quizState.currentQuestionIndex - 1)}
                disabled={quizState.currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => goToQuestion(quizState.currentQuestionIndex + 1)}
                disabled={quizState.currentQuestionIndex === totalQuestions - 1}
              >
                Next
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onExit}>
                Exit Quiz
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {" "}
            {quiz.questions.map((question, index) => (
              <Button
                key={question.id}
                variant={
                  index === quizState.currentQuestionIndex
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => goToQuestion(index)}
                className={`h-10 w-10 p-0 ${
                  quizState.answers[quiz.questions[index].id] !== undefined
                    ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                    : ""
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Warning */}
      {quizState.timeRemaining && quizState.timeRemaining < 300 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Warning: Less than 5 minutes remaining!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface QuizResultsProps {
  result: QuizResult;
  quiz: QuizWithQuestions;
  onRetake?: () => void;
  onClose: () => void;
}

export function QuizResults({
  result,
  quiz,
  onRetake,
  onClose,
}: Readonly<QuizResultsProps>) {
  const percentage = Math.round(result.score);
  const passed = result.passed;
  const confettiRef = useRef<ConfettiRef>(null);

  // Trigger confetti when passed
  useEffect(() => {
    if (passed && confettiRef.current) {
      // Fire confetti after a short delay for better UX
      setTimeout(() => {
        confettiRef.current?.fire({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
        });
      }, 500);
    }
  }, [passed]);

  return (
    <div className="space-y-6 relative">
      {/* Confetti for passing */}
      {passed && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti ref={confettiRef} />
        </div>
      )}
      {/* Results Summary */}
      <Card className="border-blue-200">
        <CardHeader className="text-center">
          <div className="mb-4">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-blue-500 mx-auto" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            )}
          </div>
          <CardTitle className="text-2xl text-blue-900">
            {passed ? "Congratulations!" : "Quiz Complete"}
          </CardTitle>
          <p className="text-blue-600">
            {passed ? "You passed the quiz!" : "Better luck next time!"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scratch to reveal score */}
          <div className="flex justify-center">
            <ScratchToReveal width={300} height={150} minScratchPercentage={30}>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {percentage}%
                </div>
                <div className="text-blue-800 font-medium">Your Score</div>
                {passed && (
                  <div className="text-blue-500 mt-2 font-semibold">
                    🎉 PASSED! 🎉
                  </div>
                )}
              </div>
            </ScratchToReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {result.answers.length}
              </div>
              <div className="text-sm text-blue-800">Questions</div>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(result.timeSpent / 60)}:
                {(result.timeSpent % 60).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-blue-800">Time Spent</div>
            </div>
          </div>

          {quiz.passingScore && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800 mb-2 font-medium">
                Passing Score
              </div>
              <Progress value={quiz.passingScore} className="mb-2" />
              <div className="text-sm text-blue-600">
                Required: {quiz.passingScore}% | Your Score: {percentage}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Question Results */}
      {quiz.showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Question Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.answers.map((answer, index) => {
              const question = quiz.questions.find(
                (q) => q.id === answer.questionId
              );
              if (!question) return null;

              return (
                <div key={answer.questionId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Question {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        {answer.pointsEarned}/{question.points} pts
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 font-medium">{question.question}</div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Your answer:{" "}
                      </span>
                      <span
                        className={
                          answer.isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        {(() => {
                          if (typeof answer.answer === "boolean") {
                            return answer.answer ? "True" : "False";
                          }
                          if (
                            answer.answer === null ||
                            answer.answer === undefined
                          ) {
                            return "No answer";
                          }
                          if (typeof answer.answer === "object") {
                            return JSON.stringify(answer.answer);
                          }
                          return String(answer.answer);
                        })()}
                      </span>
                    </div>

                    {!answer.isCorrect && question.type !== "ESSAY" && (
                      <div>
                        <span className="text-muted-foreground">
                          Correct answer:{" "}
                        </span>
                        <span className="text-green-600">
                          {(() => {
                            if (typeof question.correctAnswer === "boolean") {
                              return question.correctAnswer ? "True" : "False";
                            }
                            return question.correctAnswer as string;
                          })()}
                        </span>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="font-medium text-blue-900 mb-1">
                          Explanation:
                        </div>
                        <div className="text-blue-800">
                          {question.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}{" "}
      {/* Actions */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex justify-center gap-4">
            {onRetake && (
              <Button
                variant="outline"
                onClick={onRetake}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Retake Quiz
              </Button>
            )}
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
