# Feature-Sliced Design Architecture

This project has been refactored to follow Feature-Sliced Design (FSD) principles. FSD is a methodology for organizing frontend applications that promotes maintainability, scalability, and team collaboration.

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── app.tsx            # Main App component with providers
│   ├── router.ts          # Router configuration
│   └── index.ts           # Public API
├── processes/              # Processes layer (NEW)
│   ├── auth-session/      # Cross-entity auth session management
│   │   ├── model/         # Session business logic
│   │   └── index.ts       # Public API
│   └── user-onboarding/   # Cross-entity user onboarding
│       ├── model/         # Onboarding business logic
│       └── index.ts       # Public API
├── pages/                  # Pages layer (owns routing)
│   ├── __root.tsx         # Root route with layout
│   ├── index.tsx          # Home route → HomePage
│   ├── about.tsx          # About route → AboutPage
│   ├── home/              # Home page slice
│   │   ├── ui/            # UI components
│   │   └── index.ts       # Public API
│   └── about/             # About page slice
│       ├── ui/            # UI components
│       └── index.ts       # Public API
├── features/              # Features layer
│   ├── auth/              # Authentication feature
│   │   ├── model/         # Feature-specific business logic
│   │   ├── ui/            # Feature UI components
│   │   └── index.ts       # Public API
│   └── user-management/   # User management feature
│       ├── model/         # Feature-specific business logic
│       ├── ui/            # Feature UI components
│       └── index.ts       # Public API
├── entities/              # Entities layer
│   ├── user/              # User entity
│   │   ├── model/         # Types, validation, entity queries
│   │   ├── api/           # API methods
│   │   └── index.ts       # Public API
│   └── auth/              # Auth entity
│       ├── model/         # Types, validation, entity queries
│       ├── api/           # API methods
│       └── index.ts       # Public API
├── widgets/               # Widgets layer (NEW)
│   ├── user-summary/      # Example widget
│   │   ├── ui/            # Widget UI composition
│   │   └── index.ts       # Public API
│   └── index.ts           # Widgets barrel
├── shared/                # Shared layer
│   ├── api/               # Base API configuration
│   ├── lib/               # Utilities and helpers
│   │   ├── store.ts       # Zustand store utilities
│   │   ├── store-persistence.ts  # Store persistence middleware
│   │   └── store-devtools.ts     # Development utilities
│   ├── model/             # Global state management
│   │   ├── ui-store.ts    # Global UI state (theme, modals, notifications)
│   │   └── app-settings-store.ts # App settings and preferences
│   ├── types/             # Common types
│   ├── ui/                # Reusable UI components
│   ├── locales/           # Internationalization files
│   └── index.ts           # Public API
└── routeTree.gen.ts       # Auto-generated route tree (Tanstack Router)
```

## Layer Descriptions

### 🔴 App Layer

- **Purpose**: Application initialization, global providers, routing setup
- **Contains**: App component, router configuration, global providers
- **Dependencies**: Can import from all other layers

### 🟠 Processes Layer

- **Purpose**: Cross-entity business workflows and application-wide state
- **Contains**: Complex business processes, session management, multi-entity coordination
- **Dependencies**: Can import from features, entities, shared
- **Examples**: Authentication session, user onboarding, checkout process

### 🟡 Pages Layer

- **Purpose**: Route-level components that compose features and entities
- **Contains**: Page components that correspond to routes
- **Dependencies**: Can import from processes, features, entities, shared

### 🟢 Features Layer

- **Purpose**: Business features with validation and business logic
- **Contains**: Feature-specific logic, validation, business rules, feature UI
- **Dependencies**: Can import from entities, shared
- **Examples**: User management forms, authentication flows, data tables

### 🔵 Entities Layer
### 🟣 Widgets Layer (NEW)

- **Purpose**: Compose multiple features/entities into reusable, higher-level UI blocks that can be shared across pages.
- **Contains**: Widget UI composition, light glue logic (no raw API calls)
- **Dependencies**: Can import from features, entities, shared
- **Examples**: User summary panels, dashboard sections, composite filters


- **Purpose**: Pure business entities with data access and basic UI
- **Contains**: Entity models, pure API calls, basic UI components for data display
- **Dependencies**: Can import from shared only
- **Examples**: User entity (data + UserCard), Product entity, Order entity

### ⚪ Shared Layer

- **Purpose**: Reusable code without business logic
- **Contains**: UI kit, utilities, API clients, types, constants
- **Dependencies**: Cannot import from other layers (except external libraries)

## Key Principles

### 1. Import Rule

Each layer can only import from layers below it:

- App → Pages, Features, Entities, Shared
- Pages → Widgets, Features, Entities, Shared
- Widgets → Features, Entities, Shared
- Features → Entities, Shared
- Entities → Shared
- Shared → External libraries only

### 2. Public API

Each slice exports its public API through `index.ts` files. Internal implementation details are not exposed.

### 3. Isolation

Each slice is isolated and can be developed, tested, and maintained independently.

## Migration Benefits

### Before (Traditional Structure)

```
src/
├── api/           # Mixed API clients
├── components/    # All components together
├── utils/         # Mixed utilities
├── types/         # All types together
└── routes/        # Route components
```

### After (FSD Structure)

- ✅ **Clear boundaries** between business logic and UI
- ✅ **Predictable imports** following the layer hierarchy
- ✅ **Scalable architecture** that grows with the application
- ✅ **Team collaboration** with clear ownership of slices
- ✅ **Reusable code** properly organized in shared layer
- ✅ **Testable units** with isolated business logic

## Usage Examples

### Importing from Features

```typescript
// ✅ Good: Import from feature's public API
import { useLogin, useAuthMe } from "@/features/auth";

