import { createStore } from "@/shared/lib/store";
import { persist } from "@/shared/lib/store-persistence";

export interface AppSettingsState {
  // Localization
  locale: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";

  // User preferences
  preferences: {
    // UI preferences
    compactMode: boolean;
    showAnimations: boolean;
    autoSave: boolean;
    autoSaveInterval: number; // in seconds

    // Accessibility
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: "small" | "medium" | "large";

    // Notifications
    enableNotifications: boolean;
    notificationSound: boolean;
    emailNotifications: boolean;

    // Data preferences
    itemsPerPage: number;
    defaultSortOrder: "asc" | "desc";
  };

  // Feature flags
  featureFlags: {
    [key: string]: boolean;
  };

  // App metadata
  version: string;
  buildNumber: string;
  environment: "development" | "staging" | "production";

  // Persistence state
  isLoaded: boolean;
  lastSaved: number | null;
}

interface AppSettingsActions {
  // Locale management
  setLocale: (locale: string) => void;
  setTimezone: (timezone: string) => void;
  setDateFormat: (format: string) => void;
  setTimeFormat: (format: "12h" | "24h") => void;

  // Preferences management
  updatePreferences: (
    preferences: Partial<AppSettingsState["preferences"]>
  ) => void;
  resetPreferences: () => void;

  // Feature flags
  setFeatureFlag: (flag: string, enabled: boolean) => void;
  toggleFeatureFlag: (flag: string) => void;

  // Persistence
  loadSettings: (settings: Partial<AppSettingsState>) => void;
  markAsLoaded: () => void;
  updateLastSaved: () => void;

  // Bulk operations
  resetAllSettings: () => void;
  exportSettings: () => Partial<AppSettingsState>;
  importSettings: (settings: Partial<AppSettingsState>) => void;
}

const defaultPreferences: AppSettingsState["preferences"] = {
  compactMode: false,
  showAnimations: true,
  autoSave: true,
  autoSaveInterval: 30,
  highContrast: false,
  reducedMotion: false,
  fontSize: "medium",
  enableNotifications: true,
  notificationSound: true,
  emailNotifications: true,
  itemsPerPage: 20,
  defaultSortOrder: "asc",
};

const initialState: AppSettingsState = {
  locale: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: "MM/dd/yyyy",
  timeFormat: "12h",
  preferences: defaultPreferences,
  featureFlags: {},
  version: "1.0.0",
  buildNumber: "1",
  environment: "development",
  isLoaded: false,
  lastSaved: null,
};

export const useAppSettingsStore = createStore<
  AppSettingsState & AppSettingsActions
>(
  "app-settings-store",
  persist(
    (set: any, get: any) => ({
      ...initialState,

      // Locale management
      setLocale: (locale: string) =>
        set((state: any) => {
          state.locale = locale;
          state.lastSaved = Date.now();
        }),

      setTimezone: (timezone: string) =>
        set((state: any) => {
          state.timezone = timezone;
          state.lastSaved = Date.now();
        }),

      setDateFormat: (format: string) =>
        set((state: any) => {
          state.dateFormat = format;
          state.lastSaved = Date.now();
        }),

      setTimeFormat: (format: "12h" | "24h") =>
        set((state: any) => {
          state.timeFormat = format;
          state.lastSaved = Date.now();
        }),

      // Preferences management
      updatePreferences: (
        preferences: Partial<AppSettingsState["preferences"]>
      ) =>
        set((state: any) => {
          state.preferences = { ...state.preferences, ...preferences };
          state.lastSaved = Date.now();
        }),

      resetPreferences: () =>
        set((state: any) => {
          state.preferences = { ...defaultPreferences };
          state.lastSaved = Date.now();
        }),

      // Feature flags
      setFeatureFlag: (flag: string, enabled: boolean) =>
        set((state: any) => {
          state.featureFlags[flag] = enabled;
          state.lastSaved = Date.now();
        }),

      toggleFeatureFlag: (flag: string) =>
        set((state: any) => {
          state.featureFlags[flag] = !state.featureFlags[flag];
          state.lastSaved = Date.now();
        }),

      // Persistence
      loadSettings: (settings: Partial<AppSettingsState>) =>
        set((state: any) => {
          Object.assign(state, settings);
          state.isLoaded = true;
        }),

      markAsLoaded: () =>
        set((state: any) => {
          state.isLoaded = true;
        }),

      updateLastSaved: () =>
        set((state: any) => {
          state.lastSaved = Date.now();
        }),

      // Bulk operations
      resetAllSettings: () =>
        set((state: any) => {
          Object.assign(state, {
            ...initialState,
            isLoaded: true,
            lastSaved: Date.now(),
          });
        }),

      exportSettings: () => {
        const state = get();
        return {
          locale: state.locale,
          timezone: state.timezone,
          dateFormat: state.dateFormat,
          timeFormat: state.timeFormat,
          preferences: state.preferences,
          featureFlags: state.featureFlags,
        };
      },

      importSettings: (settings: Partial<AppSettingsState>) =>
        set((state: any) => {
          if (settings.locale) state.locale = settings.locale;
          if (settings.timezone) state.timezone = settings.timezone;
          if (settings.dateFormat) state.dateFormat = settings.dateFormat;
          if (settings.timeFormat) state.timeFormat = settings.timeFormat;
          if (settings.preferences) {
            state.preferences = {
              ...state.preferences,
              ...settings.preferences,
            };
          }
          if (settings.featureFlags) {
            state.featureFlags = {
              ...state.featureFlags,
              ...settings.featureFlags,
            };
          }
          state.lastSaved = Date.now();
        }),
    }),
    {
      name: "app-settings",
      partialize: (state) => ({
        // Persist user settings but not app metadata
        locale: state.locale,
        timezone: state.timezone,
        dateFormat: state.dateFormat,
        timeFormat: state.timeFormat,
        preferences: state.preferences,
        featureFlags: state.featureFlags,
      }),
      version: 1,
    }
  )
);

// Selectors for optimized subscriptions
export const useLocaleSettings = () =>
  useAppSettingsStore((state) => ({
    locale: state.locale,
    timezone: state.timezone,
    dateFormat: state.dateFormat,
    timeFormat: state.timeFormat,
    setLocale: state.setLocale,
    setTimezone: state.setTimezone,
    setDateFormat: state.setDateFormat,
    setTimeFormat: state.setTimeFormat,
  }));

export const useUserPreferences = () =>
  useAppSettingsStore((state) => ({
    preferences: state.preferences,
    update: state.updatePreferences,
    reset: state.resetPreferences,
  }));

export const useFeatureFlags = () =>
  useAppSettingsStore((state) => ({
    flags: state.featureFlags,
    isEnabled: (flag: string) => state.featureFlags[flag] ?? false,
    set: state.setFeatureFlag,
    toggle: state.toggleFeatureFlag,
  }));

export const useAppMetadata = () =>
  useAppSettingsStore((state) => ({
    version: state.version,
    buildNumber: state.buildNumber,
    environment: state.environment,
    isLoaded: state.isLoaded,
    lastSaved: state.lastSaved,
  }));
