import {
  PREVIOUS_URL_KEY,
  DEFAULT_FALLBACK_PATH,
  LOGIN_PATH,
} from "./constants";

/**
 * Restore previous URL after successful login and clear the stored key.
 * Returns true if a redirect was performed.
 */
export const restorePreviousUrlAfterLogin = (
  fallbackPath: string = DEFAULT_FALLBACK_PATH
): boolean => {
  try {
    const prev = window?.localStorage?.getItem(PREVIOUS_URL_KEY);
    // Always clear the key to avoid loops
    try {
      window?.localStorage?.removeItem(PREVIOUS_URL_KEY);
    } catch {}

    const currentHref = window?.location?.href || "";

    // If we have a valid previous URL and it's not the login page, go there
    if (prev && typeof prev === "string" && !prev.includes(LOGIN_PATH)) {
      if (prev !== currentHref) {
        try {
          window?.location?.replace(prev);
          return true;
        } catch {}
      }
    }

    // Otherwise navigate to fallback
    if (fallbackPath) {
      try {
        window?.location?.replace(fallbackPath);
        return true;
      } catch {}
    }

    return false;
  } catch {
    return false;
  }
};

export const __testonly = { PREVIOUS_URL_KEY, LOGIN_PATH };
