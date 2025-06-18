import {  expect } from "@jest/globals";
import {
  createQuiz,
  publishQuiz,
  getQuizWithQuestions,
} from "../quizzes";
import { auth } from "@/lib/auth";

// Mock dependencies
jest.mock("@/lib/auth");

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock dependencies
jest.mock("@/lib/auth");
jest.mock("@/lib/db", () => ({
  db: {
    quiz: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    question: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    lesson: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    quizAttempt: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Import db after mocking
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe("Quiz System Actions", () => {
  const mockSession = {
    user: {
      id: "instructor123",
      role: "INSTRUCTOR",
    },
  };

  const mockLesson = {
    id: "lesson123",
    module: {
      course: {
        instructorId: "instructor123",
      },
    },
  };

  const mockQuizData = {
    lessonId: "lesson123",
    title: "Sample Quiz",
    description: "A sample quiz",
    instructions: "Answer all questions",
    timeLimit: 30,
    attemptsAllowed: 3,
    shuffleQuestions: false,
    showResults: true,
    passingScore: 70,
    questions: [
      {
        type: "MULTIPLE_CHOICE" as const,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        explanation: "Basic math",
        points: 10,
      },
      {
        type: "TRUE_FALSE" as const,
        question: "The sky is blue",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Common knowledge",
        points: 5,
      },
    ],
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession);
    (db.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
  });

  describe("createQuiz", () => {
    it("should create a quiz successfully", async () => {
      const mockCreatedQuiz = {
        id: "quiz123",
        ...mockQuizData,
        isPublished: false,
        questions: [],
      };
      (db.quiz.create as jest.Mock).mockResolvedValue(mockCreatedQuiz);
      (db.question.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (db.$transaction as jest.Mock).mockImplementation(
        async (callback) => await callback(db)
      );
      const result = await createQuiz(mockQuizData);

      expect(result).toEqual({
        success: true,
        quizId: "quiz123",
      });
      expect(db.quiz.create).toHaveBeenCalledWith({
        data: {
          lessonId: "lesson123",
          title: "Sample Quiz",
          description: "A sample quiz",
          instructions: "Answer all questions",
          timeLimit: 30,
          attemptsAllowed: 3,
          shuffleQuestions: false,
          showResults: true,
          passingScore: 70,
        },
      });

      expect(db.question.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            quizId: "quiz123",
            type: "MULTIPLE_CHOICE",
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4",
            explanation: "Basic math",
            points: 10,
            order: 0,
          }),
          expect.objectContaining({
            quizId: "quiz123",
            type: "TRUE_FALSE",
            question: "The sky is blue",
            options: ["True", "False"],
            correctAnswer: "True",
            explanation: "Common knowledge",
            points: 5,
            order: 1,
          }),
        ]),
      });
    });
    it("should fail if user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await createQuiz(mockQuizData);

      expect(result).toEqual({
        success: false,
        error: "NEXT_REDIRECT",
      });
    });
    it("should fail if lesson is not found", async () => {
      (db.lesson.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await createQuiz(mockQuizData);

      expect(result).toEqual({
        success: false,
        error: "Unauthorized: You can only create quizzes for your own courses",
      });
    });
  });

  describe("publishQuiz", () => {
    it("should publish a quiz successfully", async () => {
      const mockQuiz = {
        id: "quiz123",
        isPublished: false,
        questions: [{ id: "q1" }], // Has questions
        lesson: mockLesson,
      };
      (db.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (db.quiz.update as jest.Mock).mockResolvedValue({
        ...mockQuiz,
        isPublished: true,
      });

      const result = await publishQuiz("quiz123");

      expect(result).toEqual({
        success: true,
        quiz: {
          ...mockQuiz,
          isPublished: true,
        },
      });

      expect(db.quiz.update).toHaveBeenCalledWith({
        where: { id: "quiz123" },
        data: { isPublished: true },
      });
    });
    it("should fail if quiz is not found", async () => {
      (db.quiz.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await publishQuiz("quiz123");

      expect(result).toEqual({
        success: false,
        error: "Unauthorized: You can only publish your own quizzes",
      });
    });
  });

  describe("getQuizWithQuestions", () => {
    it("should retrieve a quiz successfully", async () => {
      const mockQuiz = {
        id: "quiz123",
        title: "Sample Quiz",
        isPublished: true,
        questions: [
          {
            id: "q1",
            type: "MULTIPLE_CHOICE",
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4",
            points: 10,
            order: 1,
          },
        ],
        lesson: {
          module: {
            course: {
              enrollments: [{ userId: "instructor123" }],
            },
          },
        },
      };

      (db.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);

      const result = await getQuizWithQuestions("quiz123");

      expect(result).toEqual(mockQuiz);
    });
    it("should throw error if quiz is not found", async () => {
      (db.quiz.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getQuizWithQuestions("quiz123");

      expect(result).toBeNull();
    });
  });
});
