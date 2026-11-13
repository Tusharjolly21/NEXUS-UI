"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { COLORS, CONTAINER, EASE, SPECTRUM } from "./theme";
import { Button, Icon, Logo, useOpenDownload } from "./ui";

const NAV_MENU = [
  {
    id: "product",
    label: "Product",
    mega: {
      title: "One crew of agents, four places to meet it",
      blurb:
        "Start a task in the app, steer it from the terminal, review it in your editor or build on the same harness.",
      cta: "See the overview",
      ctaHref: "#surfaces",
      items: [
        {
          icon: "ph:app-window",
          t: "Desk",
          d: "Run parallel agents from one window",
          href: "#surfaces",
        },
        {
          icon: "ph:terminal-window",
          t: "Shell",
          d: "The keyboard-first CLI",
          href: "#surfaces",
        },
        {
          icon: "ph:code",
          t: "Lens",
          d: "Agents inside your editor",
          href: "#surfaces",
        },
        {
          icon: "ph:cube",
          t: "Kit",
          d: "Build agents on our harness",
          href: "#surfaces",
        },
        {
          icon: "ph:puzzle-piece",
          t: "Integrations",
          d: "GitHub, Linear, Slack and 40 more",
          href: "#surfaces",
          ext: true,
        },
      ],
    },
  },
  {
    id: "cases",
    label: "Use cases",
    mega: {
      title: "Built around how teams actually ship",
      blurb: "Four teams, four very different backlogs. See how each one hands work to Updraft.",
      cta: "Read the stories",
      ctaHref: "#teams",
      items: [
        {
          icon: "ph:user",
          t: "Solo founders",
          d: "A week of roadmap in an afternoon",
          href: "#teams",
        },
        {
          icon: "ph:buildings",
          t: "Platform teams",
          d: "Upgrades across hundreds of services",
          href: "#teams",
        },
        {
          icon: "ph:device-mobile",
          t: "Mobile engineers",
          d: "Two platforms, one change",
          href: "#teams",
        },
        {
          icon: "ph:git-fork",
          t: "Maintainers",
          d: "A tidy issue queue every morning",
          href: "#teams",
        },
      ],
    },
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "#plans",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    href: "#plans",
  },
  {
    id: "resources",
    label: "Resources",
    mega: {
      title: "Learn, follow along, get help",
      blurb: "Guides for your first task, notes on every release and a community that answers fast.",
      cta: "Open the docs",
      ctaHref: "#journal",
      items: [
        {
          icon: "ph:book-open-text",
          t: "Docs",
          d: "Guides, references and recipes",
          href: "#journal",
        },
        {
          icon: "ph:clock-counter-clockwise",
          t: "Changelog",
          d: "Everything we shipped, weekly",
          href: "#journal",
        },
        {
          icon: "ph:newspaper",
          t: "Journal",
          d: "Essays from the team",
          href: "#journal",
        },
        {
          icon: "ph:chats-circle",
          t: "Community",
          d: "Ask, share and swap prompts",
          href: "#newsletter",
          ext: true,
        },
        {
          icon: "ph:pulse",
          t: "Status",
          d: "All systems normal",
          href: "#newsletter",
          ext: true,
        },
      ],
    },
  },
];

type NavEntry = (typeof NAV_MENU)[number];

