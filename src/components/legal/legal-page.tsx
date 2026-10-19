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
    <main className="bg-background text-foreground">
      <article className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6 md:py-20">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">Legal</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-xs text-muted-foreground">Last updated {legalConfig.lastUpdated}</p>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">{intro}</div>
        </header>
        {children}
        <footer className="border-t border-border pt-8 text-sm text-muted-foreground">
          Questions about this page? Email{" "}
          <LegalLink href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</LegalLink>{" "}
          or use the <LegalLink href="/contact">contact form</LegalLink>.
        </footer>
      </article>
    </main>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-0.5 shrink-0 text-primary">—</span>
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
      className="text-primary underline-offset-4 hover:underline"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}
