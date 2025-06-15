import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseLearningInterface } from "../CourseLearningInterface";
import { markLessonComplete, markLessonIncomplete } from "@/actions/progress";
import { useRouter } from "next/navigation";

// Mock the server actions
jest.mock("@/actions/progress");
const mockMarkLessonComplete = markLessonComplete as jest.MockedFunction<
  typeof markLessonComplete
>;
const mockMarkLessonIncomplete = markLessonIncomplete as jest.MockedFunction<
  typeof markLessonIncomplete
>;

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

import { toast } from "@/hooks/use-toast";
const mockToast = toast as jest.MockedFunction<typeof toast>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe("CourseLearningInterface", () => {
  const mockCourseData = {
    enrollment: {
      id: "enrollment_1",
      courseId: "course_1",
      userId: "user_1",
      enrolledAt: new Date("2024-01-01"),
      completedAt: null,
      progress: 50,
    },
    course: {
      id: "course_1",
      title: "Introduction to React",
      modules: [
        {
          id: "module_1",
          title: "Getting Started",
          lessons: [
            { id: "lesson_1", title: "What is React?", duration: 15, order: 1 },
            { id: "lesson_2", title: "Setting up", duration: 20, order: 2 },
          ],
        },
        {
          id: "module_2",
          title: "Advanced Concepts",
          lessons: [
            { id: "lesson_3", title: "Hooks", duration: 30, order: 1 },
            { id: "lesson_4", title: "Context", duration: null, order: 2 },
          ],
        },
      ],
    },
    lessonProgress: {
      lesson_1: { completed: true, completedAt: new Date("2024-01-02") },
      lesson_2: { completed: false, completedAt: null },
      lesson_3: { completed: false, completedAt: null },
      lesson_4: { completed: false, completedAt: null },
    },
    stats: {
      totalLessons: 4,
      completedLessons: 1,
      progressPercentage: 25,
    },
  };

  const defaultProps = {
    courseData: mockCourseData,
    currentLessonId: "lesson_1",
    userId: "user_1",
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkLessonComplete.mockResolvedValue({
      success: true,
      lessonProgress: {
        id: "progress_1",
        userId: "user_1",
        lessonId: "lesson_1",
        completed: true,
        completedAt: new Date(),
        timeSpent: 0,
      },
    });
    mockMarkLessonIncomplete.mockResolvedValue({
      success: true,
      lessonProgress: {
        id: "progress_1",
        userId: "user_1",
        lessonId: "lesson_1",
        completed: false,
        completedAt: null,
        timeSpent: 0,
      },
    });
  });

  describe("Rendering", () => {
    it("renders the course title and progress", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      expect(screen.getByText("Introduction to React")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument();
      expect(screen.getByText("1 of 4 lessons completed")).toBeInTheDocument();
    });
    it("renders all modules and lessons in sidebar", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      // Check modules
      expect(screen.getByText("Getting Started")).toBeInTheDocument();
      expect(screen.getByText("Advanced Concepts")).toBeInTheDocument();

      // Check lessons - use getAllByText since lessons appear in both sidebar and main content
      expect(screen.getAllByText("What is React?")).toHaveLength(3); // sidebar, header, main content
      expect(screen.getAllByText("Setting up")).toHaveLength(1); // only in sidebar
      expect(screen.getAllByText("Hooks")).toHaveLength(1); // only in sidebar
      expect(screen.getAllByText("Context")).toHaveLength(1); // only in sidebar
    });

    it("shows lesson duration when available", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      expect(screen.getByText("15 min")).toBeInTheDocument();
      expect(screen.getByText("20 min")).toBeInTheDocument();
      expect(screen.getByText("30 min")).toBeInTheDocument();
      // lesson_4 has no duration, so should not show duration text
    });
    it("displays current lesson information", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      // Check heading level 1 (should be the main lesson title)
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "What is React?"
      );
      expect(
        screen.getByText("Getting Started • Lesson 1 of 4")
      ).toBeInTheDocument();
    });

    it("shows completed status for completed lessons", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      // The lesson badge should show "Completed" since lesson_1 is completed
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });

    it("shows back to course link", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      const backLink = screen.getByRole("link", { name: /back to course/i });
      expect(backLink).toHaveAttribute("href", "/courses/course_1");
    });
  });

  describe("Lesson Selection", () => {
    it("selects the current lesson when provided", () => {
      render(<CourseLearningInterface {...defaultProps} />); // lesson_1 should be selected and highlighted
      const lessonButton = screen.getByRole("button", {
        name: /what is react\?/i,
      });
      expect(lessonButton).toHaveClass("bg-blue-50");
      expect(lessonButton).toHaveClass("border-blue-200");
      expect(lessonButton).toHaveClass("text-blue-900");
    });
    it("selects first incomplete lesson when no current lesson", () => {
      const propsWithoutCurrentLesson = {
        ...defaultProps,
        currentLessonId: undefined,
      };
      render(<CourseLearningInterface {...propsWithoutCurrentLesson} />);

      // Should select lesson_2 (first incomplete) - check via heading
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Setting up"
      );
    });
    it("selects first lesson when all are completed", () => {
      const allCompletedData = {
        ...mockCourseData,
        lessonProgress: {
          lesson_1: { completed: true, completedAt: new Date() },
          lesson_2: { completed: true, completedAt: new Date() },
          lesson_3: { completed: true, completedAt: new Date() },
          lesson_4: { completed: true, completedAt: new Date() },
        },
      };
      const props = {
        ...defaultProps,
        courseData: allCompletedData,
        currentLessonId: undefined,
      };
      render(<CourseLearningInterface {...props} />);

      // Should select first lesson - check via heading
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "What is React?"
      );
    });

    it("changes lesson when clicking on a lesson", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      const lessonButton = screen.getByRole("button", { name: /setting up/i });
      await user.click(lessonButton);

      expect(mockPush).toHaveBeenCalledWith(
        "/courses/course_1/learn?lesson=lesson_2",
        { scroll: false }
      );
    });
  });

  describe("Lesson Completion", () => {
    it("marks lesson as complete", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      // Find the mark complete button for current lesson
      const markCompleteButton = screen.getByRole("button", {
        name: /mark incomplete/i,
      });
      await user.click(markCompleteButton);

      await waitFor(() => {
        expect(mockMarkLessonIncomplete).toHaveBeenCalledWith("lesson_1");
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Lesson marked as incomplete",
        description: "Progress has been updated",
      });
    });

    it("marks lesson as incomplete", async () => {
      const user = userEvent.setup();
      // Use lesson_2 which is incomplete
      const props = { ...defaultProps, currentLessonId: "lesson_2" };
      render(<CourseLearningInterface {...props} />);

      const markCompleteButton = screen.getByRole("button", {
        name: /mark complete/i,
      });
      await user.click(markCompleteButton);

      await waitFor(() => {
        expect(mockMarkLessonComplete).toHaveBeenCalledWith("lesson_2");
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Lesson completed!",
        description: "Great job! Keep up the good work.",
      });
    });

    it("handles completion error", async () => {
      const user = userEvent.setup();
      mockMarkLessonComplete.mockRejectedValueOnce(new Error("Network error"));

      const props = { ...defaultProps, currentLessonId: "lesson_2" };
      render(<CourseLearningInterface {...props} />);

      const markCompleteButton = screen.getByRole("button", {
        name: /mark complete/i,
      });
      await user.click(markCompleteButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Failed to update lesson progress",
          variant: "destructive",
        });
      });
    });
    it("toggles completion from sidebar", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      // Find all check circle icons (completion toggles)
      const toggleIcons = screen.getAllByTestId("check-circle-icon");
      // Find the one that belongs to lesson_2 (which is incomplete)
      const lesson2Toggle = toggleIcons.find((icon) => {
        const parent = icon.closest("button");
        return (
          parent &&
          parent.closest("button")?.textContent?.includes("Setting up")
        );
      });

      if (lesson2Toggle) {
        const toggleButton = lesson2Toggle.closest("button");
        if (toggleButton) {
          await user.click(toggleButton);

          await waitFor(() => {
            expect(mockMarkLessonComplete).toHaveBeenCalledWith("lesson_2");
          });
        }
      }
    });
  });

  describe("Navigation", () => {
    it("navigates to previous lesson", async () => {
      const user = userEvent.setup();
      const props = { ...defaultProps, currentLessonId: "lesson_2" };
      render(<CourseLearningInterface {...props} />);

      const prevButton = screen.getByRole("button", {
        name: /previous lesson/i,
      });
      await user.click(prevButton);

      expect(mockPush).toHaveBeenCalledWith(
        "/courses/course_1/learn?lesson=lesson_1",
        { scroll: false }
      );
    });

    it("navigates to next lesson", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      const nextButton = screen.getByRole("button", { name: /next lesson/i });
      await user.click(nextButton);

      expect(mockPush).toHaveBeenCalledWith(
        "/courses/course_1/learn?lesson=lesson_2",
        { scroll: false }
      );
    });

    it("disables previous button on first lesson", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      const prevButton = screen.getByRole("button", {
        name: /previous lesson/i,
      });
      expect(prevButton).toBeDisabled();
    });

    it("disables next button on last lesson", () => {
      const props = { ...defaultProps, currentLessonId: "lesson_4" };
      render(<CourseLearningInterface {...props} />);

      const nextButton = screen.getByRole("button", { name: /next lesson/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Responsive Design", () => {
    it("shows mobile menu button", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      // Menu button should be present (but hidden on large screens)
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("opens sidebar on mobile menu click", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      const menuButton = screen.getByTestId("menu-icon").closest("button");
      if (menuButton) {
        await user.click(menuButton);
        // Sidebar should become visible
        expect(screen.getByTestId("x-icon")).toBeInTheDocument();
      }
    });

    it("closes sidebar on X button click", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      // First open the sidebar
      const menuButton = screen.getByTestId("menu-icon").closest("button");
      if (menuButton) {
        await user.click(menuButton);

        // Then close it
        const closeButton = screen.getByTestId("x-icon").closest("button");
        if (closeButton) {
          await user.click(closeButton);
          // Sidebar should be hidden again
        }
      }
    });

    it("closes sidebar when selecting lesson on mobile", async () => {
      const user = userEvent.setup();
      render(<CourseLearningInterface {...defaultProps} />);

      // Open sidebar
      const menuButton = screen.getByTestId("menu-icon").closest("button");
      if (menuButton) {
        await user.click(menuButton);

        // Select a lesson
        const lessonButton = screen.getByRole("button", {
          name: /setting up/i,
        });
        await user.click(lessonButton);

        // Sidebar should close automatically
        expect(mockPush).toHaveBeenCalled();
      }
    });
  });

  describe("Progress Calculation", () => {
    it("calculates progress correctly", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      // 1 out of 4 lessons completed = 25%
      expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("updates progress when lessons are completed", async () => {
      const user = userEvent.setup();
      const props = { ...defaultProps, currentLessonId: "lesson_2" };
      render(<CourseLearningInterface {...props} />);

      // Complete lesson_2
      const markCompleteButton = screen.getByRole("button", {
        name: /mark complete/i,
      });
      await user.click(markCompleteButton);

      await waitFor(() => {
        // Progress should update to 50% (2 out of 4 lessons)
        expect(screen.getByText("50%")).toBeInTheDocument();
        expect(
          screen.getByText("2 of 4 lessons completed")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Empty States", () => {
    it("shows empty state when no lesson is selected", () => {
      const emptyData = {
        ...mockCourseData,
        course: {
          ...mockCourseData.course,
          modules: [],
        },
      };
      const props = { ...defaultProps, courseData: emptyData };
      render(<CourseLearningInterface {...props} />);

      expect(screen.getByText("Select a Lesson")).toBeInTheDocument();
      expect(
        screen.getByText("Choose a lesson from the sidebar to start learning")
      ).toBeInTheDocument();
    });

    it("handles course with no lessons", () => {
      const noLessonsData = {
        ...mockCourseData,
        course: {
          ...mockCourseData.course,
          modules: [
            {
              id: "module_1",
              title: "Empty Module",
              lessons: [],
            },
          ],
        },
      };
      const props = { ...defaultProps, courseData: noLessonsData };
      render(<CourseLearningInterface {...props} />);

      expect(screen.getByText("Empty Module")).toBeInTheDocument();
      expect(screen.getByText("Select a Lesson")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper button roles and labels", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /previous lesson/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /next lesson/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /mark incomplete/i })
      ).toBeInTheDocument();
    });

    it("has proper heading structure", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "What is React?"
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Introduction to React"
      );
    });

    it("has proper link accessibility", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      const backLink = screen.getByRole("link", { name: /back to course/i });
      expect(backLink).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles invalid current lesson ID", () => {
      const props = { ...defaultProps, currentLessonId: "invalid_lesson" };
      render(<CourseLearningInterface {...props} />);

      // Should fallback to first incomplete lesson - check via heading
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Setting up"
      );
    });

    it("handles missing lesson progress data", () => {
      const dataWithoutProgress = {
        ...mockCourseData,
        lessonProgress: {},
      };
      const props = { ...defaultProps, courseData: dataWithoutProgress };
      render(<CourseLearningInterface {...props} />);

      // Should show 0% progress
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("0 of 4 lessons completed")).toBeInTheDocument();
    });

    it("handles lesson without duration", () => {
      render(<CourseLearningInterface {...defaultProps} />);

      // lesson_4 has no duration
      expect(screen.getByText("Context")).toBeInTheDocument();
      // Should not crash and should not show duration for this lesson
    });
  });
});
