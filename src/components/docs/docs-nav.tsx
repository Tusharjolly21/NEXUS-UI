"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { OnThisPage } from "@/components/docs/on-this-page";
import { cn } from "@/lib/utils";

export const DOCS_PAGES = [
  { href: "/docs/introduction", label: "Introduction" },
  { href: "/docs/installation", label: "Quick start" },
  { href: "/docs/install-nextjs", label: "Install Next.js" },
  { href: "/docs/install-tailwindcss", label: "Install Tailwind CSS" },
  { href: "/docs/add-utilities", label: "Add utilities" },
  { href: "/docs/cli", label: "CLI" },
  { href: "/docs/videos", label: "Videos" },
  { href: "/docs/icons", label: "Icons" },
  { href: "/docs/mcp", label: "MCP server" },
] as const;

const BROWSE = [
  { href: "/components", label: "Components" },
  { href: "/blocks", label: "Blocks" },
  { href: "/templates", label: "Templates" },
  { href: "/icons", label: "Icons" },
] as const;

/** Docs navigation: a sticky list on desktop, a scrolling row of pills on small screens. */
export function DocsNav() {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 480, damping: 36 } as const);

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
                    "pg-glass relative inline-flex min-h-10 items-center rounded-full bg-card px-4 py-2 text-[13.5px] font-medium",
                    active ? "text-background" : "text-foreground",
                  )}
                >
                  {active ? (
                    <motion.span layoutId="docs-nav-pill" aria-hidden className="absolute inset-0 rounded-full bg-foreground" transition={spring} />
                  ) : null}
                  <span className="relative">{p.label}</span>
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
                    "relative block rounded-[10px] px-3 py-2 text-[14.5px] transition-colors",
                    active ? "font-medium text-foreground" : "text-body hover:bg-foreground/[0.04] hover:text-foreground",
                  )}
                >
                  {active ? (
                    <motion.span layoutId="docs-nav-row" aria-hidden className="absolute inset-0 rounded-[10px] bg-foreground/[0.07]" transition={spring} />
                  ) : null}
                  <span className="relative">{p.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <OnThisPage />
        <p className="mt-8 px-3 text-[13px] font-medium text-muted-foreground">Browse</p>
        <ul className="mt-2 space-y-0.5">
          {BROWSE.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="block rounded-[10px] px-3 py-2 text-[14.5px] text-body transition-colors hover:bg-foreground/[0.04] hover:text-foreground">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
