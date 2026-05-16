"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, ShoppingBag, LogOut, User, Key, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import { NexusMark } from "@/components/brand";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/components", label: "Components" },
  { href: "/templates", label: "Templates" },
  { href: "/blocks", label: "Blocks" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<SupabaseUser | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Account";

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  {/* Standalone Orders link */}
                  <Link
                    href="/orders"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "rounded-lg text-[13px] text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Orders
                  </Link>

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-2 rounded-lg border-border/60 bg-background/80 text-[13px] font-medium text-foreground hover:bg-accent",
                      )}
                    >
                      <User className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="max-w-28 truncate">{displayName}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="w-52">
                      <div className="px-2.5 py-2 text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px]"
                        onClick={() => router.push("/orders")}
                      >
                        <LayoutDashboard className="size-4 text-muted-foreground" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px]"
                        onClick={() => router.push("/api-key")}
                      >
                        <Key className="size-4 text-muted-foreground" />
                        API Key
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px]"
                        onClick={() => router.push("/orders")}
                      >
                        <ShoppingBag className="size-4 text-muted-foreground" />
                        Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px]"
                        onClick={() => router.push("/billing")}
                      >
                        <CreditCard className="size-4 text-muted-foreground" />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px]"
                        onClick={() => void signOut()}
                      >
                        <LogOut className="size-4 text-muted-foreground" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Get premium CTA still shown */}
                  <Link
                    href="/pricing"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "rounded-full border-transparent bg-foreground px-4 text-[13px] font-semibold text-background hover:bg-foreground/90",
                    )}
                  >
                    Get premium
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
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

      {/* Mobile menu */}
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
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5">
                    <User className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start gap-2 rounded-xl text-sm font-medium",
                    )}
                  >
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                  <Link
                    href="/api-key"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start gap-2 rounded-xl text-sm font-medium",
                    )}
                  >
                    <Key className="size-4" /> API Key
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start gap-2 rounded-xl text-sm font-medium",
                    )}
                  >
                    <ShoppingBag className="size-4" /> Orders
                  </Link>
                  <Link
                    href="/billing"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start gap-2 rounded-xl text-sm font-medium",
                    )}
                  >
                    <CreditCard className="size-4" /> Billing
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); void signOut(); }}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-start gap-2 rounded-xl text-sm font-medium text-destructive hover:text-destructive",
                    )}
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
