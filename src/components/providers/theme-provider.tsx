"use client";

import * as React from "react";
import {
  THEME_STORAGE_KEY,
  type AppTheme,
  applyThemeToDom,
  coerceTheme,
} from "@/lib/theme";

export type ThemeContextValue = {
  theme: AppTheme;
  resolvedTheme: AppTheme;
  /** Accepts theme name strings (next-themes compatible). */
  setTheme: (theme: AppTheme | string | ((prev: string) => string)) => void;
  themes: string[];
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<AppTheme>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      return coerceTheme(localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      return "dark";
    }
  });

  React.useEffect(() => {
    applyThemeToDom(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // private mode, etc.
    }
  }, [theme]);

  const setTheme = React.useCallback((next: AppTheme | string | ((prev: string) => string)) => {
    setThemeState((prev) => {
      const raw = typeof next === "function" ? (next as (p: string) => string)(prev) : next;
      if (raw === "system") return prev;
      if (raw === "light" || raw === "dark") return raw;
      return prev;
    });
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
      themes: ["light", "dark"],
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Drop-in subset of `next-themes` `useTheme` for this app (no system theme). */
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
