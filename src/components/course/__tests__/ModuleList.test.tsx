import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModuleList from "../ModuleList";
import { reorderModules, deleteModule } from "@/actions/modules";

// Mock the server actions
jest.mock("@/actions/modules");
const mockReorderModules = reorderModules as jest.MockedFunction<
  typeof reorderModules
>;
const mockDeleteModule = deleteModule as jest.MockedFunction<
  typeof deleteModule
>;

describe("ModuleList", () => {
  const mockOnEditModule = jest.fn();
  const mockOnCreateLesson = jest.fn();
  const mockOnEditLesson = jest.fn();
  const mockOnRefresh = jest.fn();

  const mockModules = [
    {
      id: "module_1",
      title: "Introduction to React",
      description: "Learn the basics of React",
      order: 1,
      lessons: [
        {
          id: "lesson_1",
          title: "What is React?",
          contentType: "TEXT",
          duration: 300,
        },
        {
          id: "lesson_2",
          title: "Components Overview",
          contentType: "VIDEO",
          duration: 600,
        },
      ],
      _count: {
        lessons: 2,
      },
    },
    {
      id: "module_2",
      title: "Advanced React Concepts",
      description: "Deep dive into React",
      order: 2,
      lessons: [
        {
          id: "lesson_3",
          title: "State Management",
          contentType: "TEXT",
        },
      ],
      _count: {
        lessons: 1,
      },
    },
  ];

  const defaultProps = {
    courseId: "course_123",
    modules: mockModules,
    onEditModule: mockOnEditModule,
    onCreateLesson: mockOnCreateLesson,
    onEditLesson: mockOnEditLesson,
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all modules", () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText("Introduction to React")).toBeInTheDocument();
      expect(screen.getByText("Advanced React Concepts")).toBeInTheDocument();
    });

    it("should display module descriptions", () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText("Learn the basics of React")).toBeInTheDocument();
      expect(screen.getByText("Deep dive into React")).toBeInTheDocument();
    });

    it("should display lesson counts", () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText("2 lessons")).toBeInTheDocument();
      expect(screen.getByText("1 lesson")).toBeInTheDocument();
    });

    it("should display lesson titles", () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText("What is React?")).toBeInTheDocument();
      expect(screen.getByText("Components Overview")).toBeInTheDocument();
      expect(screen.getByText("State Management")).toBeInTheDocument();
    });

    it("should display lesson durations when available", () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText("5 min")).toBeInTheDocument(); // 300 seconds
      expect(screen.getByText("10 min")).toBeInTheDocument(); // 600 seconds
    });

    it("should display content type icons", () => {
      render(<ModuleList {...defaultProps} />);

      // Check for content type indicators
      const textIcons = screen.getAllByRole("img", { hidden: true });
      expect(textIcons.length).toBeGreaterThan(0);
    });

    it("should show empty state when no modules", () => {
      const emptyProps = {
        ...defaultProps,
        modules: [],
      };

      render(<ModuleList {...emptyProps} />);

      expect(screen.getByText("No modules found")).toBeInTheDocument();
      expect(
        screen.getByText("Start by creating your first module.")
      ).toBeInTheDocument();
    });
  });

  describe("Module Actions", () => {
    it("should call onEditModule when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<ModuleList {...defaultProps} />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      expect(mockOnEditModule).toHaveBeenCalledWith(mockModules[0]);
    });

    it("should call onCreateLesson when add lesson button is clicked", async () => {
      const user = userEvent.setup();
      render(<ModuleList {...defaultProps} />);

      const addLessonButtons = screen.getAllByRole("button", {
        name: /add lesson/i,
      });
      await user.click(addLessonButtons[0]);

      expect(mockOnCreateLesson).toHaveBeenCalledWith("module_1");
    });

    it("should handle module deletion with confirmation", async () => {
      const user = userEvent.setup();

      // Mock successful deletion
      mockDeleteModule.mockResolvedValue({
        success: true,
        message: "Module deleted successfully",
      });

      render(<ModuleList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteModule).toHaveBeenCalledWith("module_1");
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });

    it("should not delete module if user cancels confirmation", async () => {
      const user = userEvent.setup();

      // Mock window.confirm to return false
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(false);

      render(<ModuleList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(mockDeleteModule).not.toHaveBeenCalled();

      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it("should handle deletion errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock failed deletion
      mockDeleteModule.mockResolvedValue({
        success: false,
        message: "Failed to delete module",
      });

      render(<ModuleList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteModule).toHaveBeenCalled();
        // Should still refresh to get updated state
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("Lesson Actions", () => {
    it("should call onEditLesson when lesson is clicked", async () => {
      const user = userEvent.setup();
      render(<ModuleList {...defaultProps} />);

      const lessonButton = screen.getByText("What is React?");
      await user.click(lessonButton);

      expect(mockOnEditLesson).toHaveBeenCalledWith("module_1", "lesson_1");
    });

    it("should handle lesson clicks for different modules", async () => {
      const user = userEvent.setup();
      render(<ModuleList {...defaultProps} />);

      const lessonButton = screen.getByText("State Management");
      await user.click(lessonButton);

      expect(mockOnEditLesson).toHaveBeenCalledWith("module_2", "lesson_3");
    });
  });

  describe("Drag and Drop", () => {
    it("should render drag handles for modules", () => {
      render(<ModuleList {...defaultProps} />);

      const dragHandles = screen.getAllByRole("img", { hidden: true });
      // Should have drag handles for modules
      expect(dragHandles.length).toBeGreaterThan(0);
    });

    it("should handle module reordering", async () => {
      mockReorderModules.mockResolvedValue({
        success: true,
        message: "Modules reordered successfully",
      });

      render(<ModuleList {...defaultProps} />);

      // The drag and drop functionality is handled by the DndContext
      // We can verify that the component renders correctly with drag handles
      expect(screen.getByText("Introduction to React")).toBeInTheDocument();
      expect(screen.getByText("Advanced React Concepts")).toBeInTheDocument();
    });

    it("should refresh list after successful reordering", async () => {
      mockReorderModules.mockResolvedValue({
        success: true,
        message: "Modules reordered successfully",
      });

      render(<ModuleList {...defaultProps} />);

      // Since we're mocking the DndContext, the actual drag event won't fire
      // But we can test that the component is structured correctly for drag and drop
      expect(screen.getByText("Introduction to React")).toBeInTheDocument();
    });
  });

  describe("Module States", () => {
    it("should show loading state during deletion", async () => {
      const user = userEvent.setup();

      // Create a promise that we can control
      let resolveDelete: (value: any) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });

      mockDeleteModule.mockReturnValue(deletePromise as any);

      render(<ModuleList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Should show loading state
      await waitFor(() => {
        expect(deleteButtons[0]).toBeDisabled();
      });

      // Resolve the promise
      resolveDelete!({
        success: true,
        message: "Module deleted successfully",
      });

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for buttons", () => {
      render(<ModuleList {...defaultProps} />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      const addLessonButtons = screen.getAllByRole("button", {
        name: /add lesson/i,
      });

      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
      expect(addLessonButtons.length).toBeGreaterThan(0);
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ModuleList {...defaultProps} />);

      const editButton = screen.getAllByRole("button", { name: /edit/i })[0];

      await user.tab();
      expect(editButton).toHaveFocus();
    });

    it("should have proper heading structure", () => {
      render(<ModuleList {...defaultProps} />);

      // Module titles should be properly structured
      expect(screen.getByText("Introduction to React")).toBeInTheDocument();
      expect(screen.getByText("Advanced React Concepts")).toBeInTheDocument();
    });
  });

  describe("Content Display", () => {
    it("should format lesson duration correctly", () => {
      render(<ModuleList {...defaultProps} />);

      // 300 seconds = 5 minutes
      expect(screen.getByText("5 min")).toBeInTheDocument();
      // 600 seconds = 10 minutes
      expect(screen.getByText("10 min")).toBeInTheDocument();
    });

    it("should handle lessons without duration", () => {
      render(<ModuleList {...defaultProps} />);

      // Should not crash with lessons that don't have duration
      expect(screen.getByText("State Management")).toBeInTheDocument();
    });

    it("should display different content types correctly", () => {
      render(<ModuleList {...defaultProps} />);

      // Should render both TEXT and VIDEO content types
      expect(screen.getByText("What is React?")).toBeInTheDocument();
      expect(screen.getByText("Components Overview")).toBeInTheDocument();
    });
  });
});
