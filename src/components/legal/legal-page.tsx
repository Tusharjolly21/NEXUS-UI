import Link from "next/link";
import type { ReactNode } from "react";
import { legalConfig } from "@/lib/legal";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="text-foreground">
      <header className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[760px]">
          <h1 className="pg-display text-[clamp(44px,7vw,68px)] leading-[1.04] text-foreground">{title}</h1>
          <p className="mt-4 text-[14px] text-muted-foreground">Last updated {legalConfig.lastUpdated}</p>
          <div className="mt-6 space-y-4 text-[17px] leading-[1.7] text-body">{intro}</div>
        </div>
      </header>
      <article className="mx-auto max-w-[792px] space-y-12 px-4 pb-24">
        {children}
        <footer className="rounded-tile bg-tint-sky px-6 py-5 text-[15px] text-body">
          Questions about this page? Email{" "}
          <LegalLink href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</LegalLink>{" "}
          or use the <LegalLink href="/contact">contact form</LegalLink>.
        </footer>
      </article>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="pg-display text-[26px] leading-[1.1] text-foreground">{title}</h2>
      <div className="space-y-4 text-[16.5px] leading-[1.7] text-body">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-foreground/50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}
