import { UserSummary } from "@/widgets/user-summary";
import { useAuthIntegration } from "@/processes/auth-session";

export function HomePage() {
  const { isAuthenticated, user } = useAuthIntegration();

  return (
    <div>
      <header>
        <h1>Welcome to the Application</h1>
        {isAuthenticated && user && (
          <p>Hello, {user.first_name}! Welcome back.</p>
        )}
      </header>

      <main>
        {isAuthenticated ? (
          <section>
            <h2>Dashboard</h2>
            <UserSummary />
          </section>
        ) : (
          <section>
            <h2>Get Started</h2>
            <p>Please log in to access your dashboard.</p>
            <nav>
              <ul>
                <li><a href="/auth/login">Sign In</a></li>
                <li><a href="/auth/register">Create Account</a></li>
              </ul>
            </nav>
          </section>
        )}
      </main>
    </div>
  );
}