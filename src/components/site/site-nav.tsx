"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Key, LayoutDashboard, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/components", label: "Components" },
  { href: "/templates", label: "Templates" },
  { href: "/blocks", label: "Blocks" },
  { href: "/docs/introduction", label: "Docs", match: "/docs" },
  { href: "/pricing", label: "Pricing" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/api-key", label: "API key", icon: Key },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
] as const;

/** Past this many pixels of scroll the capsule slims down to logo, search and one action. */
const COMPACT_AFTER = 120;

function useUser() {
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  React.useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);
  return user;
}

function Logo() {
  return (
    <Link href="/" aria-label="Nexus UI home" className="flex shrink-0 items-center gap-2 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70">
      <Image src="/nexus-ui-logo.png" alt="" width={32} height={32} className="size-8 rounded-lg" priority />
      <span className="text-[15px] font-semibold tracking-tight text-white">Nexus UI</span>
    </Link>
  );
}

/**
 * The site's floating dark capsule nav. Search sits in the middle and stays put; on scroll the
 * capsule drops its links so only the logo, search and the main action remain.
 */
export function SiteNav({ isPremium = false }: { isPremium?: boolean }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const user = useUser();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > COMPACT_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu on Escape (links close it on click)
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // template previews render their own full-page chrome
  if (pathname.startsWith("/templates/")) return null;

  const isActive = (href: string, match?: string) => {
    const base = match ?? href;
    return pathname === base || pathname.startsWith(base + "/");
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Account";

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    await createClient().auth.signOut();
    router.push("/");
  }

  const primaryAction = user ? (isPremium ? null : { href: "/pricing", label: "Get Pro" }) : { href: "/components", label: "Browse free" };

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <header
        className={cn(
          "mx-auto flex h-[52px] items-center gap-1 rounded-full bg-[rgba(23,23,28,0.92)] pl-2.5 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[max-width] duration-300 ease-out motion-reduce:transition-none",
          compact ? "max-w-[640px]" : "max-w-[1100px]",
        )}
      >
        <Logo />

        <nav aria-label="Main" className={cn("ml-1 hidden items-center gap-0.5 lg:flex", compact && "lg:hidden")}>
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href, "match" in l ? l.match : undefined);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center rounded-full px-3.5 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
                  active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchCommand variant="capsule" />
          <div className={cn("hidden sm:block", compact && "sm:hidden")}>
            <ThemeToggle variant="capsule" />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Account menu for ${displayName}`}
                className={cn(
                  "hidden h-9 items-center gap-2 rounded-full bg-white/[0.08] pl-1 pr-3 text-[13.5px] text-white/85 transition-colors hover:bg-white/[0.14] sm:flex",
                  compact && "sm:hidden",
                )}
              >
                <span className="grid size-7 place-items-center rounded-full bg-white text-[12px] font-semibold text-[#17171c]">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{displayName}</span>
                {isPremium ? <span className="rounded-full bg-white/15 px-1.5 text-[10.5px] font-semibold text-white">Pro</span> : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="w-52">
                <p className="truncate px-2.5 py-2 text-xs text-muted-foreground">{user.email}</p>
                <DropdownMenuSeparator />
                {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                  <DropdownMenuItem key={href} className="cursor-pointer gap-2.5 px-2.5 py-2 text-[13px]" onClick={() => router.push(href)}>
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2.5 px-2.5 py-2 text-[13px]" onClick={() => void signOut()}>
                  <LogOut className="size-4 text-muted-foreground" aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(
                "hidden h-9 items-center rounded-full px-3 text-[13.5px] text-white/75 transition-colors hover:text-white sm:flex",
                compact && "sm:hidden",
              )}
            >
              Sign in
            </Link>
          )}

          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className="pg-glass hidden h-[38px] items-center rounded-full bg-white px-4 text-[13.5px] font-semibold text-[#17171c] transition-colors hover:bg-white/90 sm:inline-flex"
            >
              {primaryAction.label}
            </Link>
          ) : null}

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden",
              compact && "lg:grid",
            )}
          >
            {menuOpen ? <X className="size-[18px]" aria-hidden /> : <Menu className="size-[18px]" aria-hidden />}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          id="site-menu"
          className="mx-auto mt-2 max-w-[1100px] rounded-[24px] bg-[rgba(23,23,28,0.96)] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl"
        >
          <nav aria-label="Main" className="grid gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href, "match" in l ? l.match : undefined);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-[17px] font-medium transition-colors",
                    active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 flex items-center gap-2 border-t border-white/10 px-1 pt-3">
            <ThemeToggle variant="capsule" />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="h-10 flex-1 content-center rounded-full bg-white/[0.08] text-center text-[14px] font-medium text-white">
                  Dashboard
                </Link>
                <button type="button" onClick={() => void signOut()} className="h-10 rounded-full px-4 text-[14px] text-white/75 hover:text-white">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="h-10 flex-1 content-center rounded-full bg-white/[0.08] text-center text-[14px] font-medium text-white">
                  Sign in
                </Link>
                <Link href="/components" onClick={() => setMenuOpen(false)} className="pg-glass h-10 flex-1 content-center rounded-full bg-white text-center text-[14px] font-semibold text-[#17171c]">
                  Browse free
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
