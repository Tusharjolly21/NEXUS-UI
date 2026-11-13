"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONTAINER, DARK, EASE } from "./theme";
import { Button, Icon, Logo } from "./ui";

const NAV_LINKS = [
  ["Product", "#product"],
  ["Network", "#network"],
  ["Developers", "#code"],
  ["Models", "#models"],
  ["Pricing", "#pricing"],
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300"
      style={{
        background: scrolled || open ? "rgba(9,9,11,.72)" : "transparent",
        backdropFilter: scrolled || open ? "blur(14px) saturate(1.4)" : "none",
        boxShadow: scrolled ? `0 1px 0 ${DARK.line}` : "none",
      }}
    >
      <div className={`${CONTAINER} flex h-[60px] items-center justify-between`}>
        <a href="#top" aria-label="Outpost home">
          <Logo />
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-full px-3 py-1.5 text-[14px] transition-colors hover:bg-white/[.06]"
              style={{
                color: DARK.text,
              }}
              onMouseEnter={(event) => (event.currentTarget.style.color = DARK.ink)}
              onMouseLeave={(event) => (event.currentTarget.style.color = DARK.text)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#cta"
            className="px-3 text-[14px] font-[500]"
            style={{
              color: DARK.ink,
            }}
          >
            Log in
          </a>
          <Button size="sm" href="#cta">
            Talk to sales
          </Button>
        </div>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full md:hidden"
          style={{
            color: DARK.ink,
            boxShadow: `inset 0 0 0 1px ${DARK.line2}`,
          }}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Icon name={open ? "ph:x" : "ph:list"} size={17} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
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
            className="overflow-hidden md:hidden"
            style={{
              background: DARK.bg,
            }}
          >
            <div className="flex flex-col gap-1 px-5 pb-6 pt-2">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-[17px]"
                  style={{
                    color: DARK.ink,
                  }}
                >
                  {label}
                </a>
              ))}
              <div className="mt-3 flex gap-2">
                <Button kind="light" href="#cta" className="flex-1" onClick={() => setOpen(false)}>
                  Deploy a model
                </Button>
                <Button href="#cta" className="flex-1" onClick={() => setOpen(false)}>
                  Talk to sales
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
