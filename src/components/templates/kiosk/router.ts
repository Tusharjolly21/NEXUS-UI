import { createContext, useContext } from "react";
import { CATEGORIES, getStory } from "./data";

/**
 * Kiosk is one page that shows many: the current one lives in the URL hash (#/article/<slug>), so links,
 * the back button and refreshes all work without a router. Swap this file for your framework's routing
 * when you move the pages into real routes.
 */
export const PAGES = ["home", "articles", "category", "article", "about", "contact", "privacy", "terms", "404"] as const;

export type Page = (typeof PAGES)[number];

export type Route = { page: Page; slug?: string };

const isPage = (value: string): value is Page => (PAGES as readonly string[]).includes(value);

/** Reads a hash like "#/article/some-story" into a route, sending unknown pages and slugs to 404. */
export function parseRoute(hash: string): Route {
  const [, page, slug] = hash.replace(/^#/, "").split("/");
  if (!page) return { page: "home" };
  if (!isPage(page)) return { page: "404" };
  if (page === "article" && !getStory(slug ?? "")) return { page: "404" };
  if (page === "category" && !CATEGORIES.some((category) => category.slug === slug)) return { page: "404" };
  return { page, slug };
}

export const routeHref = (route: Route) => `#/${route.page === "home" ? "" : route.page}${route.slug ? `/${route.slug}` : ""}`;

export type Site = {
  route: Route;
  go: (route: Route) => void;
  /** slugs of saved stories, newest first */
  saved: string[];
  toggleSave: (slug: string) => void;
  toast: (message: string) => void;
  openSearch: () => void;
  openSaved: () => void;
};

export const SiteContext = createContext<Site | null>(null);

export function useSite(): Site {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite must be used inside KioskApp");
  return site;
}

export const NAV_LINKS: [label: string, to: Route][] = [
  ["Home", { page: "home" }],
  ["Articles", { page: "articles" }],
  ["Categories", { page: "home" }],
  ["About", { page: "about" }],
];
