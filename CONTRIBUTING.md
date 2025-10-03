# Contributing to Red Hat Telemetry Collection API

Thank you for your interest in contributing to the Red Hat Telemetry Collection API! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Building the Project](#building-the-project)
- [Testing](#testing)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Certificate of Origin](#certificate-of-origin)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**

### Cloning the Repository

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/vscode-redhat-telemetry.git
cd vscode-redhat-telemetry
```

3. Add the upstream repository as a remote:

```bash
git remote add upstream https://github.com/redhat-developer/vscode-redhat-telemetry.git
```

## Development Setup

### Installing Dependencies

Install all project dependencies:

```bash
npm install
```

This will install:
- TypeScript and build tools
- Testing frameworks (Mocha, Chai)
- Linting tools (ESLint)
- Commit linting tools (commitlint, husky)
- Webpack for bundling

### Project Structure

The project is organized as follows:

```
src/
├── common/           # Shared code for all platforms
│   ├── api/         # Core telemetry API
│   ├── impl/        # Implementation details
│   ├── utils/       # Utility functions
│   └── vscode/      # VS Code specific utilities
├── node/            # Node.js specific implementations
├── webworker/       # Web worker specific implementations
└── tests/           # Test files
```

## Building the Project

### Development Build

To build the project for development:

```bash
npm run build
```

This command will:
1. Clean the `lib/` directory
2. Copy configuration files
3. Compile TypeScript to JavaScript

### Production Build

For a production build with webpack bundling:

```bash
npm run package
```

### Available Scripts

- `npm run clean` - Remove the `lib/` directory
- `npm run copy-files` - Copy configuration files to lib
- `npm run compile` - Compile TypeScript files
- `npm run build` - Full build process (clean + copy + compile)
- `npm run package` - Build and bundle with webpack
- `npm run prepublish` - Build for publishing

## Testing

### Running Tests

Run the test suite:

```bash
npm test
```

### Running Tests with Coverage

Generate test coverage reports:

```bash
npm run coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Test Structure

Tests are located in `src/tests/` and follow the naming pattern `*.test.ts`. The project uses:
- **Mocha** as the test framework
- **Chai** for assertions
- **ts-node** for TypeScript support

## Commit Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must follow this format:

```
<type>: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

```bash
feat: add support for custom telemetry endpoints
fix(api): resolve memory leak in event queue
docs: update contributing guidelines
test: add unit tests for telemetry service
chore: update dependencies to latest versions
```

### Commit Message Validation

The project uses [commitlint](https://commitlint.js.org/) to validate commit messages. This is enforced via a Git hook that runs automatically when you commit.

If your commit message doesn't follow the conventional format, the commit will be rejected with an error message explaining what needs to be fixed.

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write your code following the existing patterns
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template with a clear description

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Tests**: Ensure all tests pass
- **Documentation**: Update relevant documentation
- **Breaking Changes**: Clearly mark any breaking changes

## Certificate of Origin

By contributing to this project you agree to the Developer Certificate of
Origin (DCO). This document was created by the Linux Kernel community and is a
simple statement that you, as a contributor, have the legal right to make the
contribution. See the [DCO](DCO) file for details.

### Signing Your Commits

Each commit must be signed off to indicate your agreement with the DCO. You can do this by adding the `-s` flag when committing:

```bash
git commit -s -m "feat: add new telemetry feature"
```

Or by adding the sign-off line manually:

```
feat: add new telemetry feature

Signed-off-by: Your Name <your.email@example.com>
```

## Development Tips

### VS Code Setup

For the best development experience, we recommend:

1. Install the recommended VS Code extensions
2. Use the provided TypeScript configuration
3. Enable format on save

### Debugging

To debug telemetry during development, set the environment variable:

```bash
export VSCODE_REDHAT_TELEMETRY_DEBUG=true
```

This will log telemetry events to the console instead of sending them to Red Hat servers.

### Code Style

The project uses ESLint for code formatting and style enforcement. Run the linter:

```bash
npx eslint src/
```

## Getting Help

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Documentation**: Check the README.md for usage examples

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 license.
