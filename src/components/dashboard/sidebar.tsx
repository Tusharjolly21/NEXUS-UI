"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  User,
  Key,
  Home,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { createClient } from "@/lib/supabase/client";

interface SidebarUser {
  email: string;
  name: string;
  avatarLetter: string;
}

interface SidebarProps {
  user: SidebarUser;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/api-key", label: "API Tokens", icon: Key },
] as const;

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-border bg-background px-4 py-5">
      {/* Top: Logo + ThemeToggle */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">Nexus-UI</span>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
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
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
            {user.avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
