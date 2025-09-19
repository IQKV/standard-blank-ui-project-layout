import type { User } from "../model/types";
import { UserCard } from "./user-card";

interface UserListProps {
  users: User[];
  className?: string;
  onUserClick?: (user: User) => void;
}

// Entity-level UI component - pure data display, no business logic
export function UserList({
  users,
  className = "",
  onUserClick,
}: UserListProps) {
  if (users.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No users found
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserClick?.(user)}
          className={onUserClick ? "cursor-pointer hover:bg-gray-50" : ""}
        >
          <UserCard user={user} />
        </div>
      ))}
    </div>
  );
}
