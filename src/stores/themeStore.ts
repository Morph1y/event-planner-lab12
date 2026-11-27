import { createStore } from "zustand/vanilla";

export type ThemePreference = "system" | "light" | "dark";
export const THEME_STORAGE_KEY = "vykhid.theme.v1";

interface ThemeStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

interface ThemeState {
  preference: ThemePreference;
  systemDark: boolean;
  setPreference: (preference: ThemePreference) => boolean;
  setSystemDark: (dark: boolean) => void;
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean) {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}

export function createThemeStore(storage: ThemeStorage, systemDark: boolean) {
  let preference: ThemePreference = "system";
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {
    preference = "system";
  }
  return createStore<ThemeState>()((set) => ({
    preference,
    systemDark,
    setPreference: (next) => {
      let persisted = true;
      try {
        storage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        persisted = false;
      }
      set({ preference: next });
      return persisted;
    },
    setSystemDark: (dark) => set({ systemDark: dark }),
  }));
}
