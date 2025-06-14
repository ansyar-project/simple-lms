# Copilot Instructions
# This file contains instructions for Copilot to follow when generating code.
# It is important to follow these instructions to ensure consistency and quality in the codebase.

# General Guidelines
- Follow the project's coding standards and best practices.
- Write clean, readable, and maintainable code.
- Use meaningful variable and function names.
- Write comments to explain complex logic or important decisions.
- Always ensure that the code is well-documented, easy to read, and maintainable. Follow best practices for code organization and structure to facilitate collaboration and future development.
- Follow the DRY (Don't Repeat Yourself) principle to avoid code duplication.
- Always ask for clarification if the requirements are not clear.
- Always provide plan before writing code, especially for complex features or components.
- Always write tests for new features and components.
- Always use TypeScript for type safety and better developer experience.
- Always use server-side rendering (SSR) for better SEO and performance.
- Always use server actions for data fetching.
- Always use the latest version of Next.js and React.
- Always update the system design document for any significant changes to the architecture or design of the application.
- Always update the milestones document for when achieving a new milestone or completing a significant feature.
- Always update the system design document for when refactoring or improving the codebase.
- Limit code changing to the minimum necessary to achieve the task at hand. Avoid unnecessary refactoring or changes that do not directly contribute to the feature being implemented.
- Rate limit all API calls to prevent abuse and ensure fair usage.
- Enable captcha for register and login forms to prevent spam and abuse.
- Always make sure the code pass pnpm lint and pnpm test after writing new code or making changes.
- Always use pnpm for package management to ensure consistency across development environments.
- Always check for existing components or utilities before creating new ones to avoid duplication.
- Always check for existing tests before writing new ones to avoid duplication.
- Always check for existing documentation before writing new ones to avoid duplication.
- Always check for database schema changes before writing new features that depend on the database.
- Always start coding after the plan is approved.
- Always write tests for new features and components.


## Coding Standards

- Use camelCase for variable and function names.
- Use PascalCase for component names.
- Use single quotes for strings.
- Use 2 spaces for indentation.
- Use arrow functions for callbacks.
- Use async/await for asynchronous code.
- Use const for constants and let for variables that will be reassigned.
- Use destructuring for objects and arrays.
- Use template literals for strings that contain variables.
- Use the latest JavaScript features (ES6+) where possible.
- Use pnpm for package management.
- Use ESLint for linting and Prettier for formatting.
- Use TypeScript for type safety.
- Use server-side rendering (SSR) for better SEO and performance.
- Use server actions for data fetching.
## Code Structure
- Use a modular structure with separate files for components, utilities, and styles.
- Use a `components` directory for reusable components.
- Use a `utils` directory for utility functions.
- Use a `styles` directory for CSS or styled components.
- Use a `hooks` directory for custom hooks.
- Use a `types` directory for TypeScript types and interfaces.
- Use a `tests` directory for unit and integration tests.
- Use a `public` directory for static assets like images and fonts.
- Use a `config` directory for configuration files.
- Use a `middleware` directory for Next.js middleware functions.
- Use a `lib` directory for third-party libraries and utilities.
- Use a `context` directory for React context providers.

## Documentation
- Use JSDoc comments for functions and classes.
- Use Markdown for README files and documentation.
- Use TypeScript interfaces for type definitions.
- Use Storybook for component documentation and testing.
- Use system_design for reference architecture and design decisions.

## Testing
- Write unit tests for all components and utilities.
- Use Jest for unit testing and React Testing Library for component testing.
- Use Cypress for end-to-end testing.
- Use Playwright for cross-browser testing.
