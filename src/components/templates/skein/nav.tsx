"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { glyphDots, useCanvas } from "./canvas";
import { Icon, type IconName } from "./icons";
import { useTheme } from "./theme";
import { buttonClasses } from "./ui";

type MenuId = "product" | "resources";

const PRODUCT_LINKS = [
  {
    shape: 0,
    title: "Trace",
    text: "Every span from every service, stitched into one request.",
    href: "#trace",
  },
  {
    shape: 1,
    title: "Ask",
    text: "Question your traces in plain language.",
    href: "#ask-feature",
  },
  {
    shape: 2,
    title: "Watch",
    text: "Learns what normal looks like and pages on what isn't.",
    href: "#watch",
  },
] as const;

const SUPPORT_LINKS: readonly { icon: IconName; title: string; text: string }[] = [
  {
    icon: "book_fill",
    title: "Documentation",
    text: "Guides, API reference and SDKs.",
  },
  {
    icon: "question_circle",
    title: "Help centre",
    text: "Answers and walkthroughs for your team.",
  },
];

const COMPANY_LINKS = ["Integrations", "Changelog", "Blog", "Careers"] as const;

const MOBILE_LINKS = [
  ["Trace", "#trace"],
  ["Ask", "#ask-feature"],
  ["Watch", "#watch"],
  ["Integrations", "#integrations"],
  ["Customers", "#customers"],
  ["FAQ", "#faq"],
] as const;

/** One product glyph (Trace, Ask or Watch) drawn as a small field of dots. */
function ShapeGlyph({ shape, className = "" }: { shape: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dots = glyphDots(260)[shape];

  useCanvas(
    canvasRef,
    ({ ctx, w, h, ink }) => {
      const radius = Math.min(w, h) * 0.44;
      ctx.fillStyle = `rgba(${ink},.7)`;
      for (const [x, y] of dots) ctx.fillRect(w / 2 + x * radius - 0.6, h / 2 + y * radius - 0.6, 1.2, 1.2);
    },
    [shape],
  );

  return <canvas ref={canvasRef} aria-hidden="true" className={`block ${className}`} />;
}

/** A top-level menu button with a chevron that flips while its menu is open. */
function MenuTrigger({
  id,
  openMenu,
  onToggle,
  children,
}: {
  id: MenuId;
  openMenu: MenuId | null;
  onToggle: (menu: MenuId | null) => void;
  children: ReactNode;
}) {
  const isOpen = openMenu === id;
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-haspopup="true"
      onClick={() => onToggle(isOpen ? null : id)}
      className={`flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[14px] transition-colors ${isOpen ? "bg-[rgb(var(--skein-raised))] text-[rgb(var(--skein-ink))]" : "text-[rgb(var(--skein-ink)/.8)] hover:text-[rgb(var(--skein-ink))]"}`}
    >
      {children}
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex text-[rgb(var(--skein-faint))]"
      >
        <Icon name="chevron_down" size={9} />
      </motion.span>
    </button>
  );
}

