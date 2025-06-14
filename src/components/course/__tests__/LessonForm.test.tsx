import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LessonForm from "../LessonForm";
import { createLesson, updateLesson } from "@/actions/lessons";

// Mock the server actions
jest.mock("@/actions/lessons");
const mockCreateLesson = createLesson as jest.MockedFunction<
  typeof createLesson
>;
const mockUpdateLesson = updateLesson as jest.MockedFunction<
  typeof updateLesson
>;

// Mock useActionState
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: jest.fn((action, initialState) => [
    initialState,
    action,
    false,
  ]),
}));

// Mock RichTextEditor
jest.mock("@/components/ui/rich-text-editor", () => {
  return function MockRichTextEditor({
    content,
    onChange,
    placeholder,
  }: {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
  }) {
    return (
      <textarea
        data-testid="rich-text-editor"
        value={content ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    );
  };
});

describe("LessonForm", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    moduleId: "module_123",
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("should render create lesson form", () => {
      render(<LessonForm {...defaultProps} />);

      expect(screen.getByText("Create Lesson")).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/content type/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create lesson/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("should display content type options", () => {
      render(<LessonForm {...defaultProps} />);

      expect(screen.getByText("Text Content")).toBeInTheDocument();
      expect(screen.getByText("Video")).toBeInTheDocument();
      expect(screen.getByText("Quiz")).toBeInTheDocument();
      expect(screen.getByText("Assignment")).toBeInTheDocument();
    });
    it("should show rich text editor for TEXT content type", async () => {
      render(<LessonForm {...defaultProps} />);

      // Text content type should be selected by default
      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    });

    it("should show video URL field for VIDEO content type", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      // Click on Video content type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/video url/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      });
    });

    it("should allow user to input lesson details", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const contentEditor = screen.getByTestId("rich-text-editor");

      await user.type(titleInput, "Introduction to Components");
      await user.type(contentEditor, "<p>This is lesson content</p>");

      expect(titleInput).toHaveValue("Introduction to Components");
      expect(contentEditor).toHaveValue("<p>This is lesson content</p>");
    });

    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("should submit form with TEXT lesson data", async () => {
      const user = userEvent.setup();

      mockCreateLesson.mockResolvedValue({
        success: true,
        message: "Lesson created successfully",
      });

      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const contentEditor = screen.getByTestId("rich-text-editor");
      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });

      await user.type(titleInput, "Introduction to Components");
      await user.type(contentEditor, "<p>This is lesson content</p>");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateLesson).toHaveBeenCalled();
      });
    });

    it("should submit form with VIDEO lesson data", async () => {
      const user = userEvent.setup();

      mockCreateLesson.mockResolvedValue({
        success: true,
        message: "Lesson created successfully",
      });

      render(<LessonForm {...defaultProps} />);

      // Switch to video content type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }

      const titleInput = screen.getByLabelText(/title/i);
      const videoUrlInput = await screen.findByLabelText(/video url/i);
      const durationInput = await screen.findByLabelText(/duration/i);
      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });

      await user.type(titleInput, "Video Tutorial");
      await user.type(videoUrlInput, "https://example.com/video.mp4");
      await user.type(durationInput, "3600");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateLesson).toHaveBeenCalled();
      });
    });

    it("should show validation errors for invalid input", async () => {
      const user = userEvent.setup();

      mockCreateLesson.mockResolvedValue({
        success: false,
        message: "Validation failed",
        errors: {
          title: ["Title must be at least 3 characters"],
        },
      });

      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });

      await user.type(titleInput, "Ab");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Title must be at least 3 characters")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Edit Mode", () => {
    const mockLesson = {
      id: "lesson_123",
      title: "Existing Lesson",
      content: "<p>Existing content</p>",
      contentType: "TEXT",
      order: 1,
    };

    const editProps = {
      ...defaultProps,
      lesson: mockLesson,
    };

    it("should render edit lesson form with existing data", () => {
      render(<LessonForm {...editProps} />);

      expect(screen.getByText("Edit Lesson")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Existing Lesson")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("<p>Existing content</p>")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it("should call updateLesson when form is submitted", async () => {
      const user = userEvent.setup();

      mockUpdateLesson.mockResolvedValue({
        success: true,
        message: "Lesson updated successfully",
      });

      render(<LessonForm {...editProps} />);

      const titleInput = screen.getByDisplayValue("Existing Lesson");
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Lesson Title");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateLesson).toHaveBeenCalled();
      });
    });

    it("should call onSuccess when lesson is updated successfully", async () => {
      const user = userEvent.setup();

      mockUpdateLesson.mockResolvedValue({
        success: true,
        message: "Lesson updated successfully",
      });

      render(<LessonForm {...editProps} />);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle VIDEO content type in edit mode", () => {
      const videoLesson = {
        ...mockLesson,
        contentType: "VIDEO",
        videoUrl: "https://example.com/video.mp4",
        duration: 3600,
      };

      render(<LessonForm {...defaultProps} lesson={videoLesson} />);

      expect(
        screen.getByDisplayValue("https://example.com/video.mp4")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue(3600)).toBeInTheDocument();
    });
  });

  describe("Content Type Selection", () => {
    it("should switch between content types", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      // Should start with TEXT type (rich text editor visible)
      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();

      // Switch to VIDEO type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/video url/i)).toBeInTheDocument();
        expect(
          screen.queryByTestId("rich-text-editor")
        ).not.toBeInTheDocument();
      });
    });

    it("should show appropriate fields for each content type", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      // TEXT type - should show rich text editor
      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();

      // Switch to VIDEO type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/video url/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      });
    });

    it("should disable QUIZ and ASSIGNMENT types", () => {
      render(<LessonForm {...defaultProps} />);

      const quizOption = screen.getByText("Quiz").closest("button");
      const assignmentOption = screen.getByText("Assignment").closest("button");

      expect(quizOption).toBeDisabled();
      expect(assignmentOption).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("should validate required title field", async () => {
      const user = userEvent.setup();

      mockCreateLesson.mockResolvedValue({
        success: false,
        message: "Validation failed",
        errors: {
          title: ["Title is required"],
        },
      });

      render(<LessonForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });
    });

    it("should validate video URL format", async () => {
      const user = userEvent.setup();

      mockCreateLesson.mockResolvedValue({
        success: false,
        message: "Validation failed",
        errors: {
          videoUrl: ["Invalid video URL"],
        },
      });

      render(<LessonForm {...defaultProps} />);

      // Switch to video content type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }

      const titleInput = screen.getByLabelText(/title/i);
      const videoUrlInput = await screen.findByLabelText(/video url/i);
      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });

      await user.type(titleInput, "Video Tutorial");
      await user.type(videoUrlInput, "invalid-url");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid video URL")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels and associations", () => {
      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute("id");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);

      await user.tab();
      expect(titleInput).toHaveFocus();
    });
  });
});
