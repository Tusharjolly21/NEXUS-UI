import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND, NAV_LINKS } from "./data";
import { Logo, Button } from "./ui";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // highlight the link of the section that crosses the middle of the screen
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.href.slice(1))).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) setActive(id);
          else setActive((current) => (current === id ? "" : current));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${scrolled || open ? "bg-black/70 shadow-[inset_0_-1px_0_rgba(255,255,255,.08)] backdrop-blur-xl" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-6 px-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-md text-[16px] font-semibold tracking-[-0.02em] text-[#f3efe9] outline-none focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
        >
          <Logo />
          {BRAND.name}
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc58a] ${isActive ? "text-[#f3efe9]" : "text-[#a39c94] hover:text-[#f3efe9]"}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="ag-nav"
                    className="absolute inset-0 rounded-full bg-white/[.07]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#login"
            className="whitespace-nowrap rounded-full px-3 py-2 text-[14px] text-[#a39c94] outline-none hover:text-[#f3efe9] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
          >
            Log in
          </a>
          <Button href="#pricing">Start free</Button>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#f3efe9] outline-none focus-visible:ring-2 focus-visible:ring-[#ffc58a] lg:hidden"
          aria-expanded={open}
          aria-controls="ag-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <motion.path animate={{ d: open ? "M6 6l12 12" : "M4 8h16" }} />
            <motion.path animate={{ d: open ? "M6 18L18 6" : "M4 16h16" }} />
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="ag-menu"
            aria-label="Main"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-6 pt-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-[17px] text-[#f3efe9] outline-none hover:bg-white/[.05] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex gap-2">
                <Button href="#login" variant="ghost" className="flex-1">
                  Log in
                </Button>
                <Button href="#pricing" className="flex-1" onClick={() => setOpen(false)}>
                  Start free
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
