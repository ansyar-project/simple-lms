/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RichTextEditor from "../rich-text-editor";
import { useEditor } from "@tiptap/react";

// Mock TipTap modules
jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(),
  EditorContent: ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-content">
      {editor ? "Editor content" : "No editor"}
    </div>
  ),
}));

jest.mock("@tiptap/starter-kit", () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockReturnValue({}),
  },
}));

jest.mock("@tiptap/extension-placeholder", () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockReturnValue({}),
  },
}));

// Mock the useEditor hook
const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>;

describe("RichTextEditor", () => {
  const mockEditor = {
    getHTML: jest.fn().mockReturnValue("<p>Test content</p>"),
    commands: {
      setContent: jest.fn(),
    },
    chain: jest.fn().mockReturnThis(),
    focus: jest.fn().mockReturnThis(),
    toggleBold: jest.fn().mockReturnThis(),
    toggleItalic: jest.fn().mockReturnThis(),
    toggleBulletList: jest.fn().mockReturnThis(),
    toggleOrderedList: jest.fn().mockReturnThis(),
    toggleBlockquote: jest.fn().mockReturnThis(),
    undo: jest.fn().mockReturnThis(),
    redo: jest.fn().mockReturnThis(),
    toggleHeading: jest.fn().mockReturnThis(),
    run: jest.fn(),
    can: jest.fn().mockReturnValue({
      chain: jest.fn().mockReturnValue({
        focus: jest.fn().mockReturnValue({
          toggleBold: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          toggleItalic: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          toggleBulletList: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          toggleOrderedList: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          toggleBlockquote: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          undo: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          redo: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
          toggleHeading: jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue(true),
          }),
        }),
      }),
    }),
    isActive: jest.fn().mockReturnValue(false),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn(),
  } as unknown as ReturnType<typeof useEditor>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(mockEditor);
  });

  describe("Rendering", () => {
    it("should render the editor with toolbar", () => {
      render(<RichTextEditor />);

      expect(screen.getByTestId("editor-content")).toBeInTheDocument();
      expect(screen.getByTitle("Bold (Ctrl+B)")).toBeInTheDocument();
      expect(screen.getByTitle("Italic (Ctrl+I)")).toBeInTheDocument();
    });
    it("should render toolbar buttons", () => {
      render(<RichTextEditor />);

      expect(screen.getByTitle("Bold (Ctrl+B)")).toBeInTheDocument();
      expect(screen.getByTitle("Italic (Ctrl+I)")).toBeInTheDocument();
      expect(screen.getByTitle("Bullet List")).toBeInTheDocument();
      expect(screen.getByTitle("Numbered List")).toBeInTheDocument();
      expect(screen.getByTitle("Blockquote")).toBeInTheDocument();
      expect(screen.getByTitle("Undo (Ctrl+Z)")).toBeInTheDocument();
      expect(screen.getByTitle("Redo (Ctrl+Y)")).toBeInTheDocument();
    });

    it("should render heading buttons", () => {
      render(<RichTextEditor />);

      expect(screen.getByTitle("Heading 1")).toBeInTheDocument();
      expect(screen.getByTitle("Heading 2")).toBeInTheDocument();
      expect(screen.getByTitle("Heading 3")).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(<RichTextEditor placeholder="Custom placeholder" />);

      expect(mockUseEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          extensions: expect.arrayContaining([
            expect.anything(), // StarterKit
          ]),
          content: "",
          onUpdate: expect.any(Function),
        })
      );
    });
    it("should render with custom CSS class", () => {
      render(<RichTextEditor className="custom-class" />);

      // The className is applied to the editor content, not the container
      // Since we're mocking the EditorContent, we should check that the useEditor was called with the right config
      expect(mockUseEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: expect.objectContaining({
            attributes: expect.objectContaining({
              class: expect.stringContaining("custom-class"),
            }),
          }),
        })
      );
    });
  });

  describe("Editor Interactions", () => {
    it("should call onChange when content changes", () => {
      const mockOnChange = jest.fn();
      render(<RichTextEditor onChange={mockOnChange} />);

      // Simulate editor update
      const onUpdateCall = mockUseEditor.mock.calls[0][0].onUpdate;
      onUpdateCall({ editor: mockEditor });

      expect(mockOnChange).toHaveBeenCalledWith("<p>Test content</p>");
    });

    it("should handle bold button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const boldButton = screen.getByTitle("Bold (Ctrl+B)");
      await user.click(boldButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it("should handle italic button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const italicButton = screen.getByTitle("Italic (Ctrl+I)");
      await user.click(italicButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it("should handle bullet list button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const bulletListButton = screen.getByTitle("Bullet List");
      await user.click(bulletListButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });
    it("should handle ordered list button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const orderedListButton = screen.getByTitle("Numbered List");
      await user.click(orderedListButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });
    it("should handle quote button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const quoteButton = screen.getByTitle("Blockquote");
      await user.click(quoteButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });
    it("should handle undo button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const undoButton = screen.getByTitle("Undo (Ctrl+Z)");
      await user.click(undoButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it("should handle redo button click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const redoButton = screen.getByTitle("Redo (Ctrl+Y)");
      await user.click(redoButton);

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it("should handle heading button clicks", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor />);

      const h1Button = screen.getByTitle("Heading 1");
      const h2Button = screen.getByTitle("Heading 2");
      const h3Button = screen.getByTitle("Heading 3");

      await user.click(h1Button);
      expect(mockEditor.chain).toHaveBeenCalled();

      await user.click(h2Button);
      expect(mockEditor.chain).toHaveBeenCalled();

      await user.click(h3Button);
      expect(mockEditor.chain).toHaveBeenCalled();
    });
  });

  describe("Button States", () => {
    it("should show active state for bold button when text is bold", () => {
      mockEditor.isActive.mockImplementation((format) => format === "bold");
      render(<RichTextEditor />);

      const boldButton = screen.getByTitle("Bold (Ctrl+B)");
      expect(boldButton).toHaveClass("bg-muted");
    });

    it("should show active state for italic button when text is italic", () => {
      mockEditor.isActive.mockImplementation((format) => format === "italic");
      render(<RichTextEditor />);

      const italicButton = screen.getByTitle("Italic (Ctrl+I)");
      expect(italicButton).toHaveClass("bg-muted");
    });
    it("should show active state for list buttons when lists are active", () => {
      mockEditor.isActive.mockImplementation(
        (format) => format === "bulletList" || format === "orderedList"
      );
      render(<RichTextEditor />);

      const bulletListButton = screen.getByTitle("Bullet List");
      const orderedListButton = screen.getByTitle("Numbered List");

      expect(bulletListButton).toHaveClass("bg-muted");
      expect(orderedListButton).toHaveClass("bg-muted");
    });

    it("should show active state for heading buttons when headings are active", () => {
      mockEditor.isActive.mockImplementation(
        (format, attrs) => format === "heading" && attrs?.level === 1
      );
      render(<RichTextEditor />);

      const h1Button = screen.getByTitle("Heading 1");
      expect(h1Button).toHaveClass("bg-muted");
    });
    it("should disable buttons when editor commands are not available", () => {
      mockEditor.can.mockReturnValue({
        chain: jest.fn().mockReturnValue({
          focus: jest.fn().mockReturnValue({
            toggleBold: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(false),
            }),
            toggleItalic: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(false),
            }),
            toggleBulletList: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(true),
            }),
            toggleOrderedList: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(true),
            }),
            toggleBlockquote: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(true),
            }),
            undo: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(true),
            }),
            redo: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(true),
            }),
            toggleHeading: jest.fn().mockReturnValue({
              run: jest.fn().mockReturnValue(true),
            }),
          }),
        }),
      });

      render(<RichTextEditor />);

      const boldButton = screen.getByTitle("Bold (Ctrl+B)");
      expect(boldButton).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null editor gracefully", () => {
      mockUseEditor.mockReturnValue(null);
      const { container } = render(<RichTextEditor />);

      // When editor is null, component returns null, so container should be empty
      expect(container.firstChild).toBeNull();
    });

    it("should not crash when onChange is not provided", () => {
      expect(() => {
        render(<RichTextEditor />);
      }).not.toThrow();
    });

    it("should handle empty content prop", () => {
      render(<RichTextEditor content="" />);

      expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible toolbar buttons", () => {
      render(<RichTextEditor />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("title");
      });
    });
    it("should support keyboard navigation", async () => {
      // Reset the mock to ensure buttons are enabled
      mockEditor.can.mockReturnValue({
        chain: jest.fn().mockReturnValue({
          focus: jest.fn().mockReturnValue({
            toggleBold: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            toggleItalic: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            toggleBulletList: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            toggleOrderedList: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            toggleBlockquote: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            undo: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            redo: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
            toggleHeading: jest
              .fn()
              .mockReturnValue({ run: jest.fn().mockReturnValue(true) }),
          }),
        }),
      });

      const user = userEvent.setup();
      render(<RichTextEditor />);

      const firstButton = screen.getByTitle("Bold (Ctrl+B)");
      const secondButton = screen.getByTitle("Italic (Ctrl+I)");

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();
    });
  });
});
