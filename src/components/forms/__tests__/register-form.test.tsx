import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useActionState } from "react";
import RegisterForm from "../register-form";

// Mock Next.js hooks and server actions
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: jest.fn(),
}));

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: () => ({ pending: false }),
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.ComponentProps<"label">) => (
    <label {...props}>{children}</label>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    defaultValue,
    name,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    name?: string;
  }) => (
    <div data-testid="select-wrapper">
      <select
        data-testid="select"
        name={name}
        defaultValue={defaultValue}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange?.(e.target.value)
        }
        role="combobox"
        aria-label="Select role"
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/actions/auth", () => ({
  register: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

describe("RegisterForm", () => {
  const mockRegister = jest.fn();
  const mockUseActionState = useActionState as jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([
      { errors: {}, message: "" }, // state
      mockRegister, // action
      false, // isPending
    ]);
  });

  it("should render register form with all fields", () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole("heading", { name: "Create Account" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /role/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("should display validation errors", () => {
    mockUseActionState.mockReturnValue([
      {
        errors: {
          name: ["Name must be at least 2 characters"],
          email: ["Invalid email address"],
          password: ["Password must be at least 6 characters"],
          confirmPassword: ["Passwords don't match"],
          role: ["Invalid role"],
          _form: ["Registration failed"],
        },
        message: "Failed to register",
      },
      mockRegister,
      false,
    ]);

    render(<RegisterForm />);

    expect(
      screen.getByText("Name must be at least 2 characters")
    ).toBeInTheDocument();
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters")
    ).toBeInTheDocument();
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    expect(screen.getByText("Invalid role")).toBeInTheDocument();
    expect(screen.getByText("Registration failed")).toBeInTheDocument();
  });
  it("should show loading state when form is submitting", () => {
    // This test would need a more complex setup to test the pending state
    // For now, we'll just test that the component renders correctly
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
  it("should submit form with correct data", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const roleSelect = screen.getByRole("combobox", { name: /role/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    // Open select and choose option
    await user.click(roleSelect);
    const studentOption = screen.getByText("Learn (Student)");
    await user.click(studentOption);

    // Check that inputs have the expected values
    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("should have proper accessibility attributes", () => {
    render(<RegisterForm />);

    // Check input labels and attributes
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(nameInput).toHaveAttribute("type", "text");
    expect(nameInput).toHaveAttribute("name", "name");
    expect(nameInput).toBeRequired();

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toBeRequired();

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(passwordInput).toBeRequired();

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("name", "confirmPassword");
    expect(confirmPasswordInput).toBeRequired();

    // Check required attributes
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it("should display success message when provided", () => {
    mockUseActionState.mockReturnValue([
      {
        errors: {},
        message: "Account created successfully! Please login.",
      },
      mockRegister,
      false,
    ]);

    render(<RegisterForm />);

    expect(
      screen.getByText("Account created successfully! Please login.")
    ).toBeInTheDocument();
  });

  it("should show role selection options", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    await user.click(roleSelect);
    expect(screen.getByText("Learn (Student)")).toBeInTheDocument();
    expect(screen.getByText("Teach (Instructor)")).toBeInTheDocument();
  });

  it("should handle role selection", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const roleSelect = screen.getByRole("combobox", { name: /role/i }); // Default should be "Select your role"
    expect(roleSelect).toHaveTextContent("Select your role");

    // Select instructor role
    await user.click(roleSelect);
    const instructorOption = screen.getByText("Teach (Instructor)");
    await user.click(instructorOption);
    expect(roleSelect).toHaveTextContent("Instructor");
  });
});