/** Sticky top bar: logo, Product and Resources hover menus, theme toggle, call to action and the phone menu. */
export function Nav() {
  const { dark, toggle } = useTheme();
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(0);

  // Escape closes a menu even when the pointer opened it and focus never entered the bar.
  const anythingOpen = openMenu !== null || mobileOpen;
  useEffect(() => {
    if (!anythingOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anythingOpen]);

  // Hovering opens at once; leaving waits 140ms so the pointer can cross the gap to the panel.
  const showMenu = (menu: MenuId | null) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-solid border-[rgb(var(--skein-line)/.09)] bg-[rgb(var(--skein-bg)/.8)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenMenu(null);
          setMobileOpen(false);
        }
      }}
    >
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-14 max-w-[1140px] items-center justify-between border-x border-solid border-[rgb(var(--skein-line)/.09)] px-5 sm:px-8"
      >
        <div className="flex items-center gap-7">
          <a
            href="#top"
            className="flex items-center gap-1.5 skein-display text-[21px] font-bold tracking-[-0.03em] text-[rgb(var(--skein-ink))] no-underline"
          >
            <Icon name="scribble" size={20} />
            Skein
          </a>
          <div className="hidden items-center gap-1 lg:flex" onMouseLeave={scheduleClose}>
            <div onMouseEnter={() => showMenu("product")}>
              <MenuTrigger id="product" openMenu={openMenu} onToggle={setOpenMenu}>
                Product
              </MenuTrigger>
            </div>
            <div onMouseEnter={() => showMenu("resources")}>
              <MenuTrigger id="resources" openMenu={openMenu} onToggle={setOpenMenu}>
                Resources
              </MenuTrigger>
            </div>
            <a
              href="#customers"
              onMouseEnter={() => showMenu(null)}
              className="flex h-8 items-center rounded-[8px] px-2.5 text-[14px] text-[rgb(var(--skein-ink)/.8)] no-underline transition-colors hover:text-[rgb(var(--skein-ink))]"
            >
              Customers
            </a>
            <a
              href="#faq"
              onMouseEnter={() => showMenu(null)}
              className="flex h-8 items-center rounded-[8px] px-2.5 text-[14px] text-[rgb(var(--skein-ink)/.8)] no-underline transition-colors hover:text-[rgb(var(--skein-ink))]"
            >
              FAQ
            </a>
            <AnimatePresence>
              {openMenu && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.98,
                    transition: { duration: 0.12 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 36,
                  }}
                  onMouseEnter={() => showMenu(openMenu)}
                  className="absolute left-[110px] top-[calc(100%-6px)] origin-top-left rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel))] p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/.5)]"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {openMenu === "product" ? (
                      <motion.ul
                        key="p"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.16 }}
                        className="m-0 grid w-[560px] list-none grid-cols-3 gap-1 p-0"
                      >
                        {PRODUCT_LINKS.map((link) => (
                          <li key={link.title}>
                            <a
                              href={link.href}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded-[10px] p-3 no-underline transition-colors hover:bg-[rgb(var(--skein-raised))]"
                            >
                              <ShapeGlyph shape={link.shape} className="h-10 w-10" />
                              <span className="mt-3 block text-[14px] font-medium text-[rgb(var(--skein-ink))]">{link.title}</span>
                              <span className="mt-1 block text-[12px] leading-[1.45] text-[rgb(var(--skein-mute))]">{link.text}</span>
                            </a>
                          </li>
                        ))}
                      </motion.ul>
                    ) : (
                      <motion.div
                        key="r"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.16 }}
                        className="grid w-[520px] grid-cols-[1.4fr_1fr]"
                      >
                        <div className="border-r border-solid border-[rgb(var(--skein-line)/.08)] pr-2">
                          <p className="m-0 px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--skein-faint))]">
                            Support
                          </p>
                          {SUPPORT_LINKS.map((link) => (
                            <a
                              key={link.title}
                              href="#faq"
                              onClick={() => setOpenMenu(null)}
                              className="flex gap-3 rounded-[10px] p-3 no-underline transition-colors hover:bg-[rgb(var(--skein-raised))]"
                            >
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-raised))] text-[rgb(var(--skein-ink)/.8)]">
                                <Icon name={link.icon} size={14} />
                              </span>
                              <span>
                                <span className="block text-[14px] font-medium text-[rgb(var(--skein-ink))]">{link.title}</span>
                                <span className="block text-[12px] text-[rgb(var(--skein-mute))]">{link.text}</span>
                              </span>
                            </a>
                          ))}
                        </div>
                        <div className="pl-2">
                          <p className="m-0 px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--skein-faint))]">
                            Company
                          </p>
                          {COMPANY_LINKS.map((label) => (
                            <a
                              key={label}
                              href={label === "Integrations" ? "#integrations" : "#top"}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded-[8px] px-3 py-2 text-[14px] text-[rgb(var(--skein-ink)/.85)] no-underline transition-colors hover:bg-[rgb(var(--skein-raised))] hover:text-[rgb(var(--skein-ink))]"
                            >
                              {label}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-8 w-8 place-items-center rounded-[8px] border border-solid border-[rgb(var(--skein-line)/.1)] text-[rgb(var(--skein-ink)/.8)] transition-colors hover:border-[rgb(var(--skein-line)/.2)] hover:text-[rgb(var(--skein-ink))]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={dark ? "m" : "s"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="flex"
              >
                <Icon name={dark ? "moon_fill" : "sun_max_fill"} size={14} />
              </motion.span>
            </AnimatePresence>
          </button>
          <a href="#start" className={`${buttonClasses("primary", "sm")} max-sm:hidden`}>
            Start tracing
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-8 w-8 place-items-center rounded-[8px] text-[rgb(var(--skein-ink))] lg:hidden"
          >
            <Icon name={mobileOpen ? "xmark" : "line_horizontal_3"} size={16} />
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
              className="absolute inset-x-3 top-[calc(100%+8px)] rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel))] p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/.5)] lg:hidden"
            >
              {MOBILE_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center rounded-[10px] px-3 text-[15px] text-[rgb(var(--skein-ink))] no-underline active:bg-[rgb(var(--skein-raised))]"
                >
                  {label}
                </a>
              ))}
              <a href="#start" onClick={() => setMobileOpen(false)} className={`${buttonClasses("primary")} mt-1 w-full`}>
                Start tracing
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
