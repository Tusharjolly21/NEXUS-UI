// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./ui";

export function useTheme() {
  const [e, t] = useState(() => typeof document < "u" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const r = document.documentElement,
      i = new MutationObserver(() => t(r.classList.contains("dark")));
    return (
      i.observe(r, {
        attributes: !0,
        attributeFilter: ["class"],
      }),
      () => i.disconnect()
    );
  }, []);
  const n = useCallback(() => {
    const r = () => {
        const s = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", s);
        try {
          localStorage.setItem("ferry-theme", s ? "dark" : "light");
        } catch {}
      },
      i = document;
    i.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches
      ? i.startViewTransition(r)
      : r();
  }, []);
  return {
    dark: e,
    toggle: n,
  };
}

export const NAV_LINKS = [
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

export const PRODUCT_MENU = [
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
  const { dark: e, toggle: t } = useTheme(),
    [n, r] = useState(null),
    [i, s] = useState(!1),
    [o, l] = useState(0),
    [c, u] = useState(!1),
    d = useRef(0);
  useEffect(() => {
    const x = NAV_LINKS.map((v) => document.getElementById(v.id)).filter(Boolean),
      w = new Set(),
      y = new IntersectionObserver(
        (v) => {
          var p;
          (v.forEach((m) => (m.isIntersecting ? w.add(m.target.id) : w.delete(m.target.id))),
            r(((p = NAV_LINKS.find((m) => w.has(m.id))) == null ? void 0 : p.id) ?? null));
        },
        {
          rootMargin: "-45% 0px -45% 0px",
        },
      );
    return (x.forEach((v) => y.observe(v)), () => y.disconnect());
  }, []);
  const f = () => {
      (window.clearTimeout(d.current), s(!0));
    },
    h = () => {
      (window.clearTimeout(d.current), (d.current = window.setTimeout(() => s(!1), 160)));
    };
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[calc(12px+env(safe-area-inset-top,0px))] z-50 px-3 sm:top-[calc(16px+env(safe-area-inset-top,0px))] sm:px-6">
      <nav
        aria-label="Main"
        className="pointer-events-auto relative mx-auto flex h-[60px] max-w-[1160px] items-center justify-between rounded-[18px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.75)] pl-5 pr-2.5 shadow-[0_12px_32px_-24px_rgb(0_0_0/.4)] backdrop-blur-xl backdrop-saturate-150"
        onKeyDown={(x) => x.key === "Escape" && (s(!1), u(!1))}
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
          <div className="relative" onMouseEnter={f} onMouseLeave={h}>
            <button
              type="button"
              aria-expanded={i}
              aria-haspopup="true"
              onClick={() => s((x) => !x)}
              onFocus={f}
              className="flex h-9 items-center gap-1 rounded-[9px] px-3 text-[14px] text-[rgb(var(--ferry-ink)/.8)] transition-colors hover:text-[rgb(var(--ferry-ink))]"
            >
              Product
              <motion.span
                animate={{
                  rotate: i ? 180 : 0,
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
              {i && (
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
                  onMouseEnter={f}
                  onMouseLeave={h}
                >
                  <div className="grid grid-cols-[1fr_200px] gap-2 rounded-[20px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-2 ferry-shadow-lift">
                    <ul className="m-0 list-none p-0">
                      {PRODUCT_MENU.map((x, w) => (
                        <li key={x.title}>
                          <a
                            href={x.href}
                            onMouseEnter={() => l(w)}
                            onFocus={() => l(w)}
                            onClick={() => s(!1)}
                            className="relative flex items-start gap-3 rounded-[14px] p-3 no-underline"
                          >
                            {o === w && (
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
                              <Icon name={x.icon} size={17} />
                            </span>
                            <span className="relative">
                              <span className="block text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                                {x.title}
                              </span>
                              <span className="block text-[13px] text-[rgb(var(--ferry-mute))]">
                                {x.text}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="relative flex flex-col justify-end overflow-hidden rounded-[14px] border border-solid border-[rgb(var(--ferry-line)/.06)] bg-[rgb(var(--ferry-frame))] p-4">
                      <span aria-hidden="true" className="ferry-glow !right-[-260px] !top-[-260px]" />
                      <AnimatePresence mode="popLayout" initial={!1}>
                        <motion.div
                          key={o}
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
                            {PRODUCT_MENU[o].stat}
                          </div>
                          <div className="mt-2 text-[13px] text-[rgb(var(--ferry-mute))]">
                            {PRODUCT_MENU[o].statLabel}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {NAV_LINKS.map((x) => (
            <a
              key={x.id}
              href={`#${x.id}`}
              className="relative flex h-9 items-center rounded-[9px] px-3 text-[14px] text-[rgb(var(--ferry-ink)/.8)] no-underline transition-colors hover:text-[rgb(var(--ferry-ink))]"
            >
              {n === x.id && (
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
              <span className="relative">{x.label}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={t}
            aria-label={e ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-9 w-9 place-items-center rounded-[9px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-ink)/.8)] transition-colors hover:border-[rgb(var(--ferry-line)/.2)] hover:text-[rgb(var(--ferry-ink))]"
          >
            <AnimatePresence mode="popLayout" initial={!1}>
              <motion.span
                key={e ? "moon" : "sun"}
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
                <Icon name={e ? "moon_fill" : "sun_max_fill"} size={16} />
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
            aria-expanded={c}
            onClick={() => u((x) => !x)}
            className="grid h-9 w-9 place-items-center rounded-[9px] text-[rgb(var(--ferry-ink))] lg:hidden"
          >
            <Icon name={c ? "xmark" : "line_horizontal_3"} size={18} />
          </button>
        </div>
        <AnimatePresence>
          {c && (
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
              {NAV_LINKS.map((x) => (
                <a
                  key={x.id}
                  href={`#${x.id}`}
                  onClick={() => u(!1)}
                  className="flex h-12 items-center rounded-[12px] px-4 text-[16px] text-[rgb(var(--ferry-ink))] no-underline active:bg-[rgb(var(--ferry-raised))]"
                >
                  {x.label}
                </a>
              ))}
              <a
                href="#open"
                onClick={() => u(!1)}
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
