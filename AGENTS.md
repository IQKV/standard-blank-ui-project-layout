# AI Agent Development Guide for React Project

## Project Overview

This is a modern React 19 starter template with TypeScript, Vite, TanStack Router & Query, and Feature-Sliced Design (FSD) architecture. The project is designed for building scalable,
maintainable Single Page Applications with testing, internationalization, and modern development practices.

## 🏗️ Architecture & Design Patterns

### Feature-Sliced Design (FSD) Architecture

The project follows FSD methodology for better scalability and maintainability:

```
src/
├── app/           # Application layer (initialization, providers, routing)
├── pages/         # Page components (route-level components)
├── widgets/       # Complex UI blocks (composed of features/entities)
├── features/      # Business logic features (user interactions)
├── entities/      # Business entities (domain models, API)
├── shared/        # Reusable code (UI kit, utilities, API client)
└── processes/     # Cross-cutting business processes
```

### Layer Responsibilities

- **App Layer**: Application initialization, global providers, routing configuration
- **Pages Layer**: Route components, page-level layouts
- **Widgets Layer**: Complex UI blocks composed of features and entities
- **Features Layer**: User interactions, business logic, form handling
- **Entities Layer**: Domain models, API interactions, data transformations
- **Shared Layer**: Reusable utilities, UI components, API client, types
- **Processes Layer**: Cross-cutting business processes, workflows

## 🛠️ Tech Stack & Dependencies

### Core Technologies

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.x
- **State Management**: Zustand + TanStack Query
- **Routing**: TanStack Router
- **HTTP Client**: Axios
- **Internationalization**: Lingui
- **Testing**: Vitest + React Testing Library + Playwright
- **Code Quality**: ESLint + Prettier + Husky

### Key Libraries

- **UI Components**: Custom components with accessibility support
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: CSS with PostCSS
- **Icons**: Tabler Icons + React Icons
- **Development**: Storybook, MSW (Mock Service Worker)

## 🧪 Testing Strategy & Implementation

### Comprehensive Test Suite (228 Tests)

The project includes a robust testing infrastructure with modern co-located testing patterns:

#### Test Structure (Co-located)

```
src/
├── tests/                         # Integration tests only
│   ├── auth-flow.test.tsx        # End-to-end user flow tests
│   ├── setup.ts                  # MSW and global test setup
│   └── test-utils.tsx            # Custom render utilities
├── entities/*/api/*.test.ts       # API layer tests (co-located)
├── entities/*/model/*.test.ts     # React Query hooks tests (co-located)
├── features/*/model/*.test.ts     # Feature validation tests (co-located)
├── shared/lib/*.test.ts           # Utility function tests (co-located)
└── app/config/*.test.ts           # Configuration tests (co-located)
```

#### Testing Best Practices

- **API Testing**: Mock all HTTP requests using MSW
- **React Query Testing**: Test hooks with proper QueryClient setup
- **Validation Testing**: Comprehensive Zod schema testing
- **Integration Testing**: Complete user flow testing
- **Error Handling**: Test all error scenarios and edge cases

#### Test Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run E2E tests
pnpm e2e
```

## 🔧 Development Guidelines

### Component Development Standards

#### 1. Component Structure

```tsx
// src/shared/ui/components/Button/Button.tsx
import React from "react";
import { clsx } from "clsx";

interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  children,
  className,
}) => {
  return (
    <button
      className={clsx(
        "btn",
        `btn-${variant}`,
        `btn-${size}`,
        { "btn-loading": loading },
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
```

#### 2. Entity Layer Pattern

```tsx
// src/entities/user/api/user-api.ts
import { api } from "@/shared/api";
import { GenericDataResponse, IdParam } from "@/shared/types";
import { User, CreateUserRequest } from "../model/types";

export const userApi = {
  // CRUD operations
  create: async (userData: CreateUserRequest) => {
    const response = await api.post<GenericDataResponse<User>>(
      "users",
      userData
    );
    return response.data;
  },

  getAll: async (params?: UserFilters) => {
    const response = await api.get<GenericDataResponse<User[]>>("users", {
      params,
    });
    return response.data;
  },

  getById: async (userId: IdParam) => {
    const response = await api.get<GenericDataResponse<User>>(
      `users/${userId}`
    );
    return response.data;
  },

  update: async (userId: IdParam, updateData: Partial<User>) => {
    const response = await api.put<GenericDataResponse<User>>(
      `users/${userId}`,
      updateData
    );
    return response.data;
  },

  delete: async (userId: IdParam) => {
    const response = await api.delete<GenericDataResponse<void>>(
      `users/${userId}`
    );
    return response.data;
  },
};
```

#### 3. React Query Hooks Pattern

```tsx
// src/entities/user/model/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user-api";

// Hierarchical query keys for better cache management
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
};

// Query hooks
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.getAll(filters),
  });
};

