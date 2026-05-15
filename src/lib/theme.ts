/** Must match `ThemeProvider` / `theme-provider.tsx`. */
export const THEME_STORAGE_KEY = "nexus-ui-theme";

export type AppTheme = "light" | "dark";

const DEFAULT_THEME: AppTheme = "dark";

export function coerceTheme(v: string | null | undefined): AppTheme {
  if (v === "light" || v === "dark") return v;
  return DEFAULT_THEME;
}

export function applyThemeToDom(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
}

/**
 * Blocking snippet for <head> — runs before paint so `html` matches localStorage
 * (avoids FOUC without a <script> inside a client React tree; React 19 warns on that).
 */
export const THEME_INIT_SCRIPT = `!function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=document.documentElement;var t=localStorage.getItem(k)||${JSON.stringify(DEFAULT_THEME)};if(t!=="light"&&t!=="dark")t=${JSON.stringify(DEFAULT_THEME)};d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t==="dark"?"dark":"light"}catch(e){}}();`;
