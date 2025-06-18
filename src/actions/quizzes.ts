"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  submitQuizSchema,
  reorderQuestionsSchema,
} from "@/lib/validations";
import type { QuizFormData, QuestionFormData, QuizResult } from "@/types";

// Quiz CRUD Operations
export async function createQuiz(data: QuizFormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate instructor permissions
    const lesson = await db.lesson.findUnique({
      where: { id: data.lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson || lesson.module.course.instructorId !== session.user.id) {
      throw new Error(
        "Unauthorized: You can only create quizzes for your own courses"
      );
    }

    // Validate main quiz data
    const validatedQuiz = createQuizSchema.parse({
      lessonId: data.lessonId,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      timeLimit: data.timeLimit,
      attemptsAllowed: data.attemptsAllowed,
      shuffleQuestions: data.shuffleQuestions,
      showResults: data.showResults,
      passingScore: data.passingScore,
    });

    // Create quiz with questions in a transaction
    const quiz = await db.$transaction(async (tx) => {
      // Create the quiz
      const newQuiz = await tx.quiz.create({
        data: validatedQuiz,
      });

      // Create questions if provided
      if (data.questions && data.questions.length > 0) {
        const questionsData = data.questions.map((question, index) => {
          const validatedQuestion = createQuestionSchema.parse({
            quizId: newQuiz.id,
            type: question.type,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            points: question.points,
            order: index,
          });

          return {
            ...validatedQuestion,
            quizId: newQuiz.id,
            order: index,
          };
        });

        await tx.question.createMany({
          data: questionsData,
        });
      }

      return newQuiz;
    });

    revalidatePath(`/instructor/courses/${lesson.module.courseId}/content`);
    return { success: true, quizId: quiz.id };
  } catch (error) {
    console.error("Create quiz error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create quiz",
    };
  }
}

export async function updateQuiz(data: QuizFormData & { id: string }) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate quiz ownership
    const existingQuiz = await db.quiz.findUnique({
      where: { id: data.id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (
      !existingQuiz ||
      existingQuiz.lesson.module.course.instructorId !== session.user.id
    ) {
      throw new Error("Unauthorized: You can only update your own quizzes");
    }

    const validatedData = updateQuizSchema.parse(data);

    const updatedQuiz = await db.quiz.update({
      where: { id: data.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        instructions: validatedData.instructions,
        timeLimit: validatedData.timeLimit,
        attemptsAllowed: validatedData.attemptsAllowed,
        shuffleQuestions: validatedData.shuffleQuestions,
        showResults: validatedData.showResults,
        passingScore: validatedData.passingScore,
      },
    });

    revalidatePath(
      `/instructor/courses/${existingQuiz.lesson.module.courseId}/content`
    );
    return { success: true, quiz: updatedQuiz };
  } catch (error) {
    console.error("Update quiz error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update quiz",
    };
  }
}

export async function deleteQuiz(quizId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate quiz ownership
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!quiz || quiz.lesson.module.course.instructorId !== session.user.id) {
      throw new Error("Unauthorized: You can only delete your own quizzes");
    }

    await db.quiz.delete({
      where: { id: quizId },
    });

    revalidatePath(
      `/instructor/courses/${quiz.lesson.module.courseId}/content`
    );
    return { success: true };
  } catch (error) {
    console.error("Delete quiz error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete quiz",
    };
  }
}

export async function publishQuiz(quizId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate quiz ownership and ensure it has questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!quiz || quiz.lesson.module.course.instructorId !== session.user.id) {
      throw new Error("Unauthorized: You can only publish your own quizzes");
    }

    if (quiz.questions.length === 0) {
      throw new Error("Cannot publish quiz without questions");
    }

    const updatedQuiz = await db.quiz.update({
      where: { id: quizId },
      data: { isPublished: true },
    });

    revalidatePath(
      `/instructor/courses/${quiz.lesson.module.courseId}/content`
    );
    return { success: true, quiz: updatedQuiz };
  } catch (error) {
    console.error("Publish quiz error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish quiz",
    };
  }
}

