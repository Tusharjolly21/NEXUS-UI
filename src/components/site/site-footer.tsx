"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/components", label: "Components" },
      { href: "/templates", label: "Templates" },
      { href: "/blocks", label: "Blocks" },
      { href: "/sounds", label: "Sounds" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs/introduction", label: "Docs" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/cli", label: "shadcn CLI" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

/** Quiet Apple-style footer with the ghost "Nexus UI" wordmark bleeding off the bottom edge. */
export function SiteFooter() {
  const xHandle = siteConfig.twitterHandle?.replace("@", "");

  return (
    <footer className="relative overflow-hidden border-t border-border bg-footer px-4 pt-16 text-foreground">
      <div className="relative z-10 mx-auto max-w-[1152px]">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <Image src="/nexus-ui-logo.png" alt="" width={36} height={36} className="size-9 rounded-lg" />
              <span className="text-[16px] font-semibold">Nexus UI</span>
            </Link>
            <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">
              Animated React components and Next.js templates you copy into your project and own.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-3 text-[12.5px] font-semibold text-foreground">{col.title}</p>
              <ul className="space-y-2 text-[12.5px] text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-border py-5 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexus UI</p>
          <div className="flex items-center gap-5">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
            {xHandle && (
              <a href={`https://x.com/${xHandle}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
                X
              </a>
            )}
          </div>
        </div>
      </div>
      <p
        aria-hidden
        className="pg-display pointer-events-none -mb-[4vw] select-none whitespace-nowrap text-center text-[20vw] leading-[0.75] text-foreground/[0.035]"
      >
        Nexus UI
      </p>
    </footer>
  );
}
