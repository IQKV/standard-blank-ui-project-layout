// Re-export the enhanced integration hooks as the main process interface
// This maintains backward compatibility while providing Zustand integration

export {
  useAuthIntegration as useAuthSession,
  useAuthEffects,
} from "./auth-integration";
