"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArticlePage } from "./article";
import { ArticlesPage, CategoryPage } from "./articles";
import { Cursor, Footer, Header, SavedDrawer, SearchOverlay, Ticker } from "./chrome";
import { HomePage } from "./home";
import { AboutPage, ContactPage, LegalPage, NotFoundPage } from "./pages";
import { SiteContext, parseRoute, routeHref, type Route, type Site } from "./router";
import { BASE_CSS, COLOR, EASE, FONT_CSS, FONT_SANS, SPRING } from "./theme";
import { Icon } from "./ui";
type Toast = {
  id: number;
  message: string;
};

/**
 * The whole magazine: the header and ticker, whichever page the URL hash names, the footer, and the overlays
 * (search with Cmd/Ctrl+K or /, the saved drawer, toasts, the custom cursor). Saved stories live in memory; keep
 * them in localStorage or your backend if you want them to last.
 */
export function KioskApp() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined"
      ? parseRoute(window.location.hash)
      : {
          page: "home",
        },
  );
  const [saved, setSaved] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const reduce = useReducedMotion();

  // the back and forward buttons
  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // a new page starts at the top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [route.page, route.slug]);

  // Cmd/Ctrl+K toggles search, and / opens it when you are not typing
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && !target?.closest?.("input,textarea")) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const toast = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [
      ...list,
      {
        id,
        message,
      },
    ]);
    window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 2400);
  };
  const site: Site = {
    route,
    go: (to) => {
      const href = routeHref(to);
      if (window.location.hash !== href) {
        try {
          window.history.pushState(null, "", href);
        } catch {
          // some sandboxed frames refuse pushState; the page still changes
        }
      }
      setRoute(to);
    },
    saved,
    toggleSave: (slug) =>
      setSaved((list) => {
        const isSaved = list.includes(slug);
        toast(isSaved ? "Removed from saved" : "Saved for later");
        return isSaved ? list.filter((item) => item !== slug) : [slug, ...list];
      }),
    toast,
    openSearch: () => setSearchOpen(true),
    openSaved: () => setSavedOpen(true),
  };
  const pageKey = `${route.page}-${route.slug ?? ""}`;
  const page =
    route.page === "home" ? (
      <HomePage />
    ) : route.page === "articles" ? (
      <ArticlesPage />
    ) : route.page === "category" ? (
      <CategoryPage slug={route.slug ?? ""} />
    ) : route.page === "article" ? (
      <ArticlePage slug={route.slug ?? ""} />
    ) : route.page === "about" ? (
      <AboutPage />
    ) : route.page === "contact" ? (
      <ContactPage />
    ) : route.page === "privacy" || route.page === "terms" ? (
      <LegalPage kind={route.page} />
    ) : (
      <NotFoundPage />
    );
  const { scrollY } = useScroll();
  const [showTop, setShowTop] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShowTop(y > 1400));
  return (
    <SiteContext.Provider value={site}>
      <div
        className="ks min-h-screen antialiased"
        style={{
          background: "#fff",
          color: COLOR.ink,
          fontFamily: FONT_SANS,
          overflowX: "clip",
        }}
      >
        <style>{FONT_CSS + BASE_CSS}</style>
        <Ticker />
        <Header />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            initial={
              reduce
                ? false
                : {
                    opacity: 0,
                    y: 16,
                    filter: "blur(6px)",
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={
              reduce
                ? undefined
                : {
                    opacity: 0,
                    y: -10,
                    filter: "blur(6px)",
                  }
            }
            transition={{
              duration: 0.4,
              ease: EASE,
            }}
            key={pageKey}
          >
            {page}
          </motion.main>
        </AnimatePresence>
        <Footer />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <SavedDrawer open={savedOpen} onClose={() => setSavedOpen(false)} />
        <Cursor />
        <AnimatePresence>
          {showTop && (
            <motion.button
              type="button"
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 16,
                scale: 0.8,
              }}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              aria-label="Back to top"
              className="ks-ring fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full text-white outline-none"
              style={{
                background: COLOR.ink,
                boxShadow: "0 14px 30px -12px rgba(0,0,0,.5)",
              }}
            >
              <Icon name="ph:arrow-up" size={18} />
            </motion.button>
          )}
        </AnimatePresence>
        <div
          className="pointer-events-none fixed bottom-5 left-1/2 z-[150] grid -translate-x-1/2 gap-2"
          aria-live="polite"
        >
          <AnimatePresence>
            {toasts.map((h: Toast) => (
              <motion.div
                layout={true}
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95,
                }}
                transition={SPRING}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-medium text-white"
                style={{
                  background: COLOR.ink,
                  boxShadow: "0 14px 30px -12px rgba(0,0,0,.5)",
                }}
                key={h.id}
              >
                <span
                  style={{
                    color: COLOR.hi,
                  }}
                >
                  <Icon name="ph:check-circle-fill" size={16} />
                </span>
                {h.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </SiteContext.Provider>
  );
}