export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
  });
};

// Mutation hooks with optimistic updates
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userApi.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
```

#### 4. Feature Layer Pattern

```tsx
// src/features/auth/model/validation.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// src/features/auth/model/queries.ts
import { useAuthLogin } from "@/entities/auth";
import { loginSchema, type LoginInput } from "./validation";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const loginMutation = useAuthLogin();

  return {
    ...loginMutation,
    mutateAsync: async (loginData: LoginInput) => {
      // Feature-level validation
      const validatedData = loginSchema.parse(loginData);
      const result = await loginMutation.mutateAsync(validatedData);

      // Business logic: invalidate user session after successful login
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      return result;
    },
  };
};
```

### State Management with Zustand

#### Global UI State

```tsx
// src/shared/model/ui-store.ts
import { createStore } from "@/shared/lib/store";

interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  modals: Record<string, { isOpen: boolean; data?: unknown }>;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>;
}

interface UIActions {
  setTheme: (theme: UIState["theme"]) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: (modalId: string) => void;
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id">
  ) => void;
}

export const useUIStore = createStore<UIState & UIActions>(
  "ui-store",
  (set) => ({
    // Initial state
    theme: "system",
    sidebarOpen: true,
    modals: {},
    notifications: [],

    // Actions
    setTheme: (theme) =>
      set((state) => {
        state.theme = theme;
      }),
    toggleSidebar: () =>
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),
    openModal: (modalId, data) =>
      set((state) => {
        state.modals[modalId] = { isOpen: true, data };
      }),
    closeModal: (modalId) =>
      set((state) => {
        if (state.modals[modalId]) {
          state.modals[modalId].isOpen = false;
          delete state.modals[modalId].data;
        }
      }),
    addNotification: (notification) =>
      set((state) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        state.notifications.push({ ...notification, id });
      }),
  })
);
```

### API Client Configuration

#### Base API Setup

```tsx
// src/shared/api/base.ts
import axios from "axios";
import { getAppConfig } from "@/shared/lib/config-types";
import { normalizeAxiosError } from "./errors";

const api = axios.create({
  baseURL:
    getAppConfig().apiConfig.baseUrl || import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor with error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeAxiosError(error);
    return Promise.reject(normalized);
  }
);

export { api };
```

#### Error Handling

```tsx
// src/shared/api/errors.ts
export enum ApiErrorKind {
  Network = "Network",
  Timeout = "Timeout",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  NotFound = "NotFound",
  Validation = "Validation",
  ServerError = "ServerError",
  Unknown = "Unknown",
}

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status?: number;
  message: string;
  data?: unknown;
  details?: unknown;
  original: unknown;
}

export const normalizeAxiosError = (error: unknown): NormalizedApiError => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    const status = err.response?.status;

    let kind: ApiErrorKind = ApiErrorKind.Unknown;

    if (!err.response) {
      kind = ApiErrorKind.Network;
    } else if (status === 401) {
      kind = ApiErrorKind.Unauthorized;
    } else if (status === 403) {
      kind = ApiErrorKind.Forbidden;
    } else if (status === 404) {
      kind = ApiErrorKind.NotFound;
    } else if (status === 422) {
      kind = ApiErrorKind.Validation;
    } else if (status && status >= 500) {
      kind = ApiErrorKind.ServerError;
    }

    return {
      kind,
      status,
      message: err.response?.data?.message || err.message,
      data: err.response?.data,
      details: err.response?.data?.errors,
      original: error,
    };
  }

  return {
    kind: ApiErrorKind.Unknown,
    message: (error as any)?.message || "Unknown error",
    original: error,
  };
};
```

## 🌐 Internationalization (i18n)

### Lingui Setup

```tsx
// src/shared/locales/index.ts
export const availableLocales = ["en", "es", "fr", "de"] as const;
export type SupportedLocales = (typeof availableLocales)[number];

// Usage in components
import { Trans, t } from "@lingui/macro";

