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

- ✨ **React 19** - Experience the future with the latest React version
- ⚡ **Vite** - Lightning-fast development with instant HMR
- 🎯 **TypeScript** - Type-safe development with latest features
- 📦 **PNPM** - Fast, disk space efficient package manager
- 🔍 **ESLint + Prettier** - Modern linting and code formatting
- 🔄 **TanStack Router** - Type-safe routing with code splitting
- 🔄 **TanStack Query** for powerful data synchronization
- 📡 **Axios** for API calls
- 📡 **graphql-request** for GraphQL support
- 🧱 **storybook** for building UIs in isolation
- 🧪 **vitest** for fast testing
- 🧪 **Playwright** for fast and reliable e2e testing
- 🧪 **Mock Service Worker** for client-agnostic API mocks
- ✅ **React Hook Form + Yup** for form validation
- 🎭 **React Icons** for beautiful icons
- 👷 **GitHub Actions** for easy workflow automation
- 🔒️ **Dependabot** for monitoring vulnerabilities and keeping dependencies up to date

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

```bash
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

### Environment Variables

| Variable   | Description                | Default       |
| ---------- | -------------------------- | ------------- |
| `TZ`       | Defines timezone           | `UTC`         |
| `NODE_ENV` | Defines nodejs environment | `development` |

---

<a name="changelog"></a>

## 📆 Changelog

Conventional changelog located [here](CHANGELOG.md).

<a name="acknowledgments"></a>

## 👍 Acknowledgments

...

<a name="contributing"></a>

## 🙏 Community & Contributions

Please, follow [Contributing](.github/CONTRIBUTING.md) page.

<a name="codeofconduct"></a>

## 📙 Code of Conduct

Please, follow [Code of Conduct](.github/CODE_OF_CONDUCT.md) page.

<a name="troubleshooting"></a>

## 💥 Troubleshooting

...

<a name="license"></a>

## 📑 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
