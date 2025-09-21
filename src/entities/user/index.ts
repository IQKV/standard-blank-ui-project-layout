export { userApi } from "./api/user-api";
export type {
  User,
  UserMeRequest,
  UpdateUserRequest,
  UserRegistrationRequest,
  CreateUserRequest,
  UpdateUserData,
  UserFilters,
  BulkUserOperation,
  BulkUserUpdate,
} from "./model/types";
export * from "./model/queries";
export * from "./ui";

// Re-export IdParam for convenience
export type { IdParam } from "@/shared/types";
