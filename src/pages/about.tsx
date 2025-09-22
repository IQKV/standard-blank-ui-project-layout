import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <header>
        <h1>About This Application</h1>
      </header>

      <main>
        <section>
          <h2>Technology Stack</h2>
          <ul>
            <li>
              <strong>Frontend</strong>: React with TypeScript
            </li>
            <li>
              <strong>Routing</strong>: Tanstack Router
            </li>
            <li>
              <strong>State Management</strong>: Tanstack Query + Zustand
            </li>
            <li>
              <strong>Architecture</strong>: Feature-Sliced Design (FSD)
            </li>
            <li>
              <strong>Styling</strong>: Semantic HTML with minimal CSS
            </li>
            <li>
              <strong>Build Tool</strong>: Vite
            </li>
          </ul>
        </section>

        <section>
          <h2>Architecture</h2>
          <p>
            This application follows Feature-Sliced Design methodology for
            scalable frontend architecture with proper separation of concerns
            across layers:
          </p>
          <ul>
            <li>
              <strong>App Layer</strong>: Application initialization and global
              providers
            </li>
            <li>
              <strong>Processes Layer</strong>: Complex business processes
              spanning multiple features
            </li>
            <li>
              <strong>Pages Layer</strong>: Route components and page-level
              logic
            </li>
            <li>
              <strong>Widgets Layer</strong>: Composite UI blocks combining
              features
            </li>
            <li>
              <strong>Features Layer</strong>: User-facing functionality and
              business logic
            </li>
            <li>
              <strong>Entities Layer</strong>: Business entities and domain
              logic
            </li>
            <li>
              <strong>Shared Layer</strong>: Reusable utilities, UI components,
              and configurations
            </li>
          </ul>
        </section>

        <section>
          <h2>Accessibility</h2>
          <p>
            This application prioritizes accessibility with semantic HTML,
            proper ARIA roles, keyboard navigation support, and screen reader
            compatibility.
          </p>
        </section>
      </main>
    </div>
  );
}