// ❌ Bad: Import internal implementation
import { authKeys } from "@/features/auth/model/queries";
```

### Importing from Entities

```typescript
// ✅ Good: Import entity types and API
import { User, userApi } from "@/entities/user";
import { authApi, LoginData } from "@/entities/auth";
```

### Importing from Shared

```typescript
// ✅ Good: Import utilities and types
import { formatDate, capitalize } from "@/shared/lib";
import { GenericDataResponse } from "@/shared/types";
import { AppLayout } from "@/shared/ui";
```

## Development Guidelines

1. **Start with entities** - Define your business entities first
2. **Build features** - Create features that use entities
3. **Compose pages** - Combine features into pages
4. **Extract to shared** - Move reusable code to shared layer
5. **Follow the import rule** - Always respect the layer hierarchy
6. **Use public APIs** - Only import from `index.ts` files
7. **Keep slices focused** - Each slice should have a single responsibility

This architecture provides a solid foundation for scaling your Tanstack Router + Tanstack Query application while maintaining code quality and developer experience.

## Tans

tack Query + FSD Integration

### Query Organization by Layer

#### 🔵 **Entities Layer Queries**

- **Purpose**: Basic CRUD operations for single entities
- **Location**: `entities/{entity}/model/queries.ts`
- **Examples**: `useUser()`, `useUsers()`, `useAuthLogin()`
- **Characteristics**:
  - No business logic
  - Direct API calls
  - Basic cache invalidation
  - Entity-specific query keys

```typescript
// entities/user/model/queries.ts
export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.findByID(userId),
    enabled: !!userId,
  });
};
```

#### 🟡 **Features Layer Queries**

- **Purpose**: Feature-specific business logic using entity queries
- **Location**: `features/{feature}/model/queries.ts`
- **Examples**: `useUpdateUser()`, `useLogin()` (with invalidation logic)
- **Characteristics**:
  - Compose entity queries
  - Add feature-specific business logic
  - Handle complex invalidation patterns
  - May coordinate multiple entities

```typescript
// features/user-management/model/queries.ts
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updateParams }) => {
      // Validation and API call
      return userApi.updateUser(userId, updateParams);
    },
    onSuccess: (_, { userId }) => {
      // Feature-specific business logic
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Could add notifications, analytics, etc.
    },
  });
};
```

#### 🟠 **Processes Layer Queries**

- **Purpose**: Cross-entity business processes
- **Location**: `processes/{process}/model/queries.ts`
- **Examples**: `useLoginProcess()`, `useUserOnboardingProcess()`
- **Characteristics**:
  - Coordinate multiple entities
  - Complex business workflows
  - Cross-cutting concerns
  - Application-level state management

```typescript
// processes/auth-session/model/queries.ts
export const useLoginProcess = () => {
  const queryClient = useQueryClient();
  const loginMutation = useAuthLogin();

  return {
    ...loginMutation,
    mutateAsync: async (loginData: LoginInput) => {
      // Step 1: Perform login
      const result = await loginMutation.mutateAsync(loginData);

      // Step 2: Cross-entity coordination
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

      // Step 3: Additional business processes
      // - Analytics tracking
      // - User preferences initialization
      // - Notification setup

      return result;
    },
  };
};
```

### Query Keys Organization

#### Entity-Level Keys

```typescript
// entities/user/model/queries.ts
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
};

// entities/auth/model/queries.ts
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  refresh: () => [...authKeys.all, "refresh"] as const,
};
```

### Import Rules for Queries

#### ✅ **Correct Import Patterns**

```typescript
// Features can import from entities
import { useUser, useUsers, userKeys } from "@/entities/user";
import { useAuthLogin, authKeys } from "@/entities/auth";

// Processes can import from entities and features
import { useAuthLogin } from "@/entities/auth";
import { useUserMe } from "@/entities/user";

// Pages can import from processes, features, and entities
import { useLoginProcess } from "@/processes/auth-session";
import { useUpdateUser } from "@/features/user-management";
```

#### ❌ **Incorrect Import Patterns**

```typescript
// Entities cannot import from features or processes
import { useLogin } from "@/features/auth"; // ❌ Wrong!

