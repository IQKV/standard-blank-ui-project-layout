# CLAUDE.md - Best Practices Guide

## Table of Contents

- [Introduction](#introduction)
- [React Best Practices](#react-best-practices)
- [TanStack Router Best Practices](#tanstack-router-best-practices)
- [TanStack Query Best Practices](#tanstack-query-best-practices)
- [Project Structure](#project-structure)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)
- [Security](#security)
- [Additional Resources](#additional-resources)

## Introduction

This document outlines best practices for developing with React 19, TanStack Router, and TanStack Query in this project. Following these guidelines will help ensure code consistency,
maintainability, and performance across the project.

## React Best Practices

### Component Structure

- **Function Components**: Use function components with hooks instead of class components.
- **Small, Focused Components**: Create small, reusable components with a single responsibility.
- **Custom Hooks**: Extract complex logic into custom hooks to promote reusability.

```tsx
// Good: Small, focused component
function UserAvatar({ user }) {
return <img src={user.avatarUrl} alt={user.name} className="avatar" />;
}

// Good: Custom hook for shared logic
function useUserStatus(userId) {
const [isOnline, setIsOnline] = useState(false);

useEffect(() => {
// Status checking logic
return () => {
// Cleanup
};
}, [userId]);

return isOnline;
}
```

### State Management

- **Local State**: Use `useState` for component-specific state.
- **Context API**: Use React Context for sharing state across deeply nested components.
- **State Initialization**: Use lazy initialization for expensive state computations.

```tsx
// Good: Lazy state initialization
const [users, setUsers] = useState(() => {
return computeInitialUsers(); // Only called on first render
});
```

### Performance

- **Memoization**: Use `useMemo` for expensive calculations and `useCallback` for functions passed as props.
- **React.memo**: Wrap components with `React.memo()` to prevent unnecessary re-renders when props haven't changed.
- **Virtualization**: Use virtualization for large lists (consider libraries like `react-window`).

```tsx
// Good: Memoized expensive calculation
const sortedItems = useMemo(() => {
return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Good: Memoized callback
const handleClick = useCallback(() => {
// Handle click logic
}, [dependencies]);
```

### React 19 Features

- **Leverage React 19's new features**: Utilize the latest React 19 features like improved Suspense, automatic batching, and the new React compiler.
- **Concurrent Mode**: Adopt concurrent features to improve user experience.

## TanStack Router Best Practices

### Route Organization

- **Feature-Based Routes**: Organize routes by feature rather than route type.
- **Code Splitting**: Utilize the built-in code-splitting capabilities of TanStack Router.

```tsx
// routes/users/index.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/')({
component: UsersComponent,
});

// Lazily loaded route
const UsersComponent = React.lazy(() => import('./UsersComponent'));
```

### Route Configuration

- **Type Safety**: Leverage TanStack Router's type safety features.
- **Consistent Naming**: Use a consistent naming convention for route files.
- **Search Params**: Define search params properly with validation.

```tsx
export const Route = createFileRoute('/users/')({
validateSearch: (search) => {
return {
page: Number(search.page) || 1,
pageSize: Number(search.pageSize) || 10,
};
},
component: UsersComponent,
});
```

### Navigation

- **Link Component**: Use the `Link` component for navigation instead of anchor tags.
- **Programmatic Navigation**: Use the `useNavigate` hook for programmatic navigation.

```tsx
// Good: Using Link component
<Link to="/users" search={{ page: 2 }}>
Next Page
</Link>

// Good: Programmatic navigation
const navigate = useNavigate();
navigate({ to: '/users', search: { page: 2 } });
```

### Route Guards

- **Authentication**: Implement route guards for authentication and authorization.
- **Data Requirements**: Ensure required data is available before rendering components.

```tsx
export const Route = createFileRoute('/admin/')({
beforeLoad: async ({ context }) => {
const user = await context.auth.getUser();
if (!user || !user.isAdmin) {
throw redirect({ to: '/login' });
}
return { user };
},
component: AdminComponent,
});
```

## TanStack Query Best Practices

### Query Organization

- **Feature-Based Queries**: Group queries by feature.
- **Custom Hooks**: Encapsulate query logic in custom hooks.

```tsx
// hooks/users/useUsersQuery.ts
export function useUsersQuery(page = 1) {
return useQuery({
queryKey: ['users', { page }],
queryFn: () => fetchUsers(page),
});
}
```

### Query Keys

- **Structured Keys**: Use structured query keys to enable automatic refetching.
- **Consistency**: Maintain consistent query key patterns throughout the application.

```tsx
// Good: Structured query keys
useQuery({
queryKey: ['users', { id, filters }],
queryFn: () => fetchUser(id, filters),
});
```

### Mutations

- **Optimistic Updates**: Use optimistic updates for mutations to improve perceived performance.
- **Error Handling**: Implement robust error handling for mutations.

```tsx
// Good: Mutation with optimistic update
const queryClient = useQueryClient();

useMutation({
mutationFn: updateUser,
onMutate: async (newUser) => {
// Cancel outgoing refetches
await queryClient.cancelQueries({ queryKey: ['users', newUser.id] });

    // Snapshot the previous value
    const previousUser = queryClient.getQueryData(['users', newUser.id]);
    
    // Optimistically update
    queryClient.setQueryData(['users', newUser.id], newUser);
    
    // Return context for potential rollback
    return { previousUser };
},
onError: (err, newUser, context) => {
// Rollback on error
if (context?.previousUser) {
queryClient.setQueryData(['users', newUser.id], context.previousUser);
}
},
onSettled: (data, error, variables) => {
// Always refetch after error or success
queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
},
});
```

### Caching Strategy

- **Stale Time**: Configure appropriate `staleTime` for queries based on data volatility.
- **Cache Time**: Configure `gcTime` (previously cacheTime) to control cache lifetime.
- **Refetch Strategies**: Use appropriate refetch strategies (on window focus, interval, etc.).

```tsx
useQuery({
queryKey: ['users'],
queryFn: fetchUsers,
staleTime: 5 * 60 * 1000, // 5 minutes
gcTime: 10 * 60 * 1000, // 10 minutes
refetchOnWindowFocus: true,
refetchOnMount: true,
});
```

### Performance

- **Prefetching**: Implement data prefetching for anticipated user actions.
- **Pagination/Infinite Queries**: Use `useInfiniteQuery` for infinite scrolling.
- **Parallel Queries**: Run independent queries in parallel.

```tsx
// Good: Prefetching data
const prefetchUser = (id) => {
queryClient.prefetchQuery({
queryKey: ['user', id],
queryFn: () => fetchUser(id),
});
};

// Good: Infinite query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
queryKey: ['projects'],
queryFn: ({ pageParam = 0 }) => fetchProjects(pageParam),
getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

## Project Structure

### Directory Organization

- **Feature-Based**: Organize code by feature rather than type.
- **Colocate Related Files**: Keep related files (components, hooks, tests) together.

```

src/
├── features/
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   └── products/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── types/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── routes/
└── main.tsx
```

### API Layer

- **Abstraction**: Create a dedicated API layer to separate data fetching logic from UI components.
- **Consistency**: Use consistent patterns for API requests.

```tsx
// api/users.ts
export async function fetchUsers(page = 1) {
const response = await axios.get(`/api/users?page=${page}`);
return response.data;
}

export async function createUser(userData) {
const response = await axios.post('/api/users', userData);
return response.data;
}
```

## Performance Optimization

### Code Splitting

- **Route-Based**: Utilize TanStack Router's built-in code splitting.
- **Component-Based**: Lazy-load heavy components.

```tsx
// Lazy loading a component
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function MyComponent() {
return (
<React.Suspense fallback={<LoadingSpinner />}>
<HeavyComponent />
</React.Suspense>
);
}
```

### Bundle Size

- **Tree Shaking**: Ensure proper imports to enable tree shaking.
- **Dependencies**: Regularly audit dependencies to identify large or unnecessary packages.

```tsx
// Good: Named imports for better tree shaking
import { useState, useEffect } from 'react';

// Bad: Importing entire libraries
import _ from 'lodash';

// Good: Import only what you need
import debounce from 'lodash/debounce';
```

### Rendering Optimization

- **Avoid Unnecessary Re-renders**: Use `React.memo`, `useMemo`, and `useCallback` appropriately.
- **Virtualization**: Implement virtualization for long lists.
- **Debouncing/Throttling**: Apply debouncing or throttling to expensive operations.

```tsx
// Debounce input handler
const debouncedChangeHandler = useCallback(
debounce((value) => {
setSearchQuery(value);
}, 300),
[]
);
```

## Testing

### Unit Testing

- **Component Tests**: Test components in isolation.
- **Hook Tests**: Test custom hooks independently.
- **Test Structure**: Follow the Arrange-Act-Assert pattern.

```tsx
// Testing a component
test('renders user information correctly', () => {
// Arrange
const user = { id: 1, name: 'John Doe' };

// Act
render(<UserProfile user={user} />);

// Assert
expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

### Integration Testing

- **User Flows**: Test common user flows.
- **Query Mocking**: Use MSW (Mock Service Worker) to mock API requests.

```tsx
// Setting up MSW for tests
const server = setupServer(
rest.get('/api/users', (req, res, ctx) => {
return res(ctx.json({ users: mockUsers }));
})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### E2E Testing

- **Critical Paths**: Identify and test critical user paths with Playwright.
- **Realistic Environment**: Test in an environment that closely mimics production.

## Security

### Input Validation

- **Client-Side Validation**: Implement client-side validation for immediate feedback.
- **Server-Side Validation**: Never trust client-side validation alone.

### API Security

- **Authentication**: Implement proper authentication mechanisms.
- **Authorization**: Check permissions before performing sensitive operations.
- **CSRF Protection**: Implement CSRF protection for mutation operations.

### Data Handling

- **Sanitization**: Sanitize user-generated content before rendering.
- **XSS Prevention**: Avoid using `dangerouslySetInnerHTML` when possible.

```tsx
// Good: Using a sanitization library
import sanitizeHtml from 'sanitize-html';

function Comment({ content }) {
const sanitizedContent = sanitizeHtml(content);
return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
```

## Additional Resources

- [React Documentation](https://react.dev/)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)

```
