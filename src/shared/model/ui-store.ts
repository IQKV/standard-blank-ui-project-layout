// ts-ignore
import { createStore } from "@/shared/lib/store";

export interface UIState {
  // Theme management
  theme: "light" | "dark" | "system";

  // Layout state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modal management
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: unknown;
    };
  };

  // Notification system
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    duration?: number;
    timestamp: number;
  }>;

  // Loading states for global operations
  globalLoading: {
    [key: string]: boolean;
  };
}

interface UIActions {
  // Theme actions
  setTheme: (theme: UIState["theme"]) => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modal actions
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;

  // Notification actions
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Global loading actions
  setGlobalLoading: (key: string, loading: boolean) => void;
  clearGlobalLoading: () => void;
}

const initialState: UIState = {
  theme: "system",
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {},
  notifications: [],
  globalLoading: {},
};


export const useUIStore = createStore<UIState & UIActions>(
  "ui-store",
  (set: any) => ({
    ...initialState,

    // Theme actions
    setTheme: (theme: UIState["theme"]) =>
      set((state: any) => {
        state.theme = theme;
      }),

    // Sidebar actions
    toggleSidebar: () =>
      set((state: any) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

    setSidebarOpen: (open: boolean) =>
      set((state: any) => {
        state.sidebarOpen = open;
      }),

    toggleSidebarCollapsed: () =>
      set((state: any) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),

    setSidebarCollapsed: (collapsed: boolean) =>
      set((state: any) => {
        state.sidebarCollapsed = collapsed;
      }),

    // Modal actions
    openModal: (modalId: string, data?: unknown) =>
      set((state: any) => {
        state.modals[modalId] = {
          isOpen: true,
          data,
        };
      }),

    closeModal: (modalId: string) =>
      set((state: any) => {
        if (state.modals[modalId]) {
          state.modals[modalId].isOpen = false;
          delete state.modals[modalId].data;
        }
      }),

    closeAllModals: () =>
      set((state: any) => {
        state.modals = {};
      }),

    // Notification actions
    addNotification: (
      notification: Omit<UIState["notifications"][0], "id" | "timestamp">
    ) =>
      set((state: any) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        state.notifications.push({
          ...notification,
          id,
          timestamp: Date.now(),
        });
      }),

    removeNotification: (id: string) =>
      set((state: any) => {
        state.notifications = state.notifications.filter((n: any) => n.id !== id);
      }),

    clearNotifications: () =>
      set((state: any) => {
        state.notifications = [];
      }),

    // Global loading actions
    setGlobalLoading: (key: string, loading: boolean) =>
      set((state: any) => {
        if (loading) {
          state.globalLoading[key] = true;
        } else {
          delete state.globalLoading[key];
        }
      }),

    clearGlobalLoading: () =>
      set((state: any) => {
        state.globalLoading = {};
      }),
  })
);

// Selectors for optimized subscriptions
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebar = () =>
  useUIStore((state) => ({
    isOpen: state.sidebarOpen,
    isCollapsed: state.sidebarCollapsed,
    toggle: state.toggleSidebar,
    setOpen: state.setSidebarOpen,
    toggleCollapsed: state.toggleSidebarCollapsed,
    setCollapsed: state.setSidebarCollapsed,
  }));

export const useModal = (modalId: string) =>
  useUIStore((state) => ({
    isOpen: state.modals[modalId]?.isOpen ?? false,
    data: state.modals[modalId]?.data,
    open: (data?: unknown) => state.openModal(modalId, data),
    close: () => state.closeModal(modalId),
  }));

export const useNotifications = () =>
  useUIStore((state) => ({
    notifications: state.notifications,
    add: state.addNotification,
    remove: state.removeNotification,
    clear: state.clearNotifications,
  }));

export const useGlobalLoading = (key?: string) =>
  useUIStore((state) => {
    if (key) {
      return {
        isLoading: state.globalLoading[key] ?? false,
        setLoading: (loading: boolean) => state.setGlobalLoading(key, loading),
      };
    }
    return {
      hasAnyLoading: Object.keys(state.globalLoading).length > 0,
      loadingKeys: Object.keys(state.globalLoading),
      clear: state.clearGlobalLoading,
    };
  });