// Question CRUD Operations
export async function createQuestion(
  data: QuestionFormData & { quizId: string }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate quiz ownership
    const quiz = await db.quiz.findUnique({
      where: { id: data.quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        questions: true,
      },
    });

    if (!quiz || quiz.lesson.module.course.instructorId !== session.user.id) {
      throw new Error(
        "Unauthorized: You can only add questions to your own quizzes"
      );
    }

    const validatedData = createQuestionSchema.parse({
      ...data,
      order: quiz.questions.length,
    });

    const question = await db.question.create({
      data: validatedData,
    });

    revalidatePath(
      `/instructor/courses/${quiz.lesson.module.courseId}/content`
    );
    return { success: true, question };
  } catch (error) {
    console.error("Create question error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create question",
    };
  }
}

export async function updateQuestion(
  data: QuestionFormData & { id: string; quizId: string }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate question ownership
    const question = await db.question.findUnique({
      where: { id: data.id },
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !question ||
      question.quiz.lesson.module.course.instructorId !== session.user.id
    ) {
      throw new Error("Unauthorized: You can only update your own questions");
    }

    const validatedData = updateQuestionSchema.parse(data);

    const updatedQuestion = await db.question.update({
      where: { id: data.id },
      data: {
        type: validatedData.type,
        question: validatedData.question,
        options: validatedData.options,
        correctAnswer: validatedData.correctAnswer,
        explanation: validatedData.explanation,
        points: validatedData.points,
      },
    });

    revalidatePath(
      `/instructor/courses/${question.quiz.lesson.module.courseId}/content`
    );
    return { success: true, question: updatedQuestion };
  } catch (error) {
    console.error("Update question error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update question",
    };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Validate question ownership
    const question = await db.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !question ||
      question.quiz.lesson.module.course.instructorId !== session.user.id
    ) {
      throw new Error("Unauthorized: You can only delete your own questions");
    }

    await db.question.delete({
      where: { id: questionId },
    });

    revalidatePath(
      `/instructor/courses/${question.quiz.lesson.module.courseId}/content`
    );
    return { success: true };
  } catch (error) {
    console.error("Delete question error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete question",
    };
  }
}

