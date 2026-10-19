// v2: the redesign made light the default. The old key held "dark" for every past
// visitor (it was saved on load, not on choice), so it is left behind on purpose.
/** Must match `ThemeProvider` / `theme-provider.tsx`. */
export const THEME_STORAGE_KEY = "nexus-ui-theme-v2";

/** The theme actually applied to the page. */
export type AppTheme = "light" | "dark";
/** What the visitor picked: a fixed theme, or follow the system. */
export type ThemePreference = AppTheme | "system";

export const DEFAULT_THEME: ThemePreference = "light";

export function coerceTheme(v: string | null | undefined): ThemePreference {
  if (v === "light" || v === "dark" || v === "system") return v;
  return DEFAULT_THEME;
}

export function systemTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(pref: ThemePreference): AppTheme {
  return pref === "system" ? systemTheme() : pref;
}

export function applyThemeToDom(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

/**
 * Blocking snippet for <head> — runs before paint so `html` matches the saved choice
 * (avoids FOUC without a <script> inside a client React tree; React 19 warns on that).
 */
export const THEME_INIT_SCRIPT = `!function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=document.documentElement;var t=localStorage.getItem(k)||${JSON.stringify(DEFAULT_THEME)};if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if(t!=="light"&&t!=="dark")t="light";d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t}catch(e){}}();`;