// Entities cannot import from other entities (except shared)
import { useUser } from "@/entities/user"; // ❌ Wrong in auth entity!
```

### Best Practices

#### 1. **Entity Queries Should Be Pure**

- No business logic
- Direct API mapping
- Basic validation only
- Minimal cache invalidation

#### 2. **Feature Queries Add Business Logic**

- Compose entity queries
- Add feature-specific invalidation
- Handle feature-specific error states
- Coordinate related operations

#### 3. **Process Queries Handle Workflows**

- Cross-entity coordination
- Complex business processes
- Application-level state changes
- Multi-step operations

#### 4. **Query Key Hierarchy**

- Entity keys at entity level
- Feature-specific keys (if needed) at feature level
- Process-specific keys at process level
- Always use hierarchical structure

This architecture ensures proper separation of concerns while maintaining the flexibility and power of Tanstack Query within the FSD methodology.

##

Routing Architecture

### 🔄 **Tanstack Router + FSD Integration**

#### **Route Organization (FSD Compliant)**

- **Route definitions**: Located in `pages/` (pages layer owns routing)
- **Page components**: Located in `pages/{page}/ui/` (pages layer)
- **Router configuration**: Managed in `app/router.ts` (application layer)

#### **File Structure**

```
src/
├── app/
│   └── router.ts          # Router configuration
├── pages/
│   ├── __root.tsx         # Root layout route
│   ├── index.tsx          # Home route → imports HomePage
│   ├── about.tsx          # About route → imports AboutPage
│   ├── home/
│   │   ├── ui/
│   │   │   └── home-page.tsx    # Page component
│   │   └── index.ts             # Exports HomePage
│   └── about/
│       ├── ui/
│       │   └── about-page.tsx   # Page component
│       └── index.ts             # Exports AboutPage
└── routeTree.gen.ts       # Auto-generated by Tanstack Router
```

#### **Route Definition Pattern**

```typescript
// pages/about.tsx
import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "./about";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
```

#### **Page Component Pattern**

```typescript
// pages/about/ui/about-page.tsx
export function AboutPage() {
  return <div>About content</div>;
}

// pages/about/index.ts
export { AboutPage } from './ui/about-page';
```

### **Benefits of This Approach**

#### ✅ **Proper FSD Compliance**

- **Pages layer** owns both routing and page components
- **No dual routing structure** - single source of truth
- **Clear ownership** - pages manage their own routes

#### ✅ **Tanstack Router Compatibility**

- Routes are in `pages/` directory for natural organization
- Auto-generation works seamlessly with the file structure
- Type safety maintained across route definitions

#### ✅ **Simplified Architecture**

- **Single routing location** eliminates confusion
- **Co-located** route definitions with page components
- **Easy navigation** - find routes where pages are defined

#### ✅ **Scalability**

- Easy to add new routes directly in `pages/`
- Page components can compose multiple features
- Route-specific logic stays with page definitions
- Shared layouts managed in root route

This routing architecture properly follows FSD principles by giving the pages layer full ownership of routing concerns.

## State Management Architecture

This project uses a hybrid approach for state management:

### Server State (Tanstack Query)

- **Purpose**: Caching, synchronization, and background updates of server data
- **Location**: Query hooks in entity and feature layers
- **Examples**: User data, authentication tokens, API responses

### Client State (Zustand)

- **Purpose**: UI state, user preferences, form state, and session management
- **Location**: Store files in appropriate FSD layers
- **Examples**: Theme, sidebar state, modal management, form drafts

### Store Organization by Layer

#### Shared Layer Stores

- `ui-store.ts`: Global UI state (theme, modals, notifications, loading)
- `app-settings-store.ts`: User preferences and app configuration

#### Entity Layer Stores

- `auth/model/auth-store.ts`: Authentication session state and token management

#### Feature Layer Stores

- `auth/model/form-store.ts`: Form-specific state with validation and auto-save

#### Process Layer Integration

- `auth-session/model/auth-integration.ts`: Hooks that connect Zustand with Tanstack Query

### State Management Best Practices

1. **Separation of Concerns**: Keep server state in Tanstack Query, client state in Zustand
2. **Layer Compliance**: Store placement follows FSD layer rules
3. **Selective Subscriptions**: Use specific selectors to avoid unnecessary re-renders
4. **Persistence**: Important state is automatically persisted to localStorage
5. **Integration**: Process layer provides hooks that coordinate between stores and queries

### Example Usage

```typescript
// UI State Management
import { useTheme, useNotifications } from '@/shared';

function MyComponent() {
  const theme = useTheme();
  const { add: addNotification } = useNotifications();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <button onClick={() => addNotification({
        type: 'success',
        title: 'Success!',
        message: 'Operation completed'
      })}>
        Show Notification
      </button>
    </div>
  );
}

// Auth State Management
import { useAuthSession } from '@/entities/auth';
import { useLoginProcess } from '@/processes/auth-session';

function LoginComponent() {
  const { isAuthenticated, user } = useAuthSession();
  const login = useLoginProcess();

  if (isAuthenticated) {
    return <div>Welcome, {user?.first_name}!</div>;
  }

  return <LoginForm onSubmit={login.mutateAsync} />;
}
```

For detailed information about Zustand integration, see [zusand-integration.md](./zusand-integration.md).