export async function reorderQuestions(data: {
  quizId: string;
  questionIds: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    const validatedData = reorderQuestionsSchema.parse(data);

    // Validate quiz ownership
    const quiz = await db.quiz.findUnique({
      where: { id: validatedData.quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!quiz || quiz.lesson.module.course.instructorId !== session.user.id) {
      throw new Error(
        "Unauthorized: You can only reorder your own quiz questions"
      );
    }

    // Update question orders in a transaction
    await db.$transaction(
      validatedData.questionIds.map((questionId, index) =>
        db.question.update({
          where: { id: questionId },
          data: { order: index },
        })
      )
    );

    revalidatePath(
      `/instructor/courses/${quiz.lesson.module.courseId}/content`
    );
    return { success: true };
  } catch (error) {
    console.error("Reorder questions error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reorder questions",
    };
  }
}

// Quiz Taking Operations
export async function startQuizAttempt(quizId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    // Check if user is enrolled in the course
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
        attempts: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (!quiz.isPublished) {
      throw new Error("Quiz is not published");
    }

    if (quiz.lesson.module.course.enrollments.length === 0) {
      throw new Error("You must be enrolled in this course to take the quiz");
    }

    // Check attempts limit
    if (quiz.attempts.length >= quiz.attemptsAllowed) {
      throw new Error(
        `You have reached the maximum number of attempts (${quiz.attemptsAllowed})`
      );
    }

    return { success: true, quiz };
  } catch (error) {
    console.error("Start quiz attempt error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to start quiz attempt",
    };
  }
}

export async function submitQuizAttempt(data: {
  quizId: string;
  answers: Record<string, string | boolean | number>;
  timeSpent: number;
}): Promise<{ success: boolean; result?: QuizResult; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    const validatedData = submitQuizSchema.parse(data);

    // Get quiz with questions and check enrollment
    const quiz = await db.quiz.findUnique({
      where: { id: validatedData.quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  include: {
                    enrollments: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
        attempts: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (quiz.lesson.module.course.enrollments.length === 0) {
      throw new Error("You must be enrolled in this course to submit quiz");
    }

    if (quiz.attempts.length >= quiz.attemptsAllowed) {
      throw new Error(
        `You have reached the maximum number of attempts (${quiz.attemptsAllowed})`
      );
    }

    // Calculate score and create attempt
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionAnswers: {
      questionId: string;
      answer: string | boolean | number;
      isCorrect: boolean;
      pointsEarned: number;
    }[] = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = validatedData.answers[question.id];
      let isCorrect = false;
      let pointsEarned = 0;

      if (userAnswer !== undefined && userAnswer !== null) {
        // Grade the answer based on question type
        switch (question.type) {
          case "MULTIPLE_CHOICE":
          case "TRUE_FALSE":
            isCorrect = userAnswer === question.correctAnswer;
            break;
          case "FILL_IN_BLANK":
          case "SHORT_ANSWER":
            isCorrect =
              typeof userAnswer === "string" &&
              typeof question.correctAnswer === "string" &&
              userAnswer.toLowerCase().trim() ===
                question.correctAnswer.toLowerCase().trim();
            break;
          case "ESSAY":
            // Essays require manual grading
            // isCorrect remains false, pointsEarned remains 0
            break;
        }

        if (isCorrect) {
          pointsEarned = question.points;
          earnedPoints += pointsEarned;
        }
      }

      questionAnswers.push({
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        pointsEarned,
      });
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = quiz.passingScore ? score >= quiz.passingScore : true;

    // Create quiz attempt and answers in transaction
    const attempt = await db.$transaction(async (tx) => {
      const newAttempt = await tx.quizAttempt.create({
        data: {
          userId: session.user.id,
          quizId: validatedData.quizId,
          score,
          totalPoints,
          passed,
          timeSpent: validatedData.timeSpent,
          completedAt: new Date(),
        },
      });

      // Create question answers
      await tx.questionAnswer.createMany({
        data: questionAnswers.map((qa) => ({
          attemptId: newAttempt.id,
          questionId: qa.questionId,
          answer: qa.answer,
          isCorrect: qa.isCorrect,
          pointsEarned: qa.pointsEarned,
        })),
      });

      return newAttempt;
    });

    // Get the complete attempt with answers for the result
    const completeAttempt = await db.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    const result: QuizResult = {
      score,
      totalPoints,
      passed,
      timeSpent: validatedData.timeSpent,
      answers: completeAttempt!.answers,
    };

    revalidatePath(`/courses/${quiz.lesson.module.courseId}`);
    return { success: true, result };
  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit quiz attempt",
    };
  }
}

// Data fetching functions
export async function getQuizWithQuestions(quizId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        attempts: {
          where: { userId: session.user.id },
          orderBy: { startedAt: "desc" },
        },
      },
    });

    return quiz;
  } catch (error) {
    console.error("Get quiz with questions error:", error);
    return null;
  }
}

export async function getQuizAttempts(quizId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId,
        userId: session.user.id,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return attempts;
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    return [];
  }
}

export async function getQuizStats(quizId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    } // Validate instructor access
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!quiz || quiz.lesson.module.course.instructorId !== session.user.id) {
      throw new Error(
        "Unauthorized: You can only view stats for your own quizzes"
      );
    }

    // Get quiz attempts and calculate stats
    const attempts = await db.quizAttempt.findMany({
      where: { quizId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        averageTimeSpent: 0,
        questionStats: [],
      };
    }

    const totalAttempts = attempts.length;
    const averageScore =
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
    const passedAttempts = attempts.filter((attempt) => attempt.passed).length;
    const passRate = (passedAttempts / totalAttempts) * 100;
    const averageTimeSpent =
      attempts.reduce((sum, attempt) => sum + (attempt.timeSpent ?? 0), 0) /
      totalAttempts;

    // Calculate question statistics
    const questionStats =
      quiz.questions?.map((question) => {
        const questionAnswers = attempts.flatMap((attempt) =>
          attempt.answers.filter((answer) => answer.questionId === question.id)
        );

        const correctAnswers = questionAnswers.filter(
          (answer) => answer.isCorrect
        ).length;
        const totalAnswers = questionAnswers.length;
        const accuracy =
          totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        return {
          questionId: question.id,
          question: question.question,
          correctAnswers,
          totalAnswers,
          accuracy,
        };
      }) ?? [];

    return {
      totalAttempts,
      averageScore,
      passRate,
      averageTimeSpent,
      questionStats,
    };
  } catch (error) {
    console.error("Get quiz stats error:", error);
    return null;
  }
}
