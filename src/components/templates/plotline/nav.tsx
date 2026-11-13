"use client";

import { useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { NAV_LINKS } from "./data";
import { COLOR, CONTAINER, EASE, SPRING } from "./theme";
import { Button, Icon, Logo } from "./ui";
export function Nav() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 8));
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,.82)"
          : "rgba(255,255,255,.98)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        boxShadow: `0 1px 0 ${COLOR.line}`,
      }}
    >
      <div
        className={`${CONTAINER} flex h-16 items-center justify-between px-5 sm:px-8`}
      >
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="pl-ring rounded outline-none"
          aria-label="Plotline, back to top"
        >
          <Logo />
        </button>
        <nav
          aria-label="Main"
          className="hidden md:block"
          onMouseLeave={() => setHovered(null)}
        >
          <LayoutGroup id="nav">
            <ul className="m-0 flex list-none gap-1 p-0">
              {NAV_LINKS.map(([label, section]) => (
                <li className="relative" key={section}>
                  {hovered === section && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-[8px]"
                      style={{
                        background: COLOR.panel,
                      }}
                      transition={SPRING}
                    />
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setHovered(section)}
                    onFocus={() => setHovered(section)}
                    onClick={() => scrollTo(section)}
                    className="pl-ring relative rounded-[8px] px-3 py-1.5 text-[14.5px] outline-none"
                    style={{
                      color: COLOR.ink,
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </LayoutGroup>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="pl-ring hidden rounded-[8px] px-3 py-1.5 text-[14.5px] no-underline outline-none sm:block"
            style={{
              color: COLOR.ink,
            }}
          >
            Sign in
          </a>
          <Button dark={true} href="#contact">
            Start for free
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="pl-ring grid h-9 w-9 place-items-center rounded-[8px] outline-none md:hidden"
            style={{
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
            }}
          >
            <Icon name={menuOpen ? "ph:x" : "ph:list"} size={17} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
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
              duration: 0.3,
              ease: EASE,
            }}
            className="overflow-hidden md:hidden"
            style={{
              borderTop: `1px solid ${COLOR.line}`,
            }}
          >
            <div className="grid p-3">
              {NAV_LINKS.map(([label, section]) => (
                <button
                  type="button"
                  onClick={() => scrollTo(section)}
                  className="pl-ring rounded-[8px] px-3 py-3 text-left text-[16px] outline-none"
                  style={{
                    color: COLOR.ink,
                  }}
                  key={section}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
