"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const DOCS_PAGES = [
  { href: "/docs/introduction", label: "Introduction" },
  { href: "/docs/installation", label: "Quick start" },
  { href: "/docs/install-nextjs", label: "Install Next.js" },
  { href: "/docs/install-tailwindcss", label: "Install Tailwind CSS" },
  { href: "/docs/add-utilities", label: "Add utilities" },
  { href: "/docs/cli", label: "CLI" },
] as const;

const BROWSE = [
  { href: "/components", label: "Components" },
  { href: "/blocks", label: "Blocks" },
  { href: "/templates", label: "Templates" },
] as const;

/** Docs navigation: a sticky list on desktop, a scrolling row of pills on small screens. */
export function DocsNav() {
  const pathname = usePathname() ?? "";

  return (
    <>
      <nav aria-label="Docs" className="lg:hidden">
        <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DOCS_PAGES.map((p) => {
            const active = pathname === p.href;
            return (
              <li key={p.href} className="shrink-0">
                <Link
                  href={p.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "pg-glass inline-flex rounded-full px-4 py-2 text-[13.5px] font-medium",
                    active ? "bg-foreground text-background" : "bg-card text-foreground",
                  )}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Docs" className="sticky top-24 hidden self-start lg:block">
        <p className="px-3 text-[13px] font-medium text-muted-foreground">Getting started</p>
        <ul className="mt-2 space-y-0.5">
          {DOCS_PAGES.map((p) => {
            const active = pathname === p.href;
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-3 py-2 text-[15px] transition-colors",
                    active ? "bg-foreground font-medium text-background" : "text-body hover:bg-card hover:text-foreground",
                  )}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 px-3 text-[13px] font-medium text-muted-foreground">Browse</p>
        <ul className="mt-2 space-y-0.5">
          {BROWSE.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="block rounded-full px-3 py-2 text-[15px] text-body transition-colors hover:bg-card hover:text-foreground">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
