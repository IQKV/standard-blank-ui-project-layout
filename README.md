> ## 🚀 Ready to build something amazing?
>
> This is a production-ready React 19 starter template that gets you up and running in minutes, not hours.
>
> **What makes this template special:**
>
> - ⚡ **React 19** - Latest features and performance improvements
> - 🏗️ **Feature-Sliced Design** - Scalable architecture that grows with your team
> - 🔄 **TanStack Router & Query** - Type-safe routing and powerful data fetching
> - 🎯 **TypeScript** - Full type safety from API to UI
> - ⚡ **Vite** - Lightning-fast development experience
> - 🧪 **Complete testing setup** - Unit, integration, and E2E testing ready
> - 📦 **Modern tooling** - ESLint, Prettier, Husky, and more configured
> - 🔒 **Production ready** - Security best practices and performance optimizations
>
> Click ** [Use this template](https://github.com/IQKV/standard-blank-ui-project-layout/generate) ** to get started!

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

- ✅ **Zod Validation** - Runtime type validation with schemas
- 📝 **React Hook Form** - Performant forms with validation integration
- 🔐 **Type-safe Forms** - End-to-end type safety from validation to submission

### 🧪 **Testing & Quality**

- 🧪 **Vitest** - Fast unit and integration testing with 228 tests
- 🧪 **Co-located Tests** - Tests next to source code for better maintainability
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
# Use this template
Click **[Use this template](https://github.com/IQKV/standard-blank-ui-project-layout/generate)** to create your new repository

# Or clone manually
git clone https://github.com/IQKV/standard-blank-ui-project-layout.git my-app
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

### 🚀 Ready to Deploy?

Check out our [Deployment Guide](template-docs/deployment.md) for step-by-step instructions on deploying to Vercel, Netlify, AWS, and more.

### 📋 Complete Feature List

See [Template Features](template-docs/template-features.md) for an overview of all included technologies, tools, and capabilities.

### 🏗️ **Feature-Sliced Design Architecture**

This project follows **Feature-Sliced Design (FSD)** methodology for scalable frontend architecture.

### 🎯 **Layer Responsibilities**

| Layer         | Purpose                                            | Can Import From                       |
| ------------- | -------------------------------------------------- | ------------------------------------- |
| **App**       | Application initialization, global providers       | All layers                            |
| **Processes** | Cross-entity workflows, complex business processes | Features, Entities, Shared            |
| **Pages**     | Route components, page composition                 | Processes, Features, Entities, Shared |
| **Features**  | Business logic, validation, feature UI             | Entities, Shared                      |
| **Entities**  | Pure data access, basic UI components              | Shared only                           |
| **Shared**    | Reusable utilities, no business logic              | External libraries only               |

### 📚 **Architecture Documentation**

- 📚 [**Documentation Index**](template-docs/index.md) - Complete documentation guide
- 📖 [**FSD Architecture Guide**](template-docs/fsd-architecture.md) - Complete architecture overview
- 🔒 [**Public API Enforcement**](template-docs/public-api-enforcement.md) - API patterns and rules
- ✅ [**Validation Guide**](template-docs/validation-guide.md) - Zod validation patterns
- 🛠️ [**Development Guide**](template-docs/development-guide.md) - Step-by-step development patterns

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable        | Description         | Default       | Required |
| --------------- | ------------------- | ------------- | -------- |
| `VITE_API_URL`  | Backend API URL     | -             | Yes      |
| `VITE_APP_NAME` | Application name    | `React App`   | No       |
| `TZ`            | Timezone            | `UTC`         | No       |
| `NODE_ENV`      | Node.js environment | `development` | No       |

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

## 🚀 Using This Template

### Quick Start

1. Click **[Use this template](https://github.com/IQKV/standard-blank-ui-project-layout/generate)**
2. Clone your new repository
3. Run `pnpm install && pnpm dev`
4. Start building your app! 🎉

### What Happens When You Use This Template

- Automatic repository setup with your project name
- Updated package.json with your repository details
- Clean removal of template-specific files
- Ready-to-use development environment

### Customization Checklist

After creating your project from this template:

- [ ] Update the app title in `src/pages/index.tsx`
- [ ] Configure your API endpoints in `src/shared/api/`
- [ ] Add your brand colors and styling
- [ ] Update the favicon and app icons in `public/`
- [ ] Configure environment variables in `.env`
- [ ] Set up your deployment pipeline
- [ ] Update this README with your project details

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
