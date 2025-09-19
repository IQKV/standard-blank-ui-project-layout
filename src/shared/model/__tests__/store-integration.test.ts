import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../ui-store";
import { useAppSettingsStore } from "../app-settings-store";

describe("Store Integration", () => {
  beforeEach(() => {
    // Reset stores before each test
    useUIStore.getState().clearNotifications();
    useUIStore.getState().closeAllModals();
    useUIStore.getState().clearGlobalLoading();
  });

  describe("UI Store Integration", () => {
    it("should handle theme changes correctly", () => {
      const { setTheme } = useUIStore.getState();

      setTheme("dark");
      expect(useUIStore.getState().theme).toBe("dark");

      setTheme("light");
      expect(useUIStore.getState().theme).toBe("light");

      setTheme("system");
      expect(useUIStore.getState().theme).toBe("system");
    });

    it("should manage complex notification workflows", () => {
      const store = useUIStore.getState();

      // Add multiple notifications
      store.addNotification({
        type: "success",
        title: "Success 1",
        message: "First success message",
      });

      store.addNotification({
        type: "error",
        title: "Error 1",
        message: "First error message",
      });

      store.addNotification({
        type: "warning",
        title: "Warning 1",
      });

      const notifications = useUIStore.getState().notifications;
      expect(notifications).toHaveLength(3);

      // Remove specific notification
      const errorNotification = notifications.find((n) => n.type === "error");
      expect(errorNotification).toBeDefined();

      if (errorNotification) {
        store.removeNotification(errorNotification.id);
      }

      expect(useUIStore.getState().notifications).toHaveLength(2);
      expect(
        useUIStore.getState().notifications.every((n) => n.type !== "error")
      ).toBe(true);
    });

    it("should handle modal state management", () => {
      const store = useUIStore.getState();

      // Open multiple modals with different data
      store.openModal("user-profile", { userId: 123, tab: "settings" });
      store.openModal("confirmation", { action: "delete", itemId: 456 });

      const modals = useUIStore.getState().modals;

      expect(modals["user-profile"]).toEqual({
        isOpen: true,
        data: { userId: 123, tab: "settings" },
      });

      expect(modals["confirmation"]).toEqual({
        isOpen: true,
        data: { action: "delete", itemId: 456 },
      });

      // Close specific modal
      store.closeModal("user-profile");

      expect(useUIStore.getState().modals["user-profile"]).toEqual({
        isOpen: false,
      });

      expect(useUIStore.getState().modals["confirmation"]).toEqual({
        isOpen: true,
        data: { action: "delete", itemId: 456 },
      });
    });
  });

  describe("App Settings Store Integration", () => {
    it("should handle locale and preferences updates", () => {
      const store = useAppSettingsStore.getState();

      // Update locale
      store.setLocale("es");
      expect(useAppSettingsStore.getState().locale).toBe("es");

      // Update preferences
      store.updatePreferences({
        compactMode: true,
        showAnimations: false,
        itemsPerPage: 50,
      });

      const preferences = useAppSettingsStore.getState().preferences;
      expect(preferences.compactMode).toBe(true);
      expect(preferences.showAnimations).toBe(false);
      expect(preferences.itemsPerPage).toBe(50);

      // Other preferences should remain unchanged
      expect(preferences.enableNotifications).toBe(true); // default value
    });

    it("should manage feature flags correctly", () => {
      const store = useAppSettingsStore.getState();

      // Set feature flags
      store.setFeatureFlag("newDashboard", true);
      store.setFeatureFlag("betaFeatures", false);

      const flags = useAppSettingsStore.getState().featureFlags;
      expect(flags.newDashboard).toBe(true);
      expect(flags.betaFeatures).toBe(false);

      // Toggle feature flag
      store.toggleFeatureFlag("betaFeatures");
      expect(useAppSettingsStore.getState().featureFlags.betaFeatures).toBe(
        true
      );
    });
  });

  describe("Cross-Store Integration", () => {
    it("should work with multiple stores simultaneously", () => {
      const uiStore = useUIStore.getState();
      const settingsStore = useAppSettingsStore.getState();

      // Set up initial state
      uiStore.setTheme("dark");
      settingsStore.setLocale("fr");
      settingsStore.updatePreferences({ compactMode: true });

      // Add notification about settings change
      uiStore.addNotification({
        type: "info",
        title: "Settings Updated",
        message: "Your preferences have been saved",
      });

      // Verify states
      expect(useUIStore.getState().theme).toBe("dark");
      expect(useUIStore.getState().notifications).toHaveLength(1);
      expect(useAppSettingsStore.getState().locale).toBe("fr");
      expect(useAppSettingsStore.getState().preferences.compactMode).toBe(true);

      // Simulate loading state during settings save
      uiStore.setGlobalLoading("saving-settings", true);
      expect(useUIStore.getState().globalLoading["saving-settings"]).toBe(true);

      // Complete the save
      uiStore.setGlobalLoading("saving-settings", false);
      expect(
        useUIStore.getState().globalLoading["saving-settings"]
      ).toBeUndefined();
    });
  });
});
