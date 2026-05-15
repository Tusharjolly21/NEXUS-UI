"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import { NexusMark } from "@/components/brand";

const NAV_LINKS = [
  { href: "/components", label: "Components" },
  { href: "/templates", label: "Templates" },
  { href: "/blocks", label: "Blocks" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Hide header on template preview pages
  if (pathname?.startsWith("/templates/")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 dark:border-white/[0.07] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">

          {/* Logo */}
          <Link href="/" aria-label="Nexus-UI home" className="group flex shrink-0 items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl border border-border/60 bg-card/80 text-foreground shadow-sm transition-all group-hover:border-border group-hover:shadow-md dark:bg-white/[0.06] dark:group-hover:bg-white/[0.09]">
              <NexusMark size={20} />
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-[13px] font-semibold tracking-tight text-foreground">Nexus-UI</p>
              <p className="text-[11px] leading-tight text-muted-foreground">UI systems lab</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 justify-center gap-0.5 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-accent"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <div className="hidden md:block">
              <SearchCommand />
            </div>
            <ThemeToggle />
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-lg text-[13px] text-muted-foreground hover:text-foreground",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-full border-transparent bg-foreground px-4 text-[13px] font-semibold text-background hover:bg-foreground/90",
                )}
              >
                Get premium
              </Link>
            </div>

            {/* Mobile hamburger */}
            {mounted ? (
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "lg:hidden size-9 rounded-lg text-muted-foreground hover:text-foreground",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -45, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ) : (
              <button
                type="button"
                aria-label="Open menu"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "lg:hidden size-9 rounded-lg text-muted-foreground",
                )}
              >
                <Menu className="size-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu — full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 z-40 border-b border-border/60 bg-background/95 px-4 pb-6 pt-4 shadow-xl backdrop-blur-2xl lg:hidden dark:border-white/[0.07] dark:bg-background/96"
          >
            <nav className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border py-3 text-sm font-medium transition-colors",
                    pathname === l.href
                      ? "border-primary/30 bg-primary/8 text-foreground dark:bg-primary/10"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-white/[0.03]",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mb-4 block md:hidden">
              <SearchCommand />
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full rounded-xl text-sm font-medium",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants(),
                  "w-full rounded-xl bg-foreground text-sm font-semibold text-background hover:bg-foreground/90",
                )}
              >
                Get premium
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
