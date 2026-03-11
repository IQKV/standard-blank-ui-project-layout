import type { User } from "../model/types";

interface UserCardProps {
  user: User;
  _className?: string;
}

// Entity-level UI component - pure data display, no business logic
export function UserCard({ user, _className = "" }: UserCardProps) {
  return (
    <article>
      <header>
        <h3>{user.full_name}</h3>
        <p>{user.email}</p>
      </header>

      <div>
        {user.role && <span data-role={user.role.toLowerCase()}>{user.role}</span>}
        {user.status && <span data-status={user.status.toLowerCase()}>{user.status}</span>}
      </div>

      {user.last_login_at && (
        <footer>
          <p>Last login: {new Date(user.last_login_at).toLocaleDateString()}</p>
        </footer>
      )}
    </article>
  );
}
