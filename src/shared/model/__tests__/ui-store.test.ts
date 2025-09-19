import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/shared";

describe("UI Store", () => {
  describe("Theme Management", () => {
    it("should set theme correctly", () => {
      const store = useUIStore.getState();

      store.setTheme("dark");

      expect(useUIStore.getState().theme).toBe("dark");
    });
  });

  describe("Notification Management", () => {
    beforeEach(() => {
      // Clear notifications before each test
      useUIStore.getState().clearNotifications();
    });

    it("should add notification", () => {
      const store = useUIStore.getState();

      store.addNotification({
        type: "success",
        title: "Test Notification",
        message: "This is a test",
      });

      const notifications = useUIStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        type: "success",
        title: "Test Notification",
        message: "This is a test",
      });
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].timestamp).toBeDefined();
    });

    it("should remove notification", () => {
      const store = useUIStore.getState();

      store.addNotification({
        type: "info",
        title: "Test",
      });

      const notificationId = useUIStore.getState().notifications[0].id;
      expect(useUIStore.getState().notifications).toHaveLength(1);

      store.removeNotification(notificationId);
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it("should clear all notifications", () => {
      const store = useUIStore.getState();

      store.addNotification({ type: "success", title: "Test 1" });
      store.addNotification({ type: "error", title: "Test 2" });

      expect(useUIStore.getState().notifications).toHaveLength(2);

      store.clearNotifications();
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });
  });

  describe("Modal Management", () => {
    beforeEach(() => {
      // Clear modals before each test
      useUIStore.getState().closeAllModals();
    });

    it("should open and close modal", () => {
      const store = useUIStore.getState();

      store.openModal("test-modal", { userId: 123 });

      expect(useUIStore.getState().modals["test-modal"]).toEqual({
        isOpen: true,
        data: { userId: 123 },
      });

      store.closeModal("test-modal");

      expect(useUIStore.getState().modals["test-modal"]).toEqual({
        isOpen: false,
      });
    });

    it("should close all modals", () => {
      const store = useUIStore.getState();

      store.openModal("modal1");
      store.openModal("modal2");

      expect(Object.keys(useUIStore.getState().modals)).toHaveLength(2);

      store.closeAllModals();
      expect(useUIStore.getState().modals).toEqual({});
    });
  });

  describe("Global Loading", () => {
    beforeEach(() => {
      // Clear loading states before each test
      useUIStore.getState().clearGlobalLoading();
    });

    it("should manage loading states", () => {
      const store = useUIStore.getState();

      store.setGlobalLoading("api-call", true);
      expect(useUIStore.getState().globalLoading["api-call"]).toBe(true);

      store.setGlobalLoading("api-call", false);
      expect(useUIStore.getState().globalLoading["api-call"]).toBeUndefined();
    });

    it("should clear all loading states", () => {
      const store = useUIStore.getState();

      store.setGlobalLoading("call1", true);
      store.setGlobalLoading("call2", true);

      expect(Object.keys(useUIStore.getState().globalLoading)).toHaveLength(2);

      store.clearGlobalLoading();
      expect(useUIStore.getState().globalLoading).toEqual({});
    });
  });
});
