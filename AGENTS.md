# React Project Development Guide

## Project Overview

This is a modern frontend project template based on React 19, TypeScript, and Vite. It's suitable for building high-performance Single Page Applications (SPA) with integrated modern development toolchain and best practices.

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand / Redux Toolkit / Tanstack Query
- **Routing**: Tanstack Router
- **UI Components**: Material-UI / Mantine UI
- **Styling**: Tailwind CSS / Styled-components
- **HTTP Client**: Axios
- **Testing Framework**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky

## Development Guidelines

### Component Development Standards

1. **Function Components First**: Use function components and Hooks
2. **TypeScript Types**: Define interfaces for all props
3. **Component Naming**: Use PascalCase, file name matches component name
4. **Single Responsibility**: Each component handles only one functionality

```tsx
// Example: Button Component
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = "medium",
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### State Management Standards

Using Zustand for state management:

```tsx
// store/userStore.ts
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### API Service Standards

```tsx
// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
```

## Environment Setup

### Development Requirements

- Node.js >= 22.0.0
- pnpm

### Environment Variables Configuration

```env
# .env.local
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=My React App
VITE_ENABLE_MOCK=false
```

## Testing Strategy

### Unit Testing Example

```tsx
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../src/components/Button";

describe("Button Component", () => {
  test("renders button with text", () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Click me
      </Button>
    );

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from "react";

const LazyComponent = lazy(() => import("./LazyComponent"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Memory Optimization

```tsx
import { memo, useMemo, useCallback } from "react";

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map((item) => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback(
    (id) => {
      onUpdate(id);
    },
    [onUpdate]
  );

  return (
    <div>
      {processedData.map((item) => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```
