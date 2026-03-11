import type { User } from "../model/types";
import { UserCard } from "./user-card";

interface UserListProps {
  users: User[];
  _className?: string;
  onUserClick?: (user: User) => void;
}

// Entity-level UI component - pure data display, no business logic
export function UserList({ users, _className = "", onUserClick }: UserListProps) {
  if (users.length === 0) {
    return (
      <section>
        <p>No users found</p>
      </section>
    );
  }

  return (
    <section>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {onUserClick ? (
              <button onClick={() => onUserClick(user)} type="button">
                <UserCard user={user} />
              </button>
            ) : (
              <UserCard user={user} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
