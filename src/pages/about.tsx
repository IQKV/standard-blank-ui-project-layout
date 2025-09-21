import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "./about/ui/about-page";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
