import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "./users/ui/users-page";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});