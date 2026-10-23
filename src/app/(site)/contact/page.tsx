import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { RainbowWord } from "@/components/site";
import { SocialLinks } from "@/components/site/social-links";
import { legalConfig } from "@/lib/legal";
import { createMetadata } from "@/lib/seo";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = createMetadata({
  title: "Contact",
  description: "Questions about installing Nexus UI, your plan, a template, or a component you'd like to see? Write to us.",
  alternates: { canonical: "/contact" },
});

const HELPFUL = [
  "The component or template slug, like gooey-search-input",
  "Your Next.js and Tailwind versions",
  "A link that reproduces the problem",
];

const SELF_SERVE = [
  { href: "/docs/installation", label: "Installation guide" },
  { href: "/docs/cli", label: "Using the shadcn CLI" },
  { href: "/pricing", label: "Plans and refunds" },
  { href: "/terms", label: "Licence terms" },
];

export default function ContactPage() {
  const { contactEmail } = legalConfig;

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[860px] text-[clamp(48px,8vw,80px)] text-foreground">
            Tell us what you&apos;re <RainbowWord>building</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[600px] text-[19px] leading-[1.55] text-muted-foreground">
            Install trouble, a question about your plan, a bug, or a component you wish existed. It all lands in the
            same inbox.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <ContactForm />

          <div className="grid content-start gap-5">
            <div className="rounded-tile bg-tint-violet p-7">
              <Mail className="size-5 text-foreground" aria-hidden />
              <h2 className="mt-4 text-[17px] font-semibold text-foreground">Rather use email?</h2>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 inline-block text-[17px] font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                {contactEmail}
              </a>
            </div>

            <div className="rounded-tile bg-card p-7 pg-float">
              <h2 className="text-[17px] font-semibold text-foreground">Connect with us</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-body">Follow along for updates and new releases.</p>
              <SocialLinks withHandle className="mt-4 flex-wrap" />
            </div>

            <div className="rounded-tile bg-tint-sky p-7">
              <h2 className="text-[17px] font-semibold text-foreground">Reporting a bug? Include</h2>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-body">
                {HELPFUL.map((h) => (
                  <li key={h} className="flex gap-2.5">
                    <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-foreground/50" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-tile bg-card p-7 pg-float">
              <h2 className="text-[17px] font-semibold text-foreground">Might already be answered</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SELF_SERVE.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="pg-glass inline-flex rounded-full bg-card px-3.5 py-1.5 text-[13.5px] font-medium text-foreground hover:bg-muted">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
