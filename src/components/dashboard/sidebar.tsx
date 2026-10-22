"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  User,
  Key,
  Home,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexusMark } from "@/components/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

interface SidebarUser {
  email: string;
  name: string;
  avatarLetter: string;
  /** Plan label: Free, Pro or All-Access. */
  plan: string;
  paid: boolean;
}

interface SidebarProps {
  user: SidebarUser;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/api-key", label: "API token", icon: Key },
  { href: "/dashboard/profile", label: "Account", icon: User },
] as const;

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Escape closes the mobile drawer.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const navContent = (
    <>
      {/* Top: Logo + ThemeToggle */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
            <NexusMark size={18} />
          </span>
          Nexus UI
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <nav aria-label="Account" className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[14.5px] font-medium transition-colors",
                  active ? "bg-muted font-semibold text-foreground" : "text-body hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-3">
        {/* Back to site */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Home className="size-4 shrink-0" />
          Back to site
        </Link>

        <div className="border-t border-border" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
          >
            {user.avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="truncate">{user.name}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
                  user.paid ? "bg-action/10 text-link" : "bg-muted text-muted-foreground",
                )}
              >
                {user.plan}
              </span>
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <SignOutButton className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground" />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <span className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
            <NexusMark size={16} />
          </span>
          Nexus UI
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 bg-[#17171c]/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar (always visible) + Mobile slide-in */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border/60 bg-card px-4 pt-18 pb-5 transition-transform duration-300 motion-reduce:transition-none lg:pt-5",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {navContent}
      </aside>

    </>
  );
}
