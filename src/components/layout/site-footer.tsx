"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, ExternalLink } from "lucide-react";
import { NexusMark } from "@/components/brand";

const FOOTER_LINKS = {
  Product: [
    { href: "/components", label: "Components" },
    { href: "/templates", label: "Templates" },
    { href: "/blocks", label: "Blocks" },
    { href: "/pricing", label: "Pricing" },
  ],
  Developers: [
    { href: "/docs/installation", label: "Installation" },
    { href: "/docs/add-utilities", label: "Utilities" },
    { href: "/blog", label: "Blog" },
    { href: "/search", label: "Search" },
  ],
  Account: [
    { href: "/login", label: "Sign in" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export function SiteFooter() {
  const pathname = usePathname();

  // Hide footer on template preview pages
  if (pathname?.startsWith("/templates/")) {
    return null;
  }

  return (
    <footer className="border-t border-border/60 bg-muted/20 dark:bg-zinc-950/60">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand column */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href="/"
              aria-label="Nexus-UI home"
              className="inline-flex items-center gap-2.5"
            >
              <span className="grid size-8 place-items-center rounded-xl border border-border/60 bg-card/80 text-foreground shadow-sm dark:bg-white/[0.06]">
                <NexusMark size={20} />
              </span>
              <span className="text-sm font-semibold text-foreground">Nexus-UI</span>
            </Link>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
              A premium marketplace for animated interfaces — components, templates, and blocks
              engineered for Next.js, Tailwind, and Framer Motion.
            </p>
            <div className="flex gap-3 text-muted-foreground">
              <Link
                href="https://github.com"
                className="transition-colors hover:text-foreground"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code2 className="size-[18px]" />
              </Link>
              <Link
                href="https://x.com"
                className="transition-colors hover:text-foreground"
                aria-label="X / Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-[18px]" />
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {(Object.entries(FOOTER_LINKS) as [string, readonly { href: string; label: string }[]][]).map(
            ([category, links]) => (
              <div key={category}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {category}
                </p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="border-t border-border/40 py-5 text-xs text-muted-foreground dark:border-white/[0.05]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Nexus-UI. Built for developers who ship.</p>
          <nav aria-label="Legal" className="flex gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
