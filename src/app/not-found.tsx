import type { Metadata } from "next";
import Link from "next/link";
import { PillLink } from "@/components/site/pill-link";
import { RainbowWord } from "@/components/site/rainbow-word";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: false },
};

const ELSEWHERE = [
  { href: "/templates", label: "Templates" },
  { href: "/blocks", label: "Blocks" },
  { href: "/docs/introduction", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Guides" },
];

export default function NotFound() {
  return (
    <main className="pg-dotgrid relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
      <div className="relative">
        <p className="pg-display text-[clamp(96px,18vw,180px)] leading-none">
          <RainbowWord>404</RainbowWord>
        </p>
        <h1 className="pg-display mt-4 text-[clamp(32px,5vw,48px)] text-foreground">This page isn&apos;t here</h1>
        <p className="mx-auto mt-4 max-w-[440px] text-[17px] leading-relaxed text-muted-foreground">
          The link may be old, or the page moved. Everything we make is a click away from the component library.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PillLink href="/components">Browse components</PillLink>
          <PillLink href="/" variant="white">
            Go home
          </PillLink>
        </div>
        <nav aria-label="Elsewhere" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-2">
            {ELSEWHERE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="pg-glass inline-flex rounded-full bg-card px-4 py-2 text-[13.5px] font-medium text-foreground hover:bg-muted">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
