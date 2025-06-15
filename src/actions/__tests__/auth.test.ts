// Mock next-auth module before importing
jest.mock("next-auth", () => ({
  AuthError: class MockAuthError extends Error {
    public type: string;

    constructor(type: string) {
      super(type);
      this.name = "AuthError";
      this.type = type;
    }
  },
}));

// Mock dependencies
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { authenticate, register, signInWithGoogle } from "../auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthError } from "next-auth";

jest.mock("@/lib/auth", () => ({
  signIn: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    const error = new Error("NEXT_REDIRECT");
    error.name = "NEXT_REDIRECT";
    throw error;
  }),
}));

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Helper function to create FormData
const createMockFormData = (data: Record<string, string | undefined>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
};

describe("Auth Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("authenticate", () => {
    it("should validate and authenticate user with valid credentials", async () => {
      const formData = createMockFormData({
        email: "test@example.com",
        password: "password123",
      });

      (signIn as jest.Mock).mockResolvedValue(undefined);

      await expect(authenticate({}, formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirectTo: "/dashboard",
      });
    });

    it("should return validation errors for invalid email", async () => {
      const formData = createMockFormData({
        email: "invalid-email",
        password: "password123",
      });

      const result = await authenticate({}, formData);

      expect(result).toEqual({
        errors: {
          email: ["Invalid email address"],
        },
        message: "Invalid fields. Failed to login.",
      });
      expect(signIn).not.toHaveBeenCalled();
    });

    it("should return validation errors for short password", async () => {
      const formData = createMockFormData({
        email: "test@example.com",
        password: "123",
      });

      const result = await authenticate({}, formData);

      expect(result).toEqual({
        errors: {
          password: ["Password must be at least 6 characters"],
        },
        message: "Invalid fields. Failed to login.",
      });
      expect(signIn).not.toHaveBeenCalled();
    });

    it("should handle CredentialsSignin error", async () => {
      const formData = createMockFormData({
        email: "test@example.com",
        password: "wrongpassword",
      });
      const authError = new AuthError("CredentialsSignin");
      authError.type = "CredentialsSignin";
      (signIn as jest.Mock).mockRejectedValue(authError);

      const result = await authenticate({}, formData);

      expect(result).toEqual({
        errors: { _form: ["Invalid credentials."] },
        message: "Invalid credentials.",
      });
    });

    it("should handle other AuthError types", async () => {
      const formData = createMockFormData({
        email: "test@example.com",
        password: "password123",
      });
      const authError = new AuthError("AccessDenied");
      authError.type = "AccessDenied";
      (signIn as jest.Mock).mockRejectedValue(authError);

      const result = await authenticate({}, formData);

      expect(result).toEqual({
        errors: { _form: ["Something went wrong."] },
        message: "Something went wrong.",
      });
    });

    it("should re-throw non-AuthError exceptions", async () => {
      const formData = createMockFormData({
        email: "test@example.com",
        password: "password123",
      });

      const error = new Error("Network error");
      (signIn as jest.Mock).mockRejectedValue(error);

      await expect(authenticate({}, formData)).rejects.toThrow("Network error");
    });
  });

  describe("register", () => {
    it("should register user with valid data", async () => {
      const formData = createMockFormData({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "STUDENT",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (db.user.create as jest.Mock).mockResolvedValue({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
      });

      const result = await register({}, formData);

      expect(result).toEqual({
        message: "Account created successfully! Please login.",
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          password: "hashedPassword",
          role: "STUDENT",
        },
      });
    });

    it("should return validation errors for invalid name", async () => {
      const formData = createMockFormData({
        name: "A",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "STUDENT",
      });

      const result = await register({}, formData);

      expect(result).toEqual({
        errors: {
          name: ["Name must be at least 2 characters"],
        },
        message: "Invalid fields. Failed to register.",
      });
      expect(db.user.findUnique).not.toHaveBeenCalled();
    });

    it("should return validation errors for invalid email", async () => {
      const formData = createMockFormData({
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
        role: "STUDENT",
      });

      const result = await register({}, formData);

      expect(result).toEqual({
        errors: {
          email: ["Invalid email address"],
        },
        message: "Invalid fields. Failed to register.",
      });
    });

    it("should return validation errors for mismatched passwords", async () => {
      const formData = createMockFormData({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
        role: "STUDENT",
      });

      const result = await register({}, formData);

      expect(result).toEqual({
        errors: {
          confirmPassword: ["Passwords don't match"],
        },
        message: "Invalid fields. Failed to register.",
      });
    });

    it("should return error if user already exists", async () => {
      const formData = createMockFormData({
        name: "John Doe",
        email: "existing@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "STUDENT",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        email: "existing@example.com",
      });

      const result = await register({}, formData);

      expect(result).toEqual({
        errors: { email: ["User with this email already exists."] },
        message: "User with this email already exists.",
      });

      expect(db.user.create).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const formData = createMockFormData({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "STUDENT",
      });

      (db.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await register({}, formData);

      expect(result).toEqual({
        errors: { _form: ["Something went wrong."] },
        message: "Something went wrong.",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Registration error:",
        expect.any(Error)
      );
    });
    it("should handle missing role field with validation error", async () => {
      // Create FormData without a role field
      const formData = new FormData();
      formData.append("name", "John Doe");
      formData.append("email", "john@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");
      // Explicitly not adding role field

      const result = await register({}, formData);

      // The function should return validation error for missing role
      expect(result).toEqual({
        errors: {
          role: ["Expected 'STUDENT' | 'INSTRUCTOR', received null"],
        },
        message: "Invalid fields. Failed to register.",
      });
    });

    it("should register user with explicit STUDENT role", async () => {
      const formData = createMockFormData({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "STUDENT",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (db.user.create as jest.Mock).mockResolvedValue({});

      const result = await register({}, formData);

      expect(result).toEqual({
        message: "Account created successfully! Please login.",
      });

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          password: "hashedPassword",
          role: "STUDENT",
        },
      });
    });
  });

  describe("signInWithGoogle", () => {
    it("should call signIn with google provider", async () => {
      (signIn as jest.Mock).mockResolvedValue(undefined);

      await signInWithGoogle();

      expect(signIn).toHaveBeenCalledWith("google", {
        redirectTo: "/dashboard",
      });
    });

    it("should handle signIn errors", async () => {
      const error = new Error("OAuth error");
      (signIn as jest.Mock).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow("OAuth error");
    });
  });
});
