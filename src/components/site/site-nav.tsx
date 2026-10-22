"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Key, LayoutDashboard, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { SoundSwitch } from "@/components/site/sound-switch";
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
import { ThemeTrio } from "./theme-trio";

const NAV_LINKS = [
  { href: "/components", label: "Components" },
  { href: "/templates", label: "Templates" },
  { href: "/blocks", label: "Blocks" },
  { href: "/sounds", label: "Sounds" },
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
    <Link href="/" aria-label="Nexus UI home" className="flex shrink-0 items-center gap-2 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Image src="/nexus-ui-logo.png" alt="" width={32} height={32} className="size-8 rounded-lg" priority />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">Nexus UI</span>
    </Link>
  );
}

/**
 * The site's floating frosted-glass capsule nav. Search sits in the middle and stays put; on scroll the
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

  const primaryAction = user ? (isPremium ? null : { href: "/pricing", label: "Get Pro" }) : { href: "/pricing", label: "Get Pro" };

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <header
        className={cn(
          "pg-frost mx-auto flex h-[52px] items-center gap-1 rounded-full pl-2.5 pr-2 shadow-[0_0_0_0.5px_var(--border),0_10px_30px_-14px_rgba(0,0,0,0.28)] transition-[max-width] duration-300 ease-out motion-reduce:transition-none",
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
                  "flex h-9 items-center rounded-full px-3.5 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active ? "bg-foreground/[0.07] text-foreground" : "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchCommand variant="capsule" />
          <ThemeTrio className={cn("hidden md:flex", compact && "md:hidden")} />
          <SoundSwitch className={cn("hidden md:grid", compact && "md:hidden")} />

          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className="hidden h-[34px] items-center rounded-full bg-action px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-action-hover sm:inline-flex"
            >
              {primaryAction.label}
            </Link>
          ) : null}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Account menu for ${displayName}`}
                className={cn(
                  "hidden h-9 items-center gap-2 rounded-full bg-foreground/[0.06] pl-1 pr-3 text-[13.5px] text-foreground/85 transition-colors hover:bg-foreground/[0.1] sm:flex",
                  compact && "sm:hidden",
                )}
              >
                <span className="grid size-7 place-items-center rounded-full bg-foreground text-[12px] font-semibold text-background">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{displayName}</span>
                {isPremium ? <span className="rounded-full bg-[#34c759]/15 px-1.5 text-[10.5px] font-semibold text-[#248a3d] dark:text-[#30d158]">Pro</span> : null}
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
                "hidden h-9 items-center rounded-full px-3 text-[13.5px] text-foreground/70 transition-colors hover:text-foreground sm:flex",
                compact && "sm:hidden",
              )}
            >
              Sign in
            </Link>
          )}


          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "grid size-9 place-items-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/[0.06] hover:text-foreground lg:hidden",
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
          className="pg-frost mx-auto mt-2 max-w-[1100px] rounded-[24px] p-3 shadow-[0_0_0_0.5px_var(--border),0_20px_50px_-20px_rgba(0,0,0,0.3)]"
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
                    active ? "bg-foreground/[0.07] text-foreground" : "text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 flex items-center gap-2 border-t border-border px-1 pt-3">
            <ThemeTrio />
            <SoundSwitch />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="h-10 flex-1 content-center rounded-full bg-foreground/[0.06] text-center text-[14px] font-medium text-foreground">
                  Dashboard
                </Link>
                <button type="button" onClick={() => void signOut()} className="h-10 rounded-full px-4 text-[14px] text-foreground/70 hover:text-foreground">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="h-10 flex-1 content-center rounded-full bg-foreground/[0.06] text-center text-[14px] font-medium text-foreground">
                  Sign in
                </Link>
                <Link href="/pricing" onClick={() => setMenuOpen(false)} className="h-10 flex-1 content-center rounded-full bg-action text-center text-[14px] font-medium text-white">
                  Get Pro
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
