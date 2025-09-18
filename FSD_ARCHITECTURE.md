# Feature-Sliced Design Architecture

This project has been refactored to follow Feature-Sliced Design (FSD) principles. FSD is a methodology for organizing frontend applications that promotes maintainability, scalability, and team collaboration.

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── app.tsx            # Main App component with providers
│   ├── router.ts          # Router configuration
│   └── index.ts           # Public API
├── pages/                  # Pages layer
│   ├── home/              # Home page slice
│   │   ├── ui/            # UI components
│   │   └── index.ts       # Public API
│   └── about/             # About page slice
│       ├── ui/            # UI components
│       └── index.ts       # Public API
├── features/              # Features layer
│   ├── auth/              # Authentication feature
│   │   ├── model/         # Business logic, queries, stores
│   │   └── index.ts       # Public API
│   └── user-management/   # User management feature
│       ├── model/         # Business logic, queries, stores
│       └── index.ts       # Public API
├── entities/              # Entities layer
│   ├── user/              # User entity
│   │   ├── model/         # Types and interfaces
│   │   ├── api/           # API methods
│   │   └── index.ts       # Public API
│   └── auth/              # Auth entity
│       ├── model/         # Types and interfaces
│       ├── api/           # API methods
│       └── index.ts       # Public API
├── shared/                # Shared layer
│   ├── api/               # Base API configuration
│   ├── lib/               # Utilities and helpers
│   ├── types/             # Common types
│   ├── ui/                # Reusable UI components
│   ├── locales/           # Internationalization files
│   └── index.ts           # Public API
└── routes/                # Tanstack Router files (auto-generated)
```

## Layer Descriptions

### 🔴 App Layer
- **Purpose**: Application initialization, global providers, routing setup
- **Contains**: App component, router configuration, global providers
- **Dependencies**: Can import from all other layers

### 🟠 Pages Layer  
- **Purpose**: Route-level components that compose features and entities
- **Contains**: Page components that correspond to routes
- **Dependencies**: Can import from features, entities, shared

### 🟡 Features Layer
- **Purpose**: Business features and user scenarios
- **Contains**: Feature-specific logic, hooks, queries, components
- **Dependencies**: Can import from entities, shared
- **Examples**: Authentication, user management, product catalog

### 🟢 Entities Layer
- **Purpose**: Business entities and their core logic
- **Contains**: Entity models, API methods, types
- **Dependencies**: Can import from shared only
- **Examples**: User, Product, Order

### 🔵 Shared Layer
- **Purpose**: Reusable code without business logic
- **Contains**: UI kit, utilities, API clients, types, constants
- **Dependencies**: Cannot import from other layers (except external libraries)

## Key Principles

### 1. Import Rule
Each layer can only import from layers below it:
- App → Pages, Features, Entities, Shared
- Pages → Features, Entities, Shared  
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
import { useLogin, useAuthMe } from '@/features/auth';

// ❌ Bad: Import internal implementation
import { authKeys } from '@/features/auth/model/queries';
```

### Importing from Entities
```typescript
// ✅ Good: Import entity types and API
import { User, userApi } from '@/entities/user';
import { authApi, LoginData } from '@/entities/auth';
```

### Importing from Shared
```typescript
// ✅ Good: Import utilities and types
import { formatDate, capitalize } from '@/shared/lib';
import { GenericDataResponse } from '@/shared/types';
import { AppLayout } from '@/shared/ui';
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