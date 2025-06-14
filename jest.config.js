const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // If using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ["node_modules", "<rootDir>/"],

  testEnvironment: "jest-environment-jsdom",

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**", // Exclude Next.js app directory
    "!src/lib/db.ts", // Exclude database connection
    "!src/lib/auth.ts", // Exclude auth config
    "!src/lib/minio.ts", // Exclude external services
    "!src/lib/redis.ts", // Exclude external services
  ], // Handle module aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Transform certain modules that are ES modules
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth/core|@auth/core/providers)/)",
  ],

  // Ignore .next directory
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
