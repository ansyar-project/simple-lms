import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentTypeSelector, { type ContentType } from "../ContentTypeSelector";

describe("ContentTypeSelector", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: "TEXT" as ContentType,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all content type options", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      expect(screen.getByText("Text Content")).toBeInTheDocument();
      expect(screen.getByText("Video")).toBeInTheDocument();
      expect(screen.getByText("Quiz")).toBeInTheDocument();
      expect(screen.getByText("Assignment")).toBeInTheDocument();
    });

    it("should display content type descriptions", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      expect(screen.getByText("Rich text lesson content")).toBeInTheDocument();
      expect(
        screen.getByText("Video lesson with optional text")
      ).toBeInTheDocument();
      expect(screen.getByText("Interactive quiz")).toBeInTheDocument();
      expect(screen.getByText("Assignment task")).toBeInTheDocument();
    });

    it("should show content type icons", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      // Check that icon elements are present (they are rendered as SVG elements)
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);

      buttons.forEach((button) => {
        expect(button.querySelector("svg")).toBeInTheDocument();
      });
    });
    it("should highlight selected content type", () => {
      render(<ContentTypeSelector value="VIDEO" onChange={mockOnChange} />);

      const videoButton = screen.getByText("Video").closest("button");
      expect(videoButton).toHaveClass("border-primary");
      expect(videoButton).toHaveClass("bg-primary/5");
    });
    it("should not highlight unselected content types", () => {
      render(<ContentTypeSelector value="VIDEO" onChange={mockOnChange} />);

      const textButton = screen.getByText("Text Content").closest("button");
      expect(textButton).not.toHaveClass("border-primary");
      expect(textButton).toHaveClass("border-gray-200");
    });
  });

  describe("Interactions", () => {
    it("should call onChange when TEXT content type is selected", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector value="VIDEO" onChange={mockOnChange} />);

      const textButton = screen.getByText("Text Content");
      await user.click(textButton);

      expect(mockOnChange).toHaveBeenCalledWith("TEXT");
    });

    it("should call onChange when VIDEO content type is selected", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} />);

      const videoButton = screen.getByText("Video");
      await user.click(videoButton);

      expect(mockOnChange).toHaveBeenCalledWith("VIDEO");
    });

    it("should not call onChange when disabled content type is clicked", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} />);

      const quizButton = screen.getByText("Quiz").closest("button");
      const assignmentButton = screen.getByText("Assignment").closest("button");

      expect(quizButton).toBeDisabled();
      expect(assignmentButton).toBeDisabled();

      // Clicking disabled buttons should not trigger onChange
      if (quizButton) await user.click(quizButton);
      if (assignmentButton) await user.click(assignmentButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} />);

      const textButton = screen.getByText("Text Content").closest("button");
      const videoButton = screen.getByText("Video").closest("button");

      // Focus first button
      textButton?.focus();
      expect(textButton).toHaveFocus();

      // Tab to next button
      await user.tab();
      expect(videoButton).toHaveFocus();
    });

    it("should handle Enter key selection", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} />);

      const videoButton = screen.getByText("Video").closest("button");
      videoButton?.focus();

      await user.keyboard("{Enter}");

      expect(mockOnChange).toHaveBeenCalledWith("VIDEO");
    });

    it("should handle Space key selection", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} />);

      const videoButton = screen.getByText("Video").closest("button");
      videoButton?.focus();

      await user.keyboard(" ");

      expect(mockOnChange).toHaveBeenCalledWith("VIDEO");
    });
  });

  describe("Disabled State", () => {
    it("should disable all options when disabled prop is true", () => {
      render(<ContentTypeSelector {...defaultProps} disabled={true} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should not call onChange when disabled", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} disabled={true} />);

      const textButton = screen.getByText("Text Content");
      await user.click(textButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should show Quiz and Assignment as coming soon (disabled)", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      const quizButton = screen.getByText("Quiz").closest("button");
      const assignmentButton = screen.getByText("Assignment").closest("button");

      expect(quizButton).toBeDisabled();
      expect(assignmentButton).toBeDisabled();

      // Should have visual indication of being disabled
      expect(quizButton).toHaveClass("opacity-50");
      expect(assignmentButton).toHaveClass("opacity-50");
    });
  });

  describe("Visual States", () => {
    it("should apply correct styling for selected state", () => {
      render(<ContentTypeSelector value="TEXT" onChange={mockOnChange} />);

      const textButton = screen.getByText("Text Content").closest("button");
      expect(textButton).toHaveClass("border-primary");
      expect(textButton).toHaveClass("bg-primary/5");
    });
    it("should apply correct styling for unselected state", () => {
      render(<ContentTypeSelector value="TEXT" onChange={mockOnChange} />);

      const videoButton = screen.getByText("Video").closest("button");
      expect(videoButton).toHaveClass("border-gray-200");
      expect(videoButton).toHaveClass("hover:border-primary/50");
    });
    it("should apply hover effects on enabled options", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      const textButton = screen.getByText("Text Content").closest("button");
      const videoButton = screen.getByText("Video").closest("button");

      // Selected button should have primary border, unselected should have hover effect
      expect(textButton).toHaveClass("border-primary");
      expect(videoButton).toHaveClass("hover:border-primary/50");
    });

    it("should not apply hover effects on disabled options", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      const quizButton = screen.getByText("Quiz").closest("button");
      const assignmentButton = screen.getByText("Assignment").closest("button");

      expect(quizButton).toHaveClass("opacity-50");
      expect(assignmentButton).toHaveClass("opacity-50");
    });
  });

  describe("Content Type Values", () => {
    it("should handle all valid content type values", () => {
      const contentTypes: ContentType[] = [
        "TEXT",
        "VIDEO",
        "QUIZ",
        "ASSIGNMENT",
      ];

      contentTypes.forEach((type) => {
        const { rerender } = render(
          <ContentTypeSelector value={type} onChange={mockOnChange} />
        );

        // Should render without crashing
        expect(screen.getAllByRole("button")).toHaveLength(4);

        rerender(<div />); // Clean up
      });
    });

    it("should maintain type safety", () => {
      // This test ensures TypeScript compilation works correctly
      const validValue: ContentType = "TEXT";

      render(
        <ContentTypeSelector value={validValue} onChange={mockOnChange} />
      );

      expect(screen.getByText("Text Content")).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should render in responsive grid layout", () => {
      const { container } = render(<ContentTypeSelector {...defaultProps} />);

      // Find the grid container (first child should be the grid div)
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass("grid");
      expect(gridContainer).toHaveClass("grid-cols-1");
      expect(gridContainer).toHaveClass("md:grid-cols-2");
    });

    it("should display all options in grid", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);
    });
  });
  describe("Accessibility", () => {
    it("should have proper button elements", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);

      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("should disable unavailable options", () => {
      render(<ContentTypeSelector {...defaultProps} />);

      const quizButton = screen.getByText("Quiz").closest("button");
      const assignmentButton = screen.getByText("Assignment").closest("button");

      expect(quizButton).toBeDisabled();
      expect(assignmentButton).toBeDisabled();
    });

    it("should be focusable with keyboard", async () => {
      const user = userEvent.setup();
      render(<ContentTypeSelector {...defaultProps} />);

      const firstButton = screen.getAllByRole("button")[0];

      await user.tab();
      expect(firstButton).toHaveFocus();
    });
  });
});
