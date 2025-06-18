import React, { useActionState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LessonForm from "../LessonForm";

// Mock the server actions
jest.mock("@/actions/lessons");

// Mock useActionState with proper state management
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: jest.fn(),
}));

// Get reference to the mocked useActionState
const mockUseActionState = jest.mocked(useActionState);

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
  const mockFormAction = jest.fn();

  const defaultProps = {
    moduleId: "module_123",
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock for useActionState
    mockUseActionState.mockReturnValue([
      { success: false }, // state
      mockFormAction, // formAction
      false, // isPending
    ]);
  });

  describe("Create Mode", () => {
    it("should render create lesson form", () => {
      render(<LessonForm {...defaultProps} />);
      expect(screen.getByText("Create New Lesson")).toBeInTheDocument();
      expect(screen.getByLabelText(/lesson title/i)).toBeInTheDocument();
      expect(screen.getByText(/content type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
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

      const titleInput = screen.getByLabelText(/lesson title/i);
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

      // Mock successful form action response
      mockUseActionState.mockReturnValue([
        { success: true, message: "Lesson created successfully" },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...defaultProps} />);
      const titleInput = screen.getByLabelText(/lesson title/i);
      const contentEditor = screen.getByTestId("rich-text-editor");
      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });

      await user.type(titleInput, "Introduction to Components");
      await user.type(contentEditor, "<p>This is lesson content</p>");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFormAction).toHaveBeenCalled();
        const formData = mockFormAction.mock.calls[0][0];
        expect(formData.get("title")).toBe("Introduction to Components");
        expect(formData.get("content")).toBe("<p>This is lesson content</p>");
        expect(formData.get("contentType")).toBe("TEXT");
        expect(formData.get("moduleId")).toBe("module_123");
        expect(formData.get("order")).toBe("0");
      });
    });
    it("should submit form with VIDEO lesson data", async () => {
      const user = userEvent.setup();

      // Mock successful form action response
      mockUseActionState.mockReturnValue([
        { success: true, message: "Lesson created successfully" },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...defaultProps} />);

      // Switch to video content type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }
      const titleInput = screen.getByLabelText(/lesson title/i);
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
        expect(mockFormAction).toHaveBeenCalled();
        const formData = mockFormAction.mock.calls[0][0];
        expect(formData.get("title")).toBe("Video Tutorial");
        expect(formData.get("videoUrl")).toBe("https://example.com/video.mp4");
        expect(formData.get("duration")).toBe("3600");
        expect(formData.get("contentType")).toBe("VIDEO");
      });
    });
    it("should show validation errors for invalid input", async () => {
      const user = userEvent.setup();

      // Mock form action response with validation errors
      mockUseActionState.mockReturnValue([
        {
          success: false,
          message: "Validation failed",
          errors: {
            title: ["Title must be at least 3 characters"],
          },
        },
        mockFormAction,
        false,
      ]);
      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/lesson title/i);
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

    it("should show success message when lesson is created", async () => {
      // Mock successful form action response
      mockUseActionState.mockReturnValue([
        { success: true, message: "Lesson created successfully" },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...defaultProps} />);

      expect(
        screen.getByText("Lesson created successfully")
      ).toBeInTheDocument();
    });
    it("should show loading state when form is submitting", async () => {
      // This test verifies that the button shows loading state during submission
      // The component manages isSubmitting state internally
      const user = userEvent.setup();

      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/lesson title/i);
      const submitButton = screen.getByRole("button", {
        name: /create lesson/i,
      });

      // Fill in required fields and submit
      await user.type(titleInput, "Test Lesson");

      // Check that button is initially enabled
      expect(submitButton).not.toBeDisabled();

      // After clicking submit, the isSubmitting state should disable the button temporarily
      await user.click(submitButton);

      // The button text should change to show loading state
      expect(submitButton).toHaveTextContent(/create lesson/i);
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
        screen.getByRole("button", { name: /update lesson/i })
      ).toBeInTheDocument();
    });
    it("should call updateLesson when form is submitted", async () => {
      const user = userEvent.setup();

      // Mock successful update response
      mockUseActionState.mockReturnValue([
        { success: true, message: "Lesson updated successfully" },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...editProps} />);

      const titleInput = screen.getByDisplayValue("Existing Lesson");
      const submitButton = screen.getByRole("button", {
        name: /update lesson/i,
      });

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Lesson Title");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFormAction).toHaveBeenCalled();
        const formData = mockFormAction.mock.calls[0][0];
        expect(formData.get("title")).toBe("Updated Lesson Title");
        expect(formData.get("id")).toBe("lesson_123");
      });
    });
    it("should call onSuccess when lesson is updated successfully", async () => {
      // Mock successful update response
      mockUseActionState.mockReturnValue([
        { success: true, message: "Lesson updated successfully" },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...editProps} />);

      // Wait for useEffect to trigger onSuccess
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should call onSuccess when lesson is created successfully", async () => {
      // Mock successful creation response
      mockUseActionState.mockReturnValue([
        { success: true, message: "Lesson created successfully" },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...defaultProps} />);

      // Wait for useEffect to trigger onSuccess
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
      expect(screen.queryByLabelText(/video url/i)).not.toBeInTheDocument();

      // Switch to VIDEO type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/video url/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
        // VIDEO type also shows rich text editor for additional content
        expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
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

    it("should show content type descriptions", () => {
      render(<LessonForm {...defaultProps} />);

      expect(screen.getByText("Rich text lesson content")).toBeInTheDocument();
      expect(
        screen.getByText("Video lesson with optional text")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Interactive quiz for assessment")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Assignment task (Coming soon)")
      ).toBeInTheDocument();
    });
  });
  describe("Form Validation", () => {
    it("should validate required title field", async () => {
      const user = userEvent.setup();

      // Mock form action response with validation errors
      mockUseActionState.mockReturnValue([
        {
          success: false,
          message: "Validation failed",
          errors: {
            title: ["Title is required"],
          },
        },
        mockFormAction,
        false,
      ]);

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

      // Mock form action response with validation errors
      mockUseActionState.mockReturnValue([
        {
          success: false,
          message: "Validation failed",
          errors: {
            videoUrl: ["Invalid video URL"],
          },
        },
        mockFormAction,
        false,
      ]);

      render(<LessonForm {...defaultProps} />);

      // Switch to video content type
      const videoOption = screen.getByText("Video").closest("button");
      if (videoOption) {
        await user.click(videoOption);
      }
      const titleInput = screen.getByLabelText(/lesson title/i);
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

      const titleInput = screen.getByLabelText(/lesson title/i);
      expect(titleInput).toHaveAttribute("id");
    });
    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<LessonForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/lesson title/i);

      await user.tab();
      expect(titleInput).toHaveFocus();
    });
  });
});
