import { useUIStore, createMemoizedSelector } from "@/shared";

// Create a memoized selector for notification count
const selectNotificationCount = createMemoizedSelector(
  (state: ReturnType<typeof useUIStore.getState>) => state.notifications.length,
);

// Create a memoized selector for unread notifications
const selectUnreadNotifications = createMemoizedSelector(
  (state: ReturnType<typeof useUIStore.getState>) =>
    state.notifications.filter((n) => n.type === "error" || n.type === "warning"),
);

export function NotificationBadge() {
  const notificationCount = useUIStore(selectNotificationCount);
  const unreadNotifications = useUIStore(selectUnreadNotifications);

  if (notificationCount === 0) {
    return null;
  }

  const hasUrgent = unreadNotifications.length > 0;

  return (
    <div>
      <button aria-label={`${notificationCount} notifications`}>
        <span>🔔</span>
      </button>

      {notificationCount > 0 && (
        <span
          data-urgent={hasUrgent}
          aria-label={`${notificationCount} notifications${hasUrgent ? ", some urgent" : ""}`}
        >
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      )}
    </div>
  );
}
