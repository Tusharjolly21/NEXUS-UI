"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { COLORS, EASE } from "./theme";
import { Button, Icon, Logo } from "./ui";

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 60));
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);
  const links = [
    ["Product", "#features"],
    ["Customers", "#customers"],
    ["Pricing", "#pricing"],
  ];
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3">
        <div
          className={`mx-auto flex items-center gap-6 transition-all duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)] ${scrolled ? "mt-3 h-12 max-w-[700px] rounded-full bg-[#141416]/80 pl-4 pr-1.5 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_16px_40px_-16px_rgba(0,0,0,.9)] backdrop-blur-xl" : "mt-0 h-16 max-w-[1100px] px-5 sm:px-8"}`}
        >
          <a href="#top" aria-label="Surfaced home">
            <Logo />
          </a>
          <nav aria-label="Main" className="hidden items-center gap-5 sm:flex">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[13.5px] font-[500] transition-colors hover:text-white"
                style={{
                  color: "#D4D4D8",
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <a
              href="#pricing"
              className="hidden px-3 text-[13.5px] font-[500] transition-colors hover:text-white sm:block"
              style={{
                color: "#D4D4D8",
              }}
            >
              Log in
            </a>
            <AnimatePresence>
              {scrolled && (
                <motion.span
                  initial={{
                    opacity: 0,
                    width: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    width: "auto",
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    width: 0,
                    scale: 0.9,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="hidden overflow-hidden sm:block"
                >
                  <Button kind="primary" size="sm" href="#cta">
                    Start free
                  </Button>
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-9 place-items-center rounded-full sm:hidden"
              style={{
                color: COLORS.ink,
                background: "rgba(255,255,255,.06)",
              }}
            >
              <Icon name={open ? "ph:x" : "ph:list"} size={17} />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
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
            className="fixed inset-0 z-40 px-5 pt-24 sm:hidden"
            style={{
              background: COLORS.bg,
            }}
          >
            {[...links, ["Log in", "#pricing"]].map(([label, href], i) => (
              <motion.a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: i * 0.05,
                }}
                className="block border-b py-4 text-[24px] font-[600] tracking-[-0.03em]"
                style={{
                  borderColor: COLORS.line,
                  color: COLORS.ink,
                }}
              >
                {label}
              </motion.a>
            ))}
            <div className="mt-8">
              <Button kind="primary" href="#cta" onClick={() => setOpen(false)} className="w-full">
                Start free
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
