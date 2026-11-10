"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BOUNCY, COLOR, INK, SPRING } from "./theme";
import { Icon, Logo } from "./ui";
/** [label, section id, colour] */
export const NAV_LINKS: [label: string, section: string, color: string][] = [
  ["Home", "home", COLOR.sky],
  ["About", "about", COLOR.yellow],
  ["Work", "work", COLOR.green],
  ["Services", "services", COLOR.lilac],
  ["Process", "process", COLOR.pink],
  ["Contact", "contact", COLOR.orange],
];
/** The floating nav: it drops in after the intro, colours the link for the section on screen, and the logo replays the intro. */
export function Nav({ ready, onLogo }: { ready: boolean; onLogo: () => void }) {
  const [current, setCurrent] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      let onScreen = "home";
      for (const [, section] of NAV_LINKS) {
        const element = document.getElementById(section);
        if (
          element &&
          element.getBoundingClientRect().top < window.innerHeight * 0.4
        ) {
          onScreen = section;
        }
      }
      setCurrent(onScreen);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <motion.header
      initial={{
        y: -100,
      }}
      animate={{
        y: ready ? 0 : -100,
      }}
      transition={{
        ...SPRING,
        delay: ready ? 0.1 : 0,
      }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4"
    >
      <nav
        aria-label="Main"
        className="relative flex items-center gap-1.5 rounded-[18px] bg-white p-1.5 pl-4"
        style={{
          boxShadow: "0 12px 30px -14px rgba(11,18,51,.35)",
        }}
      >
        <button
          type="button"
          onClick={onLogo}
          className="hp-ring mr-2 rounded outline-none"
          aria-label="Hoopla, back to top and replay the intro"
          data-cursor="Replay intro"
        >
          <Logo size={24} />
        </button>
        {NAV_LINKS.map(([label, section, color]) => {
          const active = current === section;
          return (
            <motion.button
              type="button"
              onClick={() => scrollTo(section)}
              whileHover={{
                y: -2,
                rotate: -3,
              }}
              whileTap={{
                scale: 0.94,
              }}
              transition={BOUNCY}
              className="hp-ring hidden rounded-[11px] px-3 py-2 text-[14px] font-semibold outline-none md:block"
              style={{
                color: INK,
                background: active ? color : "transparent",
                boxShadow: `inset 0 0 0 2px ${color}`,
                transition: "background .25s",
              }}
              onMouseEnter={(event) =>
                (event.currentTarget.style.background = color)
              }
              onMouseLeave={(event) =>
                (event.currentTarget.style.background = active
                  ? color
                  : "transparent")
              }
              aria-current={active ? "true" : undefined}
              key={section}
            >
              {label}
            </motion.button>
          );
        })}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Menu"
          className="hp-ring grid h-9 w-9 place-items-center rounded-[11px] outline-none md:hidden"
          style={{
            boxShadow: `inset 0 0 0 2px ${COLOR.sky}`,
          }}
        >
          <Icon name={menuOpen ? "ph:x" : "ph:list"} size={18} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.96,
              }}
              transition={SPRING}
              className="absolute left-0 right-0 top-[calc(100%+8px)] grid grid-cols-2 gap-2 rounded-[18px] bg-white p-2 md:hidden"
              style={{
                boxShadow: "0 18px 40px -16px rgba(11,18,51,.45)",
              }}
            >
              {NAV_LINKS.map(([label, section, color]) => (
                <button
                  type="button"
                  onClick={() => scrollTo(section)}
                  className="hp-ring rounded-[12px] px-3 py-3 text-left text-[16px] font-semibold outline-none"
                  style={{
                    background: color,
                    color: INK,
                  }}
                  key={section}
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
