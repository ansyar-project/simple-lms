# Copilot Instructions
*Instructions for generating consistent, high-quality code that follows project standards and best practices.*

## General Guidelines
- **Always use context7** to get latest documentation of dependencies.
- **Always store file relations** in memory to maintain consistency across tasks.

## Core Workflow Principles
- **Always provide a plan before writing code**, especially for complex features or components
- **Always ask for clarification** if requirements are unclear or ambiguous
- **Always start coding only after the plan is approved**
- **Limit code changes to the minimum necessary** to achieve the task - avoid unnecessary refactoring
- **Check for existing components, utilities, tests, and documentation** before creating new ones to avoid duplication
- **Consider project context** - ask about current project structure and existing patterns before suggesting new approaches
- **When modifying existing code**, maintain consistency with current codebase style and patterns

## Code Quality Standards

### Language & Framework Requirements
- **Always use TypeScript** for type safety and better developer experience
- **Always use the latest version of Next.js and React**
- **Always use server-side rendering (SSR)** for better SEO and performance
- **Always use server actions** for data fetching
- **Follow the DRY principle** to avoid code duplication

### Coding Style
- Use camelCase for variable and function names
- Use PascalCase for component names
- Use single quotes for strings
- Use 2 spaces for indentation
- Use arrow functions for callbacks
- Use async/await for asynchronous code
- Use const for constants and let for variables that will be reassigned
- Use destructuring for objects and arrays
- Use template literals for strings containing variables
- Use the latest JavaScript features (ES6+) where possible

### Code Structure
```
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── types/         # TypeScript types and interfaces
├── tests/         # Unit and integration tests
├── public/        # Static assets (images, fonts)
├── config/        # Configuration files
├── middleware/    # Next.js middleware functions
├── lib/          # Third-party libraries and utilities
├── context/      # React context providers
└── styles/       # CSS or styled components
```

## Security & Performance

### Security Requirements
- **Validate all user inputs** on both client and server side
- **Rate limit all API calls** to prevent abuse and ensure fair usage
- **Enable captcha for register and login forms** to prevent spam and abuse
- **Use environment variables** for sensitive configuration
- **Implement proper authentication and authorization checks**
- **Follow OWASP security best practices**

### Performance Optimization
- **Consider bundle size impact** when adding new dependencies
- **Optimize images and assets** for web performance
- **Use React.memo and useMemo appropriately** to prevent unnecessary re-renders
- **Implement proper loading states and error boundaries**
- **Consider long-term maintainability** over quick solutions

### Error Handling
- **Always implement proper error handling** with try-catch blocks
- **Use type-safe error handling patterns**
- **Provide meaningful error messages** for debugging
- **Log errors appropriately** for monitoring and troubleshooting

## Accessibility & User Experience
- **Ensure all interactive elements are keyboard accessible**
- **Use semantic HTML elements appropriately**
- **Include proper ARIA labels and descriptions**
- **Test with screen readers and accessibility tools**
- **Prioritize user experience and performance** in all decisions

## Testing & Quality Assurance
- **Always write tests for new features and components**
- **Write unit tests for all components and utilities** using Jest and React Testing Library
- **Use Cypress for end-to-end testing**
- **Use Playwright for cross-browser testing**
- **Ensure code passes `pnpm lint` and `pnpm test`** before completion
- **Always use pnpm for package management** to ensure consistency

## Documentation & Communication
- **Use JSDoc comments** for functions and classes
- **Use Markdown** for README files and documentation
- **Use TypeScript interfaces** for type definitions
- **Use Storybook** for component documentation and testing
- **Update system design document** for significant architectural changes
- **Update milestones document** when achieving new milestones or completing significant features

### Decision-Making Guidelines
- **When multiple approaches are possible**, explain trade-offs and recommend the best option
- **Consider the project's scale and complexity** when making architectural decisions
- **Provide clear reasoning** for technical decisions and recommendations

## Debugging & Troubleshooting
- **Provide clear debugging steps** when code issues arise
- **Include relevant console.log statements** for complex logic during development
- **Suggest appropriate debugging tools and techniques**
- **When encountering errors**, provide step-by-step resolution guidance

## Tools & Dependencies
- **Package Management**: pnpm
- **Linting & Formatting**: ESLint and Prettier
- **Testing**: Jest, React Testing Library, Cypress, Playwright
- **Documentation**: Storybook, JSDoc, Markdown
- **Type Safety**: TypeScript with strict configuration

## Final Checklist
Before considering any task complete, ensure:
- [ ] Code follows all style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Security considerations are addressed
- [ ] Performance implications are considered
- [ ] Accessibility requirements are met
- [ ] Error handling is implemented
- [ ] Code passes linting and testing