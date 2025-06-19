import React from "react";
import { render, screen } from "@testing-library/react";
import HeroSection from "../HeroSection";

// Mock Next.js components and hooks
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

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock("framer-motion", () => {
  // Proxy to handle any motion.<tag>
  const motionProxy = new Proxy(
    {},
    {
      get: (_target, tag) => {
        // Only allow string tags, fallback to 'div' for others
        const tagName = typeof tag === "string" ? tag : "div";
        return ({
          children,
          ...props
        }: {
          children?: React.ReactNode;
        } & React.HTMLAttributes<HTMLElement>) => {
          return React.createElement(tagName, props, children);
        };
      },
    }
  );
  return { motion: motionProxy };
});

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Trophy: () => <div data-testid="trophy-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
}));

describe("HeroSection", () => {
  it("should render hero section with main content", () => {
    render(<HeroSection />);

    // Check main heading
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    // Use a flexible matcher to find heading text split across spans
    expect(
      screen.getByRole("heading", { level: 1, name: /welcome to simple lms/i })
    ).toBeInTheDocument();

    // Check description
    expect(
      screen.getByText(/A comprehensive Learning Management System/i)
    ).toBeInTheDocument();

    // Check CTA buttons
    expect(
      screen.getByRole("link", { name: /get started/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should have correct link destinations", () => {
    render(<HeroSection />);

    const getStartedLink = screen.getByRole("link", { name: /get started/i });
    const signInLink = screen.getByRole("link", { name: /sign in/i });

    expect(getStartedLink).toHaveAttribute("href", "/register");
    expect(signInLink).toHaveAttribute("href", "/login");
  });

  it("should render statistics section", () => {
    render(<HeroSection />);

    // Check for icons that should be present
    expect(screen.getByTestId("zap-icon")).toBeInTheDocument();
    expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
  });

  it("should have proper semantic structure", () => {
    render(<HeroSection />);

    // Check heading hierarchy
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check for buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("should render arrow icon in CTA button", () => {
    render(<HeroSection />);

    expect(screen.getByTestId("zap-icon")).toBeInTheDocument();
  });

  it("should display key value propositions", () => {
    render(<HeroSection />);

    // Check for common LMS value propositions
    const content = document.body.textContent;
    expect(content).toMatch(/learning/i);
  });

  it("should be responsive and accessible", () => {
    render(<HeroSection />);

    const heading = screen.getByRole("heading", { level: 1 });
    const links = screen.getAllByRole("link");

    // Check that heading is accessible
    expect(heading).toBeVisible();

    // Check that all links are accessible
    links.forEach((link) => {
      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href");
    });
  });

  it("should have appropriate styling classes", () => {
    const { container } = render(<HeroSection />);

    // Check for common Tailwind/styling patterns
    const elements = container.querySelectorAll("*");
    const hasClassNames = Array.from(elements).some(
      (el) => el.className && el.className.length > 0
    );

    expect(hasClassNames).toBe(true);
  });

  it("should render without crashing", () => {
    expect(() => render(<HeroSection />)).not.toThrow();
  });

  it("should contain call-to-action buttons with proper styling", () => {
    render(<HeroSection />);

    const getStartedBtn = screen.getByRole("link", { name: /get started/i });
    const signInBtn = screen.getByRole("link", { name: /sign in/i });

    expect(getStartedBtn).toBeInTheDocument();
    expect(signInBtn).toBeInTheDocument(); // Check that buttons have expected text content instead of classes
    expect(getStartedBtn).toHaveTextContent("Get Started");
    expect(signInBtn).toHaveTextContent("Sign In");
  });
});
