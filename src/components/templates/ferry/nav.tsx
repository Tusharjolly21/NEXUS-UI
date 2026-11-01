"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./ui";
import type { IconName } from "./icons";

export function useTheme() {
  const [dark, setDark] = useState(() => typeof document < "u" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const root = document.documentElement,
      observer = new MutationObserver(() => setDark(root.classList.contains("dark")));
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  const toggle = useCallback(() => {
    const applyTheme = () => {
        const nextDark = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", nextDark);
        try {
          localStorage.setItem("ferry-theme", nextDark ? "dark" : "light");
        } catch {}
      },
      doc = document;
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doc.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }, []);
  return {
    dark,
    toggle,
  };
}

type NavLink = {
  id: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  {
    id: "payouts",
    label: "Payouts",
  },
  {
    id: "developers",
    label: "Developers",
  },
  {
    id: "pricing",
    label: "Pricing",
  },
  {
    id: "faq",
    label: "FAQ",
  },
];

type ProductMenuItem = {
  icon: IconName;
  title: string;
  text: string;
  stat: string;
  statLabel: string;
  href: string;
};

export const PRODUCT_MENU: ProductMenuItem[] = [
  {
    icon: "building_2_fill",
    title: "Treasury",
    text: "Balances, cards and rates in one view.",
    stat: "34",
    statLabel: "currencies you can hold",
    href: "#accounts",
  },
  {
    icon: "arrow_2_squarepath",
    title: "Exchange and rails",
    text: "The mid-market rate, fee shown up front.",
    stat: "0.4%",
    statLabel: "flat fee on conversions",
    href: "#product",
  },
  {
    icon: "paperplane_fill",
    title: "Payouts",
    text: "Suppliers and contractors, paid locally.",
    stat: "160",
    statLabel: "countries you can pay",
    href: "#payouts",
  },
  {
    icon: "lock_shield_fill",
    title: "Approvals",
    text: "Rules your finance team sets once.",
    stat: "2",
    statLabel: "approvers on big payments",
    href: "#controls",
  },
];

export function Nav() {
  const { dark, toggle } = useTheme(),
    [activeId, setActiveId] = useState<string | null>(null),
    [productOpen, setProductOpen] = useState(false),
    [productIndex, setProductIndex] = useState(0),
    [mobileOpen, setMobileOpen] = useState(false),
    closeTimer = useRef(0);
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(Boolean) as HTMLElement[],
      visibleIds = new Set<string>(),
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) =>
            entry.isIntersecting ? visibleIds.add(entry.target.id) : visibleIds.delete(entry.target.id),
          );
          setActiveId(NAV_LINKS.find((link) => visibleIds.has(link.id))?.id ?? null);
        },
        {
          rootMargin: "-45% 0px -45% 0px",
        },
      );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const openProduct = () => {
      window.clearTimeout(closeTimer.current);
      setProductOpen(true);
    },
    closeProductSoon = () => {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => setProductOpen(false), 160);
    };
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[calc(12px+env(safe-area-inset-top,0px))] z-50 px-3 sm:top-[calc(16px+env(safe-area-inset-top,0px))] sm:px-6">
      <nav
        aria-label="Main"
        className="pointer-events-auto relative mx-auto flex h-[60px] max-w-[1160px] items-center justify-between rounded-[18px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.75)] pl-5 pr-2.5 shadow-[0_12px_32px_-24px_rgb(0_0_0/.4)] backdrop-blur-xl backdrop-saturate-150"
        onKeyDown={(event) => event.key === "Escape" && (setProductOpen(false), setMobileOpen(false))}
      >
        <a
          href="#top"
          className="flex items-center gap-2 rounded-[8px] text-[18px] font-medium tracking-[-0.03em] text-[rgb(var(--ferry-ink))] no-underline"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgb(var(--ferry-ink))] text-[rgb(var(--ferry-paper))]">
            <Icon name="globe" size={16} />
          </span>
          Ferry
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          <div className="relative" onMouseEnter={openProduct} onMouseLeave={closeProductSoon}>
            <button
              type="button"
              aria-expanded={productOpen}
              aria-haspopup="true"
              onClick={() => setProductOpen((open) => !open)}
              onFocus={openProduct}
              className="flex h-9 items-center gap-1 rounded-[9px] px-3 text-[14px] text-[rgb(var(--ferry-ink)/.8)] transition-colors hover:text-[rgb(var(--ferry-ink))]"
            >
              Product
              <motion.span
                animate={{
                  rotate: productOpen ? 180 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="flex text-[rgb(var(--ferry-faint))]"
              >
                <Icon name="chevron_down" size={10} />
              </motion.span>
            </button>
            <AnimatePresence>
              {productOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.98,
                    transition: {
                      duration: 0.14,
                    },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 34,
                  }}
                  style={{
                    originY: 0,
                    x: "-50%",
                  }}
                  className="absolute left-1/2 top-[calc(100%+12px)] w-[600px]"
                  onMouseEnter={openProduct}
                  onMouseLeave={closeProductSoon}
                >
                  <div className="grid grid-cols-[1fr_200px] gap-2 rounded-[20px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-2 ferry-shadow-lift">
                    <ul className="m-0 list-none p-0">
                      {PRODUCT_MENU.map((item, index) => (
                        <li key={item.title}>
                          <a
                            href={item.href}
                            onMouseEnter={() => setProductIndex(index)}
                            onFocus={() => setProductIndex(index)}
                            onClick={() => setProductOpen(false)}
                            className="relative flex items-start gap-3 rounded-[14px] p-3 no-underline"
                          >
                            {productIndex === index && (
                              <motion.span
                                layoutId="nav-hl"
                                className="absolute inset-0 rounded-[14px] bg-[rgb(var(--ferry-raised))]"
                                transition={{
                                  type: "spring",
                                  stiffness: 600,
                                  damping: 42,
                                }}
                              />
                            )}
                            <span className="relative grid h-9 w-9 place-items-center rounded-[10px] border border-solid border-[rgb(var(--ferry-accent)/.25)] bg-[rgb(var(--ferry-accent)/.1)] text-[rgb(var(--ferry-accent-ink))]">
                              <Icon name={item.icon} size={17} />
                            </span>
                            <span className="relative">
                              <span className="block text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                                {item.title}
                              </span>
                              <span className="block text-[13px] text-[rgb(var(--ferry-mute))]">
                                {item.text}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="relative flex flex-col justify-end overflow-hidden rounded-[14px] border border-solid border-[rgb(var(--ferry-line)/.06)] bg-[rgb(var(--ferry-frame))] p-4">
                      <span aria-hidden="true" className="ferry-glow !right-[-260px] !top-[-260px]" />
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={productIndex}
                          initial={{
                            opacity: 0,
                            y: 10,
                            filter: "blur(4px)",
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                          }}
                          exit={{
                            opacity: 0,
                            y: -10,
                            filter: "blur(4px)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                            filter: {
                              duration: 0.2,
                            },
                          }}
                        >
                          <div className="ferry-tnum text-[44px] font-medium leading-none tracking-[-0.035em] text-[rgb(var(--ferry-ink))]">
                            {PRODUCT_MENU[productIndex].stat}
                          </div>
                          <div className="mt-2 text-[13px] text-[rgb(var(--ferry-mute))]">
                            {PRODUCT_MENU[productIndex].statLabel}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="relative flex h-9 items-center rounded-[9px] px-3 text-[14px] text-[rgb(var(--ferry-ink)/.8)] no-underline transition-colors hover:text-[rgb(var(--ferry-ink))]"
            >
              {activeId === link.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-[9px] bg-[rgb(var(--ferry-ink)/.06)]"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 38,
                  }}
                />
              )}
              <span className="relative">{link.label}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-9 w-9 place-items-center rounded-[9px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-ink)/.8)] transition-colors hover:border-[rgb(var(--ferry-line)/.2)] hover:text-[rgb(var(--ferry-ink))]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={dark ? "moon" : "sun"}
                initial={{
                  rotate: -90,
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  rotate: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  rotate: 90,
                  opacity: 0,
                  scale: 0.6,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 28,
                }}
                className="flex"
              >
                <Icon name={dark ? "moon_fill" : "sun_max_fill"} size={16} />
              </motion.span>
            </AnimatePresence>
          </button>
          <a
            href="#signin"
            className="hidden h-9 items-center rounded-[9px] px-3 text-[14px] text-[rgb(var(--ferry-ink)/.8)] no-underline hover:text-[rgb(var(--ferry-ink))] sm:flex"
          >
            Sign in
          </a>
          <a
            href="#open"
            className="hidden h-9 items-center gap-2 rounded-[9px] bg-[rgb(var(--ferry-accent))] px-3.5 text-[14px] font-medium text-white no-underline shadow-[inset_0_1px_0_rgb(255_255_255/.18),0_1px_2px_rgb(0_0_0/.2)] transition-[filter] hover:brightness-110 sm:flex"
          >
            Open an account
            <Icon name="arrow_up_right" size={10} />
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-9 w-9 place-items-center rounded-[9px] text-[rgb(var(--ferry-ink))] lg:hidden"
          >
            <Icon name={mobileOpen ? "xmark" : "line_horizontal_3"} size={18} />
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 36,
              }}
              className="absolute inset-x-0 top-[calc(100%+10px)] rounded-[20px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-2 ferry-shadow-lift lg:hidden"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 items-center rounded-[12px] px-4 text-[16px] text-[rgb(var(--ferry-ink))] no-underline active:bg-[rgb(var(--ferry-raised))]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#open"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex h-12 items-center justify-center rounded-[12px] bg-[rgb(var(--ferry-accent))] text-[16px] font-medium text-white no-underline"
              >
                Open an account
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
