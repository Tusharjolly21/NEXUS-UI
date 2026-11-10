"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NAV_LINKS } from "./data";
import { COLOR, SPRING } from "./theme";
import { Icon, Logo, PillButton } from "./ui";
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4">
      <div
        className="mx-auto flex max-w-[1200px] items-center justify-between rounded-full py-1.5 pl-4 pr-1.5"
        style={{
          background: "rgba(255,255,255,.86)",
          backdropFilter: "blur(16px) saturate(170%)",
          WebkitBackdropFilter: "blur(16px) saturate(170%)",
          boxShadow: `0 0 0 1px ${COLOR.line}, 0 10px 30px -18px rgba(17,18,20,.25)`,
        }}
      >
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="wf-ring rounded outline-none"
          aria-label="Wharf, back to top"
        >
          <Logo />
        </button>
        <nav aria-label="Main" className="hidden md:block" onMouseLeave={() => setHovered(null)}>
          <LayoutGroup id="wf-nav">
            <ul className="m-0 flex list-none gap-0.5 p-0">
              {NAV_LINKS.map(([label, id]) => (
                <li className="relative" key={id}>
                  {hovered === id && (
                    <motion.span
                      layoutId="wf-nav-hov"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(17,18,20,.05)",
                      }}
                      transition={SPRING}
                    />
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setHovered(id)}
                    onFocus={() => setHovered(id)}
                    onClick={() => scrollTo(id)}
                    className="wf-ring relative rounded-full px-3.5 py-1.5 text-[14px] outline-none"
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
        <div className="flex items-center gap-1.5">
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="wf-ring hidden rounded-full px-4 py-2 text-[14px] no-underline outline-none sm:block"
            style={{
              color: COLOR.ink,
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
            }}
          >
            Sign in
          </a>
          <PillButton dark={true} href="#start" className="!py-2">
            Start building
          </PillButton>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="wf-ring grid h-9 w-9 place-items-center rounded-full outline-none md:hidden"
          >
            <Icon name={menuOpen ? "ph:x" : "ph:list"} size={18} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
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
              y: -8,
            }}
            transition={SPRING}
            className="mx-auto mt-2 grid max-w-[1200px] rounded-[20px] bg-white p-2 md:hidden"
            style={{
              boxShadow: `0 0 0 1px ${COLOR.line}, 0 20px 40px -20px rgba(17,18,20,.3)`,
            }}
          >
            {NAV_LINKS.map(([label, id]) => (
              <button
                type="button"
                onClick={() => scrollTo(id)}
                className="wf-ring rounded-[12px] px-4 py-3 text-left text-[16px] outline-none"
                style={{
                  color: COLOR.ink,
                }}
                key={id}
              >
                {label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