function MegaMenu({ entry, onClose, onEnter }: { entry: NavEntry; onClose: () => void; onEnter: () => void }) {
  const mega = entry.mega!;
  return (
    <motion.div
      key="sheet"
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -6,
        transition: {
          duration: 0.18,
        },
      }}
      transition={{
        duration: 0.38,
        ease: EASE,
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onClose}
      className="absolute inset-x-0 top-16 border-b bg-white shadow-[0_30px_60px_-30px_rgba(18,19,23,.25)]"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div className={`${CONTAINER} grid gap-10 py-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={entry.id}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: EASE,
            }}
          >
            <p className="max-w-[340px] text-[26px] font-[460] leading-[1.12] tracking-[-0.03em]">{mega.title}</p>
            <p
              className="mt-3 max-w-[340px] text-[14.5px] leading-[1.55]"
              style={{
                color: COLORS.soft,
              }}
            >
              {mega.blurb}
            </p>
            <div className="mt-6">
              <Button kind="light" size="sm" icon="ph:arrow-right" href={mega.ctaHref} onClick={onClose}>
                {mega.cta}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
        <ul key={entry.id + "-l"} className="grid gap-1 sm:grid-cols-2">
          {mega.items.map((item, i) => (
            <motion.li
              key={item.t}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.04 * i,
                duration: 0.35,
                ease: EASE,
              }}
            >
              <a
                href={item.href}
                onClick={onClose}
                className="ud-ring group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-[#F5F6F8]"
              >
                <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F2F3F5] text-[#2A2C33] transition-colors duration-300 group-hover:text-white">
                  <span
                    aria-hidden={true}
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${SPECTRUM[0]}, ${SPECTRUM[1]} 55%, ${SPECTRUM[2]})`,
                    }}
                  />
                  <Icon name={item.icon} size={20} className="relative" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[15px] font-[520] tracking-[-0.01em]">
                    {item.t}
                    {item.ext && <Icon name="ph:arrow-up-right" size={13} className="opacity-50" />}
                  </span>
                  <span
                    className="block text-[13.5px]"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {item.d}
                  </span>
                </span>
                <Icon
                  name="ph:arrow-right"
                  size={16}
                  className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60"
                />
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>("product");
  const openDownload = useOpenDownload();
  return (
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
      transition={{
        duration: 0.25,
      }}
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-white lg:hidden"
    >
      <nav className="px-5 pb-32 pt-4" aria-label="Mobile">
        {NAV_MENU.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.04 * i,
              duration: 0.35,
              ease: EASE,
            }}
            className="border-b"
            style={{
              borderColor: COLORS.line,
            }}
          >
            {s.mega ? (
              <>
                <button
                  onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                  aria-expanded={openSection === s.id}
                  className="ud-ring flex w-full items-center justify-between py-4 text-[22px] font-[470] tracking-[-0.02em]"
                >
                  {s.label}
                  <Icon
                    name="ph:caret-down"
                    size={18}
                    className={`transition-transform duration-300 ${openSection === s.id ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === s.id && (
                    <motion.ul
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.35,
                        ease: EASE,
                      }}
                      className="overflow-hidden"
                    >
                      {s.mega.items.map((item) => (
                        <li key={item.t}>
                          <a href={item.href} onClick={onClose} className="flex items-center gap-3 py-2.5 pb-3">
                            <span className="grid size-9 place-items-center rounded-lg bg-[#F2F3F5]">
                              <Icon name={item.icon} size={18} />
                            </span>
                            <span>
                              <span className="block text-[15px] font-[520]">{item.t}</span>
                              <span
                                className="block text-[13px]"
                                style={{
                                  color: COLORS.soft,
                                }}
                              >
                                {item.d}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <a href={s.href} onClick={onClose} className="block py-4 text-[22px] font-[470] tracking-[-0.02em]">
                {s.label}
              </a>
            )}
          </motion.div>
        ))}
        <div
          className="fixed inset-x-0 bottom-0 flex gap-2 border-t bg-white p-4"
          style={{
            borderColor: COLORS.line,
          }}
        >
          <Button kind="light" className="flex-1" href="#newsletter" onClick={onClose}>
            Sign in
          </Button>
          <Button
            kind="dark"
            className="flex-1"
            icon="ph:download-simple"
            onClick={() => {
              onClose();
              openDownload();
            }}
          >
            Download
          </Button>
        </div>
      </nav>
    </motion.div>
  );
}

export function Nav() {
  const [menu, setMenu] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openDownload = useOpenDownload();
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const menuTimer = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    setScrolled(y > 8);
    if (y < 160) {
      setHidden(false);
    } else {
      if (delta > 4) {
        setHidden(true);
      } else {
        if (delta < -4) {
          setHidden(false);
        }
      }
    }
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);
  const openMenu = (id: string | null) => {
    window.clearTimeout(menuTimer.current);
    menuTimer.current = window.setTimeout(() => setMenu(id), id ? 90 : 0);
  };
  const closeMenu = () => {
    window.clearTimeout(menuTimer.current);
    menuTimer.current = window.setTimeout(() => setMenu(null), 160);
  };
  const activeMenu = NAV_MENU.find((p) => p.id === menu);
  const showBar = hidden && !menu && !mobileOpen;
  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{
          y: showBar ? "-100%" : "0%",
        }}
        transition={{
          duration: 0.45,
          ease: EASE,
        }}
      >
        <div
          className={`relative z-10 bg-white/90 backdrop-blur-xl transition-shadow duration-300 ${scrolled || menu ? "shadow-[0_1px_0_#ECEDF0]" : ""}`}
        >
          <div className={`${CONTAINER} flex h-16 items-center gap-8`}>
            <a href="#top" className="ud-ring rounded-md" aria-label="Updraft home">
              <Logo />
            </a>
            <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main" onPointerLeave={closeMenu}>
              {NAV_MENU.map((p) =>
                p.mega ? (
                  <button
                    key={p.id}
                    onPointerEnter={() => openMenu(p.id)}
                    onClick={() => setMenu(menu === p.id ? null : p.id)}
                    aria-expanded={menu === p.id}
                    className={`ud-ring flex h-9 items-center gap-1 rounded-full px-3 text-[14px] transition-colors ${menu === p.id ? "bg-[#F2F3F5] text-[#121317]" : "text-[#4A4D56] hover:text-[#121317]"}`}
                  >
                    {p.label}
                    <Icon
                      name="ph:caret-down"
                      size={12}
                      className={`transition-transform duration-300 ${menu === p.id ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : (
                  <a
                    key={p.id}
                    href={p.href}
                    onPointerEnter={() => openMenu(null)}
                    className="ud-ring flex h-9 items-center rounded-full px-3 text-[14px] text-[#4A4D56] transition-colors hover:text-[#121317]"
                  >
                    {p.label}
                  </a>
                ),
              )}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <a
                href="#newsletter"
                className="ud-ring hidden h-9 items-center rounded-full px-3 text-[14px] text-[#4A4D56] transition-colors hover:text-[#121317] sm:flex"
              >
                Sign in
              </a>
              <Button
                kind="dark"
                size="sm"
                icon="ph:download-simple"
                onClick={openDownload}
                className="hidden sm:inline-flex"
              >
                Download
              </Button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="ud-ring grid size-10 place-items-center rounded-full bg-[#F2F3F5] lg:hidden"
              >
                <Icon name={mobileOpen ? "ph:x" : "ph:list"} size={18} />
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {atTop && !mobileOpen && (
            <motion.div
              initial={false}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
                ease: EASE,
              }}
              className="relative overflow-hidden border-b bg-[#F7F7F9]/95 backdrop-blur"
              style={{
                borderColor: COLORS.line,
              }}
            >
              <div className={`${CONTAINER} flex h-10 items-center justify-center gap-3 pr-12 text-[13px] sm:pr-12`}>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#121317] px-2 py-0.5 text-[10.5px] font-[600] tracking-[0.02em] text-white">
                  <Icon name="ph:sparkle" size={10} />
                  New
                </span>
                <span
                  className="truncate"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  Draft 2 and scheduled agents are live in Updraft
                </span>
                <a
                  href="#journal"
                  className="ud-ring group hidden shrink-0 items-center gap-1 font-[540] sm:inline-flex"
                >
                  Read the post
                  <Icon name="ph:arrow-right" size={12} className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <button
                  onClick={() => setAtTop(false)}
                  aria-label="Dismiss announcement"
                  className="ud-ring absolute right-3 grid size-7 place-items-center rounded-full text-[#767A84] transition-colors hover:bg-black/5 hover:text-[#121317]"
                >
                  <Icon name="ph:x" size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {activeMenu?.mega && (
            <MegaMenu
              entry={activeMenu}
              onClose={() => setMenu(null)}
              onEnter={() => window.clearTimeout(menuTimer.current)}
            />
          )}
        </AnimatePresence>
      </motion.header>
      <AnimatePresence>
        {menu && (
          <motion.div
            key="scrim"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            onPointerEnter={() => openMenu(null)}
            onClick={() => setMenu(null)}
            className="fixed inset-0 z-40 hidden bg-[#121317]/20 backdrop-blur-[2px] lg:block"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}</AnimatePresence>
    </>
  );
}
