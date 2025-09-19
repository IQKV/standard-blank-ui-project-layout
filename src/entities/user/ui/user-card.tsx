import type { User } from "../model/types";

interface UserCardProps {
  user: User;
  className?: string;
}

// Entity-level UI component - pure data display, no business logic
export function UserCard({ user, className = "" }: UserCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium">{user.full_name}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.role && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {user.role}
            </span>
          )}
          {user.status && (
            <span
              className={`inline-block px-2 py-1 text-xs rounded ml-2 ${
                user.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.status}
            </span>
          )}
        </div>
      </div>
      {user.last_login_at && (
        <p className="text-sm text-gray-500 mt-2">
          Last login: {new Date(user.last_login_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
