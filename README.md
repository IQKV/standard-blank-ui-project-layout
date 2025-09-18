> ## 🤔 What is this template all about?
>
> - This template can be used as a base layer for a ReactJS UI projects.
> - Make the project easy to maintain with **7 issue templates**.
> - Quick-start documentation with an extraordinary README structure.
> - Manage issues with **20 issue labels**.
> - Make _community healthier_ with all the guides like code of conduct, contributing, support, security...
> - Learn more with the [official GitHub guide on creating repositories from a template](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template).
> - To start using it, click **[Use this template](https://github.com/dimdnk/standard-blank-ui-project-layout/generate)** to create your new repository.

---

# 🚀 React UI Blank Project Layout

<a name="description"></a>

## 📜 Description

React + TypeScript + Vite + TanStack Router Template

> A modern, feature-rich template for building scalable React applications with the latest tools and best practices.

<a name="keyfeatures"></a>

## 🔑 Key Features

### 🏗️ **Architecture & Design**

- 🎯 **Feature-Sliced Design (FSD)** - Scalable architecture with clear layer separation
- 🔒 **Public API Pattern** - Encapsulated modules with barrel file exports
- 📁 **Proper Layer Hierarchy** - App → Processes → Pages → Features → Entities → Shared

### ⚛️ **React & TypeScript**

- ✨ **React 19** - Experience the future with the latest React version
- 🎯 **TypeScript** - Type-safe development with latest features
- ⚡ **Vite** - Lightning-fast development with instant HMR
- 📦 **PNPM** - Fast, disk space efficient package manager

### 🔄 **Data & Routing**

- 🔄 **TanStack Router** - Type-safe routing with file-based routing
- 🔄 **TanStack Query** - Powerful data synchronization with proper FSD integration
- 📡 **Axios** - HTTP client with interceptors and error handling
- 📡 **GraphQL Request** - GraphQL support for modern APIs

### ✅ **Validation & Forms**

- ✅ **Zod Validation** - Runtime type validation with comprehensive schemas
- 📝 **React Hook Form** - Performant forms with validation integration
- 🔐 **Type-safe Forms** - End-to-end type safety from validation to submission

### 🧪 **Testing & Quality**

- 🧪 **Vitest** - Fast unit and integration testing
- 🧪 **Playwright** - Reliable end-to-end testing
- 🧪 **Mock Service Worker** - Client-agnostic API mocking
- 🧱 **Storybook** - Component development in isolation

### 🔍 **Code Quality**

- 🔍 **ESLint + Prettier** - Modern linting and code formatting
- 🎭 **React Icons** - Beautiful icon library
- 👷 **GitHub Actions** - Automated workflow and CI/CD
- 🔒️ **Dependabot** - Automated dependency updates and security monitoring

<a name="documentation"></a>

## 📚 Documentation

> [!TIP]
>
> #### Install Prerequisites:
>
> - [Node LTS version](https://nodejs.org/en/blog/release/v22.15.0/)
> - [pnpm](https://pnpm.io/installation)
> - [Git](https://git-scm.com/)
> - [Docker](https://www.docker.com/get-started/)
> - [Docker Compose](https://docs.docker.com/compose/)

### 🔺 Local development

```shell script
# Clone the repository
git clone https://github.com/dimdnk/standard-blank-ui-project-layout.git my-app

# Navigate to project directory
cd my-app

# Install dependencies
pnpm install

# Start local dev services in Docker using the command:
docker compose -f compose.yaml up -d

# Start development server
pnpm dev
```

### 📃 Available Scripts

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `pnpm dev`            | Start development server                   |
| `pnpm build`          | Build for production                       |
| `pnpm preview`        | Preview production build                   |
| `pnpm test`           | Run tests                                  |
| `pnpm prettier:write` | Run Prettier over the code                 |
| `pnpm lint`           | Lint code                                  |
| `pnpm type-check`     | Check types                                |
| `pnpm release`        | Automate versioning and package publishing |

## 🏗️ **Feature-Sliced Design Architecture**

This project follows **Feature-Sliced Design (FSD)** methodology for scalable frontend architecture.

### 📁 **Project Structure**

```
src/
├── app/                    # Application layer
│   ├── app.tsx            # App component with providers
│   ├── router.ts          # Router configuration
│   └── index.ts           # Public API
├── processes/              # Cross-entity business processes
│   ├── auth-session/      # Authentication session management
│   └── user-onboarding/   # User registration workflow
├── pages/                  # Pages layer (owns routing)
│   ├── __root.tsx         # Root route with layout
│   ├── index.tsx          # Home route
│   ├── about.tsx          # About route
│   ├── home/              # Home page components
│   └── about/             # About page components
├── features/              # Business features
│   ├── auth/              # Authentication feature
│   │   ├── model/         # Validation & business logic
│   │   ├── ui/            # Feature UI components
│   │   └── index.ts       # Public API
│   └── user-management/   # User management feature
├── entities/              # Business entities (pure data)
│   ├── user/              # User entity
│   │   ├── model/         # Types & pure queries
│   │   ├── api/           # API methods
│   │   ├── ui/            # Data display components
│   │   └── index.ts       # Public API
│   └── auth/              # Auth entity
└── shared/                # Reusable utilities
    ├── api/               # Base API configuration
    ├── lib/               # Utilities & helpers
    ├── types/             # Common types
    └── ui/                # Reusable UI components
```

### 🎯 **Layer Responsibilities**

| Layer         | Purpose                                            | Can Import From                       |
| ------------- | -------------------------------------------------- | ------------------------------------- |
| **App**       | Application initialization, global providers       | All layers                            |
| **Processes** | Cross-entity workflows, complex business processes | Features, Entities, Shared            |
| **Pages**     | Route components, page composition                 | Processes, Features, Entities, Shared |
| **Features**  | Business logic, validation, feature UI             | Entities, Shared                      |
| **Entities**  | Pure data access, basic UI components              | Shared only                           |
| **Shared**    | Reusable utilities, no business logic              | External libraries only               |

### 🔒 **Public API Pattern**

Every slice exposes its functionality through barrel files (`index.ts`):

```typescript
// ✅ Correct: Use public APIs
import { useLogin, LoginForm } from "@/features/auth";
import { User, UserCard } from "@/entities/user";

// ❌ Wrong: Bypass public API
import { LoginForm } from "@/features/auth/ui/login-form";
```

### 📚 **Architecture Documentation**

- 📚 [**Documentation Index**](docs/index.md) - Complete documentation guide
- 📖 [**FSD Architecture Guide**](docs/fsd-architecture.md) - Complete architecture overview
- 🔒 [**Public API Enforcement**](docs/public-api-enforcement.md) - API patterns and rules
- ✅ [**Validation Guide**](docs/validation-guide.md) - Zod validation patterns
- 🛠️ [**Development Guide**](docs/development-guide.md) - Step-by-step development patterns
- 📋 [**Final FSD Summary**](docs/final-fsd-summary.md) - Implementation summary

### Environment Variables

| Variable   | Description                | Default       |
| ---------- | -------------------------- | ------------- |
| `TZ`       | Defines timezone           | `UTC`         |
| `NODE_ENV` | Defines nodejs environment | `development` |

### Cursor Rules

Enforces React Query best practices for structure, patterns, performance, security, and testing.

Rules live in `.cursor/rules` to keep code clean and consistent.

---

<a name="changelog"></a>

## 📆 Changelog

Conventional changelog located [here](CHANGELOG.md).

<a name="acknowledgments"></a>

## 👍 Acknowledgments

...

<a name="contributing"></a>

## 🙏 Community & Contributions

Please follow [Contributing](.github/CONTRIBUTING.md) page.

<a name="codeofconduct"></a>

## 📙 Code of Conduct

Please follow [Code of Conduct](.github/CODE_OF_CONDUCT.md) page.

<a name="troubleshooting"></a>

## 💥 Troubleshooting

...

<a name="license"></a>

## 📑 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## _GitHub Project Tooling Overview_

### GitHub Actions

- **Build & Test** - Node.js project build validation
- **PR Title Check** - Ensures proper PR naming conventions
- **Commit Message Check** - Validates commit message format
- **Template Setup** - Automated template configuration

### Git Hooks (Husky)

- **Pre-commit** - Runs linting and formatting on staged files
- **Commit-msg** - Validates commit message format

### Quality Gates

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting enforcement
- **Stylelint** - CSS/SCSS linting
