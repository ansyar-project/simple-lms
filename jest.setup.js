import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder in Node.js environment
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Request/Response/Headers/FormData (Next.js server actions)
// Use a simple polyfill instead of node-fetch to avoid import issues
global.Request =
  global.Request ||
  class Request {
    constructor(input, init) {
      this.url = input;
      this.method = init?.method || "GET";
      this.headers = new Map();
      this.body = init?.body;
    }

    clone() {
      return new Request(this.url, { method: this.method, body: this.body });
    }
  };

global.Response =
  global.Response ||
  class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map();
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
  };

global.Headers =
  global.Headers ||
  class Headers extends Map {
    get(key) {
      return super.get(key?.toLowerCase());
    }

    set(key, value) {
      return super.set(key?.toLowerCase(), value);
    }
  };

global.FormData =
  global.FormData ||
  class FormData {
    constructor() {
      this.data = new Map();
    }

    get(key) {
      return this.data.get(key);
    }

    set(key, value) {
      this.data.set(key, value);
    }

    append(key, value) {
      this.data.set(key, value);
    }
  };

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => "/"),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "INSTRUCTOR",
      },
    },
    status: "authenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next-auth/next for server-side auth
jest.mock("next-auth/next", () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next-auth main module
jest.mock("next-auth", () => ({
  default: jest.fn(),
}));

// Mock @auth/core modules
jest.mock("@auth/core", () => ({
  Auth: jest.fn(),
  customFetch: jest.fn(),
}));

jest.mock("@auth/core/providers/google", () => ({
  default: jest.fn(),
}));

// Mock auth lib files to prevent imports
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@/lib/auth.config", () => ({
  authConfig: {},
}));

jest.mock("@/lib/authorization", () => ({
  requireInstructor: jest.fn(),
  requireAuth: jest.fn(),
}));

// Mock server actions
jest.mock("@/actions/modules", () => ({
  createModule: jest.fn(),
  updateModule: jest.fn(),
  deleteModule: jest.fn(),
  reorderModules: jest.fn(),
}));

jest.mock("@/actions/lessons", () => ({
  createLesson: jest.fn(),
  updateLesson: jest.fn(),
  deleteLesson: jest.fn(),
  reorderLessons: jest.fn(),
}));

// Global test helpers
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.confirm for delete operations
Object.defineProperty(window, "confirm", {
  writable: true,
  value: jest.fn(() => true),
});