export const WelcomeMessage = () => {
  return (
    <div>
      <h1>
        <Trans>Welcome to our application</Trans>
      </h1>
      <p>{t`Please sign in to continue`}</p>
    </div>
  );
};
```

## 🚀 Performance Optimization

### Code Splitting & Lazy Loading

```tsx
// src/pages/LazyPage.tsx
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/shared/ui";

const LazyComponent = lazy(() => import("./HeavyComponent"));

export const LazyPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
};
```

### React Query Optimization

```tsx
// Prefetching data
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: userKeys.detail(userId),
        queryFn: () => userApi.getById(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );
};

// Infinite queries for pagination
export const useInfiniteUsers = (filters?: UserFilters) => {
  return useInfiniteQuery({
    queryKey: userKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      userApi.getAll({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });
};
```

## 🔒 Security Best Practices

### Input Validation

```tsx
// src/shared/lib/validation.ts
import { z } from 'zod';

export const createRequiredField = <T extends z.ZodTypeAny>(
  schema: T,
  message?: string
) => {
  return schema.refine(
    (val) => val !== undefined && val !== null && val !== '',
    { message: message || 'This field is required' }
  );
};

export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, curr) => {
        const path = curr.path.join('.');
        acc[path] = curr.message;
        return acc;
      }, {} as Record<string, string>);
      return { success: false, errors };
    }
    return { success: false, errors: { _general: 'Validation failed' } };
  }
};
```

### Authentication & Authorization

```tsx
// src/app/config/react-query.ts
export const setupReactQueryAuthRedirects = (client: QueryClient): void => {
  client.getQueryCache().subscribe((event) => {
    if (event?.type === "updated") {
      const error = event?.query?.state?.error;
      if (
        isNormalizedApiError(error) &&
        (error.kind === ApiErrorKind.Unauthorized ||
          error.kind === ApiErrorKind.Forbidden)
      ) {
        // Redirect to login
        window?.location?.replace("/auth/login");
      }
    }
  });
};
```

## 📝 Development Workflow

### Git Workflow

```bash
# Feature development
git checkout -b feature/user-authentication
git add .
git commit -m "feat: add user authentication flow"
git push origin feature/user-authentication

# Create PR and merge to main
```

### Code Quality Checks

```bash
# Lint code
pnpm lint
pnpm lint:fix

# Format code
pnpm formatter:write

# Type checking
pnpm type-check

# Run all quality checks
pnpm ci
```

### Build & Deployment

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Release
pnpm release
```

## 🛠️ AI Agent Guidelines

### When Working with This Project

1. **Follow FSD Architecture**: Always place code in the appropriate layer
2. **Use Existing Patterns**: Follow established patterns for API, queries, and components
3. **Write Tests**: Every new feature should include comprehensive tests
4. **Type Safety**: Ensure full TypeScript coverage
5. **Performance**: Consider lazy loading and code splitting for large features
6. **Accessibility**: Follow WCAG guidelines for UI components
7. **Internationalization**: Use Lingui for all user-facing text
8. **Error Handling**: Implement proper error boundaries and user feedback

### Common Tasks & Patterns

#### Adding a New Entity

1. Create API functions in `src/entities/{entity}/api/`
2. Create co-located API tests in `src/entities/{entity}/api/{entity}-api.test.ts`
3. Define types in `src/entities/{entity}/model/types.ts`
4. Create React Query hooks in `src/entities/{entity}/model/queries.ts`
5. Create co-located query tests in `src/entities/{entity}/model/queries.test.ts`
6. Export from `src/entities/{entity}/index.ts`

#### Adding a New Feature

1. Create feature in `src/features/{feature}/`
2. Add validation schemas in `model/validation.ts`
3. Create co-located validation tests in `model/validation.test.ts`
4. Create feature-specific query hooks in `model/queries.ts`
5. Create co-located query tests in `model/queries.test.ts`
6. Build UI components in `ui/`
7. Add integration tests in `src/tests/`

#### Adding a New Page

1. Create page component in `src/pages/`
2. Add route configuration in TanStack Router
3. Implement proper loading and error states
4. Add E2E tests with Playwright

### Testing Guidelines for AI Agents

- **Always write tests** for new functionality
- **Use MSW** for API mocking in tests
- **Test error scenarios** not just happy paths
- **Follow existing test patterns** in the codebase
- **Run tests** before submitting changes: `pnpm test`

This project is designed for scalability, maintainability, and developer experience. Follow these guidelines to ensure consistency and quality in your contributions.
