import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "./profile/ui/profile-page";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});