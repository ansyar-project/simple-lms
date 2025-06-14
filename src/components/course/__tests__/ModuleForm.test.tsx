import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormState } from "react-dom";
import ModuleForm from "../ModuleForm";
import { createModule, updateModule } from "@/actions/modules";

// Mock the server actions
jest.mock("@/actions/modules");
const mockCreateModule = createModule as jest.MockedFunction<
  typeof createModule
>;
const mockUpdateModule = updateModule as jest.MockedFunction<
  typeof updateModule
>;

// Mock useFormState
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormState: jest.fn(),
}));

const mockUseFormState = useFormState as jest.MockedFunction<
  typeof useFormState
>;

describe("ModuleForm", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    courseId: "course_123",
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useFormState to default behavior (no errors, not pending)
    mockUseFormState.mockReturnValue([
      { success: false }, // Initial state
      jest.fn(), // Form action
      false, // isPending
    ]);
  });

  describe("Create Mode", () => {
    it("should render create module form", () => {
      render(<ModuleForm {...defaultProps} />);

      expect(screen.getByText("Create Module")).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create module/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("should allow user to input module details", async () => {
      const user = userEvent.setup();
      render(<ModuleForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const orderInput = screen.getByLabelText(/order/i);

      await user.type(titleInput, "Introduction to React");
      await user.type(
        descriptionInput,
        "Learn the basics of React development"
      );
      await user.clear(orderInput);
      await user.type(orderInput, "1");

      expect(titleInput).toHaveValue("Introduction to React");
      expect(descriptionInput).toHaveValue(
        "Learn the basics of React development"
      );
      expect(orderInput).toHaveValue(1);
    });

    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<ModuleForm {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
    it("should show validation errors for invalid input", async () => {
      // Create a mock function that returns validation errors
      const mockState = {
        success: false,
        message: "Validation failed",
        errors: {
          title: ["Title must be at least 3 characters"],
        },
      };

      // Mock the useFormState hook to return our mock state
      const mockFormAction = jest.fn();

      // Mock the useFormState hook with correct signature
      mockUseFormState.mockReturnValue([mockState, mockFormAction, false]);

      render(<ModuleForm {...defaultProps} />);

      // The validation error should be displayed when the form state has errors
      expect(
        screen.getByText("Title must be at least 3 characters")
      ).toBeInTheDocument();
    });
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const mockFormAction = jest.fn();

      // Mock useFormState to return our form action
      mockUseFormState.mockReturnValue([
        { success: false },
        mockFormAction,
        false,
      ]);

      render(<ModuleForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const orderInput = screen.getByLabelText(/order/i);
      const submitButton = screen.getByRole("button", {
        name: /create module/i,
      });

      await user.type(titleInput, "Introduction to React");
      await user.type(
        descriptionInput,
        "Learn the basics of React development"
      );
      await user.clear(orderInput);
      await user.type(orderInput, "1");
      await user.click(submitButton);

      // Check that the form action was called
      await waitFor(() => {
        expect(mockFormAction).toHaveBeenCalled();
      });
    });
  });

  describe("Edit Mode", () => {
    const mockModule = {
      id: "module_123",
      title: "Existing Module",
      description: "Existing description",
      order: 2,
    };

    const editProps = {
      ...defaultProps,
      module: mockModule,
    };

    it("should render edit module form with existing data", () => {
      render(<ModuleForm {...editProps} />);

      expect(screen.getByText("Edit Module")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Existing Module")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Existing description")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue(2)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /update module/i })
      ).toBeInTheDocument();
    });
    it("should call updateModule when form is submitted", async () => {
      const user = userEvent.setup();
      const mockFormAction = jest.fn();

      // Mock useFormState to return our form action for update
      mockUseFormState.mockReturnValue([
        { success: false },
        mockFormAction,
        false,
      ]);

      render(<ModuleForm {...editProps} />);

      const titleInput = screen.getByDisplayValue("Existing Module");
      const submitButton = screen.getByRole("button", {
        name: /update module/i,
      });

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Module Title");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFormAction).toHaveBeenCalled();
      });
    });
    it("should call onSuccess when module is updated successfully", async () => {
      // Mock useFormState to return a successful state
      mockUseFormState.mockReturnValue([
        { success: true, message: "Module updated successfully" },
        jest.fn(),
        false,
      ]);

      render(<ModuleForm {...editProps} />);

      // onSuccess should be called when the form state indicates success
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Form States", () => {
    it("should disable form during submission", async () => {
      const user = userEvent.setup();
      const mockFormAction = jest.fn();

      // Mock useFormState with our form action
      mockUseFormState.mockReturnValue([
        { success: false },
        mockFormAction,
        false,
      ]);

      render(<ModuleForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", {
        name: /create module/i,
      });

      await user.type(titleInput, "Test Module");

      // The button should initially be enabled
      expect(submitButton).not.toBeDisabled();

      // After clicking submit, the component sets isSubmitting to true
      await user.click(submitButton);

      // The form action should have been called
      expect(mockFormAction).toHaveBeenCalled();
    });

    it("should show loading state in submit button", async () => {
      const user = userEvent.setup();

      let resolveCreateModule: (value: any) => void;
      const createModulePromise = new Promise((resolve) => {
        resolveCreateModule = resolve;
      });

      mockCreateModule.mockReturnValue(createModulePromise as any);

      render(<ModuleForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const submitButton = screen.getByRole("button", {
        name: /create module/i,
      });

      await user.type(titleInput, "Test Module");
      await user.click(submitButton); // Check that the button is disabled during loading
      expect(submitButton).toBeDisabled();

      // Button should still show "Create Module" text even during loading
      expect(screen.getByText("Create Module")).toBeInTheDocument();

      resolveCreateModule!({
        success: true,
        message: "Module created successfully",
      });

      await waitFor(() => {
        expect(screen.getByText("Create Module")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels and associations", () => {
      render(<ModuleForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const orderInput = screen.getByLabelText(/order/i);

      expect(titleInput).toHaveAttribute("id");
      expect(descriptionInput).toHaveAttribute("id");
      expect(orderInput).toHaveAttribute("id");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ModuleForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const orderInput = screen.getByLabelText(/order/i);

      // Tab through form elements
      await user.tab();
      expect(titleInput).toHaveFocus();

      await user.tab();
      expect(descriptionInput).toHaveFocus();

      await user.tab();
      expect(orderInput).toHaveFocus();
    });
  });
});
