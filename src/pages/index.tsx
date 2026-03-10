import { createFileRoute } from "@tanstack/react-router";
import { UserSummary } from "@/widgets/user-summary";
import { useAuthIntegration } from "@/processes/auth-session";
import { Link } from "@tanstack/react-router";
import "./index/ui/index.css";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated, user } = useAuthIntegration();

  return (
    <div className="home-page">
      <div className="container">
        <header className="hero-section">
          <h1 className="hero-title">🚀 React 19 Starter Template</h1>
          <p className="hero-description">
            Modern, type-safe, and production-ready React application with Feature-Sliced Design
            architecture
          </p>
          {isAuthenticated && user && (
            <div className="welcome-message" role="alert">
              <p>👋 Hello, {user.first_name}! Welcome back.</p>
            </div>
          )}
        </header>

        <main>
          {isAuthenticated ? (
            <section className="dashboard-section">
              <h2>📊 Your Dashboard</h2>
              <UserSummary />
            </section>
          ) : (
            <section className="getting-started-section">
              <div className="features-grid">
                <article className="feature-card">
                  <h3>⚡ What's Included</h3>
                  <ul className="feature-list">
                    <li>✅ React 19 with latest features</li>
                    <li>✅ TypeScript for type safety</li>
                    <li>✅ TanStack Router & Query</li>
                    <li>✅ Feature-Sliced Design</li>
                    <li>✅ Vite for fast development</li>
                    <li>✅ Complete testing setup</li>
                  </ul>
                </article>

                <article className="action-card">
                  <h3>🎯 Get Started</h3>
                  <nav className="auth-nav">
                    <Link to="/auth/login" className="btn btn-primary">
                      Sign In
                    </Link>
                    <Link to="/auth/register" className="btn btn-secondary">
                      Create Account
                    </Link>
                  </nav>
                </article>
              </div>

              <article className="architecture-overview">
                <h3>🏗️ Architecture Overview</h3>
                <div className="architecture-grid">
                  <div className="architecture-item">
                    <div className="architecture-icon" aria-hidden="true">
                      📱
                    </div>
                    <h4>Pages</h4>
                    <p>Route components and page composition</p>
                  </div>
                  <div className="architecture-item">
                    <div className="architecture-icon" aria-hidden="true">
                      ⚙️
                    </div>
                    <h4>Features</h4>
                    <p>Business logic and feature UI</p>
                  </div>
                  <div className="architecture-item">
                    <div className="architecture-icon" aria-hidden="true">
                      🧩
                    </div>
                    <h4>Shared</h4>
                    <p>Reusable utilities and components</p>
                  </div>
                </div>
              </article>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
