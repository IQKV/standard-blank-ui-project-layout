import { useCurrentUser } from "@/entities/auth";
import { useUser } from "@/entities/user";
import { useNotifications } from "@/shared";

export const UserSummary = () => {
  const me = useCurrentUser();
  const { add } = useNotifications();
  const { data: userData } = useUser(me?.id || "");
  const user = userData?.data;

  if (!me) return null;

  return (
    <div>
      <h3>User Summary</h3>
      <div>
        Name: {user?.first_name} {user?.last_name}
      </div>
      <div>Email: {user?.email}</div>
      <button
        onClick={() =>
          add({ type: "info", title: "User", message: `${user?.first_name}` })
        }
      >
        Notify
      </button>
    </div>
  );
};
