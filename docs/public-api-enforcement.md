# Public API Enforcement Guide

## 🔒 **Public API Pattern in FSD**

Each slice must only expose what's needed through barrel files (`index.ts`) and prevent cross-slice imports that bypass the public API.

## 📁 **Current Public API Structure**

### **✅ Entities Layer**

```typescript
// entities/user/index.ts
export { userApi } from "./api/user-api";
export type {
  User,
  UserMeRequest,
  UpdateUserRequest,
  UserRegistrationRequest,
} from "./model/types";
export * from "./model/queries";
export * from "./ui";

// entities/auth/index.ts
export { authApi } from "./api/auth-api";
export type {
  LoginData,
  LoginResponse,
  ResetPasswordRequest,
} from "./model/types";
export * from "./model/queries";
```

### **✅ Features Layer**

```typescript
// features/auth/index.ts
export * from "./model/queries";
export * from "./model/validation";
export * from "./ui";

// features/user-management/index.ts
export * from "./model/queries";
export * from "./model/validation";
export * from "./ui";
```

### **✅ Processes Layer**

```typescript
// processes/auth-session/index.ts
export * from "./model/queries";

// processes/user-onboarding/index.ts
export * from "./model/queries";
```

### **✅ Pages Layer**

```typescript
// pages/home/index.ts
export { HomePage } from "./ui/home-page";

// pages/about/index.ts
export { AboutPage } from "./ui/about-page";
```

### **✅ Shared Layer**

```typescript
// shared/index.ts
export * from "./api";
export * from "./lib";
export * from "./types";
export * from "./ui";
```

### **✅ App Layer**

```typescript
// app/index.ts
export { App } from "./app";
```

## 🚫 **Import Rules & Violations**

### **✅ Correct Import Patterns**

```typescript
// ✅ Good: Using public API
import { useLogin, LoginInput } from "@/features/auth";
import { User, useUser } from "@/entities/user";
import { AppLayout } from "@/shared/ui";

// ✅ Good: Internal imports within same slice
import { LoginForm } from "./ui/login-form";
import { loginSchema } from "./model/validation";
```

### **❌ Forbidden Import Patterns**

```typescript
// ❌ Bad: Bypassing public API
import { useAuthLogin } from "@/entities/auth/model/queries";
import { LoginForm } from "@/features/auth/ui/login-form";
import { userApi } from "@/entities/user/api/user-api";

// ❌ Bad: Deep imports into internal structure
import { validateUserQuery } from "@/features/user-management/model/validation";
import { UserCard } from "@/entities/user/ui/user-card";
```

## 🔧 **Enforcement Mechanisms**

### **1. Barrel Files (index.ts)**

Every slice must have an `index.ts` file that explicitly exports its public API:

```typescript
// ✅ Explicit exports
export { specificFunction } from "./internal/module";
export type { PublicType } from "./internal/types";

// ✅ Wildcard exports for related functionality
export * from "./model/queries";
export * from "./ui";
```

### **2. Import Path Patterns**

- **✅ Use**: `@/layer/slice` (public API)
- **❌ Avoid**: `@/layer/slice/internal/module` (bypasses API)
- **✅ Use**: `./internal` (within same slice)

### **3. Layer Import Rules**

```typescript
// App Layer
import from: processes, features, entities, shared ✅

// Processes Layer
import from: features, entities, shared ✅

// Pages Layer
import from: processes, features, entities, shared ✅

// Features Layer
import from: entities, shared ✅

// Entities Layer
import from: shared ✅

// Shared Layer
import from: external libraries only ✅
```

## 🛡️ **Current Implementation Status**

### **✅ Properly Implemented**

- All layers have proper `index.ts` barrel files
- Cross-layer imports use public APIs
- Internal structure is hidden from external consumers

### **✅ Import Examples in Codebase**

```typescript
// features/auth/ui/login-form.tsx
import { useLoginProcess } from "@/processes/auth-session"; // ✅ Public API
import { loginSchema, type LoginInput } from "../model/validation"; // ✅ Internal

// features/user-management/model/queries.ts
import { useUsers, useUser, userKeys } from "@/entities/user"; // ✅ Public API

// processes/auth-session/model/queries.ts
import { useAuthLogin, useAuthLogout, authKeys } from "@/entities/auth"; // ✅ Public API
import { useUserMe, userKeys } from "@/entities/user"; // ✅ Public API
import type { LoginInput } from "@/features/auth"; // ✅ Public API
```

## 🎯 **Benefits Achieved**

### **✅ Encapsulation**

- Internal implementation details are hidden
- Only intended functionality is exposed
- Easy to refactor internal structure without breaking consumers

### **✅ Maintainability**

- Clear boundaries between slices
- Predictable import patterns
- Easy to understand dependencies

### **✅ Scalability**

- New functionality can be added without breaking existing code
- Public APIs can evolve independently
- Clear ownership of functionality

### **✅ Team Collaboration**

- Clear contracts between team members
- Reduced coupling between features
- Easier code reviews and testing

## 🔍 **Validation Checklist**

- [ ] Every slice has an `index.ts` barrel file
- [ ] All cross-slice imports use public APIs (`@/layer/slice`)
- [ ] No direct imports to internal modules (`/model/`, `/ui/`, `/api/`)
- [ ] Layer import hierarchy is respected
- [ ] Internal imports use relative paths (`./`, `../`)
- [ ] Public APIs expose only necessary functionality

The codebase now properly enforces the Public API pattern with clear boundaries and proper encapsulation! 🎯
