import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./auth/ui/login-page";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});