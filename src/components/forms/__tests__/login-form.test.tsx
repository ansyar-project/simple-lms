import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useActionState } from "react";
import LoginForm from "../login-form";

// Mock React hooks and DOM functions
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
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

// Mock Next.js components
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
  authenticate: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

describe("LoginForm", () => {
  const mockAuthenticate = jest.fn();
  const mockUseActionState = useActionState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([
      { errors: {}, message: "" }, // state
      mockAuthenticate, // action
      false, // isPending
    ]);
  });

  it("should render login form with all fields", () => {
    render(<LoginForm />);

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("should display validation errors", () => {
    mockUseActionState.mockReturnValue([
      {
        errors: {
          email: ["Invalid email address"],
          password: ["Password must be at least 6 characters"],
          _form: ["Invalid credentials"],
        },
        message: "Failed to login",
      },
      mockAuthenticate,
      false,
    ]);

    render(<LoginForm />);

    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters")
    ).toBeInTheDocument();
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should show loading state when form is submitting", () => {
    mockUseActionState.mockReturnValue([
      { errors: {}, message: "" },
      mockAuthenticate,
      true, // isPending
    ]);

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /signing in/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("should submit form with correct data", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalled();
    });
  });

  it("should handle form submission with empty fields", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalled();
    });
  });

  it("should have proper form structure and accessibility", () => {
    render(<LoginForm />);

    // Check form structure
    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();

    // Check input labels
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("name", "password");

    // Check required attributes
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("should display success message when provided", () => {
    mockUseActionState.mockReturnValue([
      {
        errors: {},
        message: "Login successful",
      },
      mockAuthenticate,
      false,
    ]);

    render(<LoginForm />);

    expect(screen.getByText("Login successful")).toBeInTheDocument();
  });
});
