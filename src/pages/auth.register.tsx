import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "./auth/ui/register-page";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});