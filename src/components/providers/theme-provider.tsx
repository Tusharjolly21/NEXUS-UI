"use client";

import * as React from "react";
import {
  THEME_STORAGE_KEY,
  type AppTheme,
  type ThemePreference,
  applyThemeToDom,
  coerceTheme,
  DEFAULT_THEME,
} from "@/lib/theme";

export type ThemeContextValue = {
  /** What the visitor picked: light, dark or system. */
  theme: ThemePreference;
  /** The theme actually applied. */
  resolvedTheme: AppTheme;
  /** Accepts theme name strings (next-themes compatible). */
  setTheme: (theme: ThemePreference | string | ((prev: string) => string)) => void;
  themes: string[];
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToSystem(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useSystemTheme(): AppTheme {
  return React.useSyncExternalStore(
    subscribeToSystem,
    () => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light"),
    () => "light",
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemePreference>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    try {
      return coerceTheme(localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      return DEFAULT_THEME;
    }
  });
  const system = useSystemTheme();
  const resolvedTheme: AppTheme = theme === "system" ? system : theme;

  React.useEffect(() => {
    applyThemeToDom(resolvedTheme);
  }, [resolvedTheme]);

  // Only an explicit choice is remembered, so the default can change later.
  const setTheme = React.useCallback((next: ThemePreference | string | ((prev: string) => string)) => {
    setThemeState((prev) => {
      const raw = typeof next === "function" ? (next as (p: string) => string)(prev) : next;
      if (raw !== "light" && raw !== "dark" && raw !== "system") return prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, raw);
      } catch {
        // private mode, etc.
      }
      return raw;
    });
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, themes: ["light", "system", "dark"] }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Drop-in subset of `next-themes` `useTheme` for this app. */
export function useTheme(): {
  theme?: string;
  resolvedTheme?: string;
  setTheme: (t: string | ((prev: string) => string)) => void;
  themes: string[];
  systemTheme?: undefined;
} {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: undefined,
      resolvedTheme: undefined,
      setTheme: () => {},
      themes: [],
      systemTheme: undefined,
    };
  }
  return {
    theme: ctx.theme,
    resolvedTheme: ctx.resolvedTheme,
    setTheme: ctx.setTheme,
    themes: ctx.themes,
    systemTheme: undefined,
  };
}
