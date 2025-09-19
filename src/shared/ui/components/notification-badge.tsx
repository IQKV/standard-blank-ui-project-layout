import { useUIStore, createMemoizedSelector } from "@/shared";

// Create a memoized selector for notification count
const selectNotificationCount = createMemoizedSelector(
  (state: ReturnType<typeof useUIStore.getState>) => state.notifications.length
);

// Create a memoized selector for unread notifications
const selectUnreadNotifications = createMemoizedSelector(
  (state: ReturnType<typeof useUIStore.getState>) =>
    state.notifications.filter(
      (n) => n.type === "error" || n.type === "warning"
    )
);

export function NotificationBadge() {
  const notificationCount = useUIStore(selectNotificationCount);
  const unreadNotifications = useUIStore(selectUnreadNotifications);

  if (notificationCount === 0) {
    return null;
  }

  const hasUrgent = unreadNotifications.length > 0;

  return (
    <div className="relative">
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
        <span className="text-lg">🔔</span>
      </button>

      {notificationCount > 0 && (
        <span
          className={`
            absolute -top-1 -right-1 min-w-5 h-5 rounded-full text-xs font-medium
            flex items-center justify-center text-white
            ${hasUrgent ? "bg-red-500" : "bg-blue-500"}
          `}
        >
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      )}
    </div>
  );
}
