"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { COLORS, DAWN, EASE } from "./theme";
import { Button, Icon, Logo } from "./ui";

const NAV_LINKS = [
  {
    label: "Product",
    href: "#product",
  },
  {
    label: "Customers",
    href: "#customers",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
  {
    label: "Resources",
    menu: true,
  },
];

const RESOURCES = [
  {
    icon: "ph:book-open-text",
    t: "Docs",
    d: "Set up in an afternoon",
  },
  {
    icon: "ph:clock-counter-clockwise",
    t: "Changelog",
    d: "Shipped every Thursday",
  },
  {
    icon: "ph:newspaper",
    t: "Field notes",
    d: "Essays on calmer on-call",
  },
  {
    icon: "ph:graduation-cap",
    t: "Runbook library",
    d: "120 templates, free",
  },
  {
    icon: "ph:lifebuoy",
    t: "Support",
    d: "A human replies in an hour",
  },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const closeTimer = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setResourcesOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = resourcesOpen ? "hidden" : "";
  }, [resourcesOpen]);
  const openResources = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeResources = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-4">
        <div
          className={`relative mx-auto flex items-center gap-6 transition-all duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)] ${scrolled ? "mt-3 h-14 max-w-[1000px] rounded-full bg-[#0B1124]/75 px-3 pl-5 shadow-[0_0_0_1px_rgba(150,170,255,.14),0_20px_50px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl" : "mt-0 h-[72px] max-w-[1200px] rounded-none bg-transparent px-2 sm:px-4"}`}
        >
          <a href="#top" className="nw-ring rounded-md" aria-label="Nightwatch home">
            <Logo />
          </a>
          <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((navLink) =>
              navLink.menu ? (
                <div
                  key={navLink.label}
                  className="relative"
                  onPointerEnter={openResources}
                  onPointerLeave={closeResources}
                >
                  <button
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    className="nw-ring flex h-9 items-center gap-1 rounded-full px-3 text-[14px] transition-colors hover:text-white"
                    style={{
                      color: open ? COLORS.ink : COLORS.text,
                    }}
                  >
                    {navLink.label}
                    <Icon
                      name="ph:caret-down"
                      size={11}
                      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 6,
                          scale: 0.98,
                          transition: {
                            duration: 0.15,
                          },
                        }}
                        transition={{
                          duration: 0.3,
                          ease: EASE,
                        }}
                        className="absolute left-1/2 top-[calc(100%+12px)] grid w-[560px] -translate-x-1/2 grid-cols-[1fr_220px] gap-2 rounded-[20px] p-2 shadow-[0_0_0_1px_rgba(150,170,255,.14),0_30px_70px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl"
                        style={{
                          background: "rgba(11,17,36,.94)",
                          transformOrigin: "top center",
                        }}
                      >
                        <ul className="p-1">
                          {RESOURCES.map((resource, i) => (
                            <motion.li
                              key={resource.t}
                              initial={{
                                opacity: 0,
                                x: -6,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay: 0.03 * i,
                                duration: 0.3,
                              }}
                            >
                              <a
                                href="#faq"
                                onClick={() => setOpen(false)}
                                className="nw-ring group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[.05]"
                              >
                                <span
                                  className="grid size-8 place-items-center rounded-lg bg-white/[.05] transition-colors group-hover:text-[#FFB86B]"
                                  style={{
                                    color: COLORS.text,
                                  }}
                                >
                                  <Icon name={resource.icon} size={16} />
                                </span>
                                <span>
                                  <span
                                    className="block text-[13.5px] font-[560]"
                                    style={{
                                      color: COLORS.ink,
                                    }}
                                  >
                                    {resource.t}
                                  </span>
                                  <span
                                    className="block text-[12px]"
                                    style={{
                                      color: COLORS.soft,
                                    }}
                                  >
                                    {resource.d}
                                  </span>
                                </span>
                              </a>
                            </motion.li>
                          ))}
                        </ul>
                        <a
                          href="#faq"
                          onClick={() => setOpen(false)}
                          className="nw-ring group relative overflow-hidden rounded-[14px] p-4"
                          style={{
                            background: COLORS.raise,
                          }}
                        >
                          <div
                            className="relative h-24 overflow-hidden rounded-lg"
                            style={{
                              background: "linear-gradient(180deg,#141C38,#0B1124)",
                            }}
                          >
                            <svg
                              viewBox="0 0 200 90"
                              className="absolute inset-0 h-full w-full"
                              preserveAspectRatio="none"
                            >
                              <path
                                d="M0 70 C30 68 40 72 60 66 S90 20 100 22 S120 64 140 62 S180 66 200 64"
                                fill="none"
                                stroke={DAWN[1]}
                                strokeWidth="2"
                              />
                              <path
                                d="M0 70 C30 68 40 72 60 66 S90 20 100 22 S120 64 140 62 S180 66 200 64 V90 H0Z"
                                fill="url(#rg)"
                                opacity=".25"
                              />
                              <defs>
                                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                                  <stop stopColor={DAWN[1]} />
                                  <stop offset="1" stopColor={DAWN[1]} stopOpacity="0" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                          <p
                            className="mt-3 text-[13px] font-[560]"
                            style={{
                              color: COLORS.ink,
                            }}
                          >
                            The 3am report
                          </p>
                          <p
                            className="mt-1 text-[12px] leading-[1.45]"
                            style={{
                              color: COLORS.soft,
                            }}
                          >
                            What 1,400 on-call engineers told us about sleep.
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-[560] text-[#FFB86B]">
                            Read it
                            <Icon
                              name="ph:arrow-right"
                              size={11}
                              className="transition-transform group-hover:translate-x-0.5"
                            />
                          </span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={navLink.label}
                  href={navLink.href}
                  className="nw-ring flex h-9 items-center rounded-full px-3 text-[14px] transition-colors hover:text-white"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {navLink.label}
                </a>
              ),
            )}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <a
              href="#pricing"
              className="nw-ring hidden h-9 items-center rounded-full px-3 text-[14px] transition-colors hover:text-white sm:flex"
              style={{
                color: COLORS.text,
              }}
            >
              Log in
            </a>
            <Button size="sm" href="#pricing" className="hidden sm:inline-flex">
              Start free
            </Button>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              aria-expanded={resourcesOpen}
              aria-label={resourcesOpen ? "Close menu" : "Open menu"}
              className="nw-ring grid size-10 place-items-center rounded-full bg-white/[.06] md:hidden"
              style={{
                color: COLORS.ink,
              }}
            >
              <Icon name={resourcesOpen ? "ph:x" : "ph:list"} size={18} />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {resourcesOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-40 overflow-y-auto px-5 pb-10 pt-24 md:hidden"
            style={{
              background: COLORS.night,
            }}
          >
            {[
              ...NAV_LINKS.filter((navLink) => !navLink.menu),
              ...RESOURCES.map((resource) => ({
                label: resource.t,
                href: "#faq",
              })),
            ].map((label, i) => (
              <motion.a
                key={label.label}
                href={label.href}
                onClick={() => setResourcesOpen(false)}
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.04 * i,
                  duration: 0.4,
                  ease: EASE,
                }}
                className="block border-b py-4 text-[24px] font-[560] tracking-[-0.02em]"
                style={{
                  borderColor: COLORS.line,
                  color: COLORS.ink,
                }}
              >
                {label.label}
              </motion.a>
            ))}
            <div className="mt-8 flex gap-2">
              <Button kind="glass" className="flex-1" href="#pricing" onClick={() => setResourcesOpen(false)}>
                Log in
              </Button>
              <Button className="flex-1" href="#pricing" onClick={() => setResourcesOpen(false)}>
                Start free
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
