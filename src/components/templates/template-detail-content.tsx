"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check, ChevronRight, Download, Maximize2, Play, X } from "lucide-react";
import { Band } from "@/components/site/band";
import { InstallCard } from "@/components/site/install-card";
import { PillLink, pillClassName } from "@/components/site/pill-link";
import { RainbowWord } from "@/components/site/rainbow-word";
import { BrowserFrame, TemplateCard, templateName, templateTagline } from "@/components/templates/template-card";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";

const TEMPLATE_PRICE = 49;
const PRO_PRICE = 99;

// What a feature name means, for the ones whose name alone doesn't say.
const FEATURE_COPY: Record<string, string> = {
  "AI agent hero with live motion effects": "A full-viewport hero with particle motion and a spring-animated headline.",
  "Asymmetrical bento feature grid": "A five-cell bento with hover-reactive illustrations, in light and dark.",
  "Multi-device capability matrix": "Desktop, tablet and phone side by side at real responsive breakpoints.",
  "Logo marquee trust strip": "An endless logo strip that stops for reduced motion.",
  "Tiered pricing with toggle": "Monthly and annual billing with animated cards and a highlighted tier.",
  "FAQ accordion with spring physics": "An accordion that opens on a Framer Motion spring.",
  "Tailwind CSS v4 design tokens": "Colours, spacing and radii as CSS custom properties.",
  "Framer Motion microinteractions": "Hover, card lift, scroll reveals and staggered entrances.",
  "TypeScript strict mode": "Props, content and utilities are strictly typed.",
  "Fully responsive on all viewports": "Layouts adapt from a 375px phone up to a 4K desktop.",
  "Animated hero with particle physics": "A particle field that follows the cursor on springs.",
  "Social proof logo carousel": "A continuous logo strip with adjustable speed and pause on hover.",
  "Bento metrics grid with motion": "Four cells with counting numbers and hover lift.",
  "Pricing toggle (monthly / annual)": "A pill toggle that crossfades the prices.",
  "Testimonial scroll rail": "A horizontal rail of quotes you can drag.",
  "SEO-optimised metadata": "Titles, descriptions, Open Graph and canonical tags through the Metadata API.",
  "Dark mode + light mode": "Follows the system setting, with a manual switch that's remembered.",
  "Fully responsive layout": "A mobile-first grid, checked from 375px to 4K.",
  "3D Transforms": "Perspective and rotation for card flips, tilt and layered hero depth.",
  "A11y Optimized": "ARIA roles, keyboard navigation, focus rings and reduced-motion support.",
  "Animations & Effects": "Scroll reveals, staggered entrances, blur-to-clear and hover details.",
  "Automated SEO": "Titles, descriptions, Open Graph and canonical URLs set per page.",
  "Built-in Analytics": "Page-view and button-click events ready for Plausible, PostHog or GA4.",
  CMS: "Copy lives in typed config objects, so you edit words without touching layout.",
  Forms: "Contact and waitlist forms with validation and accessible errors.",
  "Layout Templates": "Hero, features, pricing, FAQ and CTA presets you can reorder.",
  "Overlays & Modals": "Dialogs, drawers and full-screen overlays with Escape to close and scroll lock.",
  "Project Styles": "One file of design tokens to rebrand the whole page.",
  "Slideshows/Tickers": "Logo marquees and quote rails with adjustable speed and pause on hover.",
  "Sticky Scrolling": "A process section whose heading pins while the steps scroll past.",
  "Visual Breakpoints": "Tested layouts at every Tailwind breakpoint from phone to 4K.",
};

// ─── Checkout ────────────────────────────────────────────────────────────────

function CheckoutDialog({
  tmpl,
  open,
  onOpenChange,
}: {
  tmpl: MarketplaceTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const name = templateName(tmpl);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "template", templateSlug: tmpl.slug }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=/templates/${tmpl.slug}`;
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout didn't open. Try again in a moment.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't reach checkout. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-[#17171c]/30 backdrop-blur-md transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <DialogPrimitive.Popup className="pg-float fixed left-1/2 top-1/2 z-[61] w-[min(calc(100vw-32px),400px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-tile bg-card outline-none transition-[opacity,transform] duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-[calc(-50%+12px)] data-[starting-style]:translate-y-[calc(-50%+12px)] motion-reduce:transition-none">
          {tmpl.previewImages ? (
            <div className="relative aspect-[16/8] bg-muted">
              <Image src={tmpl.previewImages.hero} alt="" fill sizes="400px" className="object-cover object-top" />
            </div>
          ) : null}
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 text-foreground backdrop-blur transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden />
          </DialogPrimitive.Close>

          <div className="p-6">
            <DialogPrimitive.Title className="text-[22px] font-bold tracking-[-0.03em] text-foreground">
              Buy {name}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
              ${TEMPLATE_PRICE}, paid once, for the full source of this template.
            </DialogPrimitive.Description>

            {error ? (
              <p role="alert" className="mt-4 rounded-2xl bg-tint-pink px-4 py-3 text-[14px] text-foreground">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={checkout}
              disabled={loading}
              className={pillClassName("ink", "md", "mt-6 w-full disabled:opacity-60")}
            >
              {loading ? "Opening checkout…" : `Pay $${TEMPLATE_PRICE}`}
            </button>
            <p className="mt-3 text-center text-[13px] text-muted-foreground">
              Payment is handled by Lemon Squeezy. Want every template?{" "}
              <Link href="/pricing" className="font-semibold text-foreground underline underline-offset-2">
                Compare plans
              </Link>
            </p>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Shown after Lemon Squeezy sends people back, until the webhook grants access; reloads every 3s. */
function CheckoutPending() {
  React.useEffect(() => {
    const id = setInterval(() => window.location.reload(), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <p role="status" className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-tint-mint px-4 py-2 text-[14px] font-medium text-foreground">
      <span aria-hidden className="size-2 animate-pulse rounded-full bg-[#34c759]" />
      Payment received. Unlocking your template, this takes a few seconds.
    </p>
  );
}

// ─── Download (owners) ───────────────────────────────────────────────────────

function useDownload(slug: string) {
  const [state, setState] = React.useState<"idle" | "loading" | "failed">("idle");

  async function download() {
    setState("loading");
    try {
      const res = await fetch(`/api/download/template?slug=${slug}`);
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("failed");
    }
  }

  return { state, download };
}

// ─── Panel ───────────────────────────────────────────────────────────────────

function AccessPanel({
  tmpl,
  hasAccess,
  onBuy,
}: {
  tmpl: MarketplaceTemplate;
  hasAccess: boolean;
  onBuy: () => void;
}) {
  const { state, download } = useDownload(tmpl.slug);
  const previewHref = `/template-preview/${tmpl.slug}`;

  return (
    <aside className="pg-float self-start rounded-tile bg-card p-6 lg:sticky lg:top-24">
      {hasAccess ? (
        <>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-tint-mint px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:text-[#7ee2a8]">
            <Check className="size-3.5" aria-hidden />
            {tmpl.premium ? "Yours" : "Free"}
          </p>
          <h2 className="mt-3 text-[22px] font-bold tracking-[-0.03em] text-foreground">Take the source</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            A zip of the whole Next.js project, ready for <code className="font-mono text-[13px]">npm install</code>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={download}
              disabled={state === "loading"}
              className={pillClassName("ink", "md", "disabled:opacity-60")}
            >
              <Download className="size-4" aria-hidden />
              {state === "loading" ? "Preparing the zip…" : "Download source"}
            </button>
            <PillLink href={previewHref} variant="white">
              <Play className="size-4" aria-hidden />
              Live preview
            </PillLink>
          </div>
          {state === "failed" ? (
            <p role="alert" className="mt-3 text-[13px] text-foreground">
              The download didn&apos;t start. Try again, or download it from the live preview.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="flex items-baseline gap-2">
            <span className="text-[40px] font-bold leading-none tracking-[-0.04em] text-foreground">${TEMPLATE_PRICE}</span>
            <span className="text-[15px] text-muted-foreground">once</span>
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            The full source of this template. Change anything, ship it as yours.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button type="button" onClick={onBuy} className={pillClassName("ink", "md")}>
              Buy template
            </button>
            <PillLink href={previewHref} variant="white">
              <Play className="size-4" aria-hidden />
              Live preview
            </PillLink>
          </div>
          <p className="mt-5 border-t border-border/60 pt-4 text-[14px] leading-relaxed text-muted-foreground">
            Every template comes with Pro, ${PRO_PRICE} for 12 months.{" "}
            <Link href="/pricing" className="font-semibold text-foreground underline underline-offset-2">
              Compare plans
            </Link>
          </p>
        </>
      )}

      <div className="mt-6">
        <p className="text-[13px] font-medium text-foreground">Built with</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {tmpl.techStack.map((t) => (
            <li key={t} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// ─── Screenshots ─────────────────────────────────────────────────────────────

function ScreenshotViewer({ shot, onClose }: { shot: { src: string; label: string } | null; onClose: () => void }) {
  return (
    <DialogPrimitive.Root open={!!shot} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-[#17171c]/50 backdrop-blur-md transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <DialogPrimitive.Popup className="fixed inset-x-3 top-1/2 z-[61] mx-auto max-w-[min(1280px,calc((100dvh_-_150px)*1.6))] -translate-y-1/2 outline-none transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none sm:inset-x-6">
          {shot ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-4">
                <DialogPrimitive.Title className="rounded-full bg-card px-4 py-2 text-[14px] font-semibold text-foreground">
                  {shot.label}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Close"
                  className="grid size-10 place-items-center rounded-full bg-card text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <X className="size-4" aria-hidden />
                </DialogPrimitive.Close>
              </div>
              <BrowserFrame src={shot.src} alt={shot.label} sizes="(max-width: 1320px) 100vw, 1280px" className="rounded-tile" />
            </>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TemplateDetailContent({
  tmpl,
  related = [],
  isPremium = false,
  checkoutPending = false,
}: {
  tmpl: MarketplaceTemplate;
  related?: MarketplaceTemplate[];
  /** The visitor can open this template (bought it, or has a plan that includes it). */
  isPremium?: boolean;
  checkoutPending?: boolean;
}) {
  const [buyOpen, setBuyOpen] = React.useState(false);
  const [shot, setShot] = React.useState<{ src: string; label: string } | null>(null);

  const hasAccess = isPremium || !tmpl.premium;
  const previewHref = `/template-preview/${tmpl.slug}`;
  const name = templateName(tmpl);
  const tagline = templateTagline(tmpl);
  const [firstWord, ...restWords] = name.split(" ");
  const pageLabels = tmpl.pageLabels?.length ? tmpl.pageLabels : tmpl.sections;
  const shots = (tmpl.previewImages?.sections ?? []).slice(0, 4).map((src, i) => ({
    src,
    label: pageLabels[i] ?? `Screen ${i + 1}`,
  }));

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
              <li>
                <Link href="/templates" className="hover:text-foreground">
                  Templates
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page" className="font-medium text-foreground">
                {name}
              </li>
            </ol>
          </nav>

          <h1 className="pg-display mt-5 max-w-[900px] text-[clamp(44px,7vw,76px)] text-foreground">
            <RainbowWord>{firstWord}</RainbowWord>
            {restWords.length ? ` ${restWords.join(" ")}` : null}
            <span className="sr-only">, a Next.js template</span>
          </h1>
          {tagline ? <p className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-foreground">{tagline}</p> : null}
          <p className="mt-4 max-w-[680px] text-[18px] leading-[1.55] text-muted-foreground">{tmpl.description}</p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="About this template">
            {[tmpl.category, tmpl.difficulty, `${tmpl.pages.length} ${tmpl.pages.length === 1 ? "page" : "pages"}`, `${tmpl.sections.length} sections`].map(
              (c) => (
                <li key={c} className="pg-glass rounded-full bg-card px-3.5 py-1.5 text-[13.5px] font-medium text-foreground">
                  {c}
                </li>
              ),
            )}
          </ul>

          {checkoutPending ? <CheckoutPending /> : null}
        </div>
      </section>

      <section aria-label="Preview" className="px-4 pb-20">
        <div className="mx-auto grid max-w-[1152px] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="pg-float relative overflow-hidden rounded-tile bg-card">
            {tmpl.previewImages ? (
              <BrowserFrame
                src={tmpl.previewImages.hero}
                alt={`${name} home page`}
                sizes="(max-width: 1023px) 100vw, 772px"
                priority
              />
            ) : (
              <div className="grid aspect-[16/10] place-items-center bg-muted text-[15px] text-muted-foreground">
                Open the live preview to see this one.
              </div>
            )}
            <Link href={previewHref} className={pillClassName("ink", "sm", "pg-float absolute bottom-4 right-4 h-[40px]")}>
              <Play className="size-3.5" aria-hidden />
              Open it live
            </Link>
          </div>

          <AccessPanel tmpl={tmpl} hasAccess={hasAccess} onBuy={() => setBuyOpen(true)} />
        </div>
      </section>

      {shots.length ? (
        <section aria-labelledby="inside" className="px-4 pb-24">
          <div className="mx-auto max-w-[1152px]">
            <h2 id="inside" className="pg-display text-[clamp(32px,4.5vw,44px)] text-foreground">
              Inside the page
            </h2>
            <p className="mt-3 max-w-[560px] text-[17px] text-muted-foreground">
              Screens from the live template. Open one to see it full size.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {shots.map((s) => (
                <li key={s.src}>
                  <button
                    type="button"
                    onClick={() => setShot(s)}
                    className="pg-float group relative block w-full overflow-hidden rounded-tile bg-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <BrowserFrame src={s.src} alt="" sizes="(max-width: 639px) 100vw, 566px" />
                    <span className="flex items-center justify-between px-5 py-4 text-[15px] font-semibold text-foreground">
                      {s.label}
                      <Maximize2 className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
                      <span className="sr-only">, view full size</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="contents" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="contents" className="pg-display text-[clamp(32px,4.5vw,44px)] text-foreground">
            What&apos;s in it
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="rounded-tile bg-tint-violet p-7">
              <h3 className="text-[17px] font-semibold text-foreground">Sections, top to bottom</h3>
              <ol className="mt-4 space-y-2.5">
                {tmpl.sections.map((s, i) => (
                  <li key={s} className="flex gap-3 text-[15px] text-foreground">
                    <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            {tmpl.features.length ? (
              <div className="rounded-tile bg-card p-7 pg-float">
                <h3 className="text-[17px] font-semibold text-foreground">Built in</h3>
                <ul className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {tmpl.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#34c759]" aria-hidden />
                      <span>
                        <span className="block text-[15px] font-medium text-foreground">{f}</span>
                        {FEATURE_COPY[f] ? (
                          <span className="mt-0.5 block text-[14px] leading-relaxed text-muted-foreground">{FEATURE_COPY[f]}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="run" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="run" className="pg-display text-[clamp(32px,4.5vw,44px)] text-foreground">
            Run it on your machine
          </h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            <li className="rounded-tile bg-tint-sky p-6">
              <h3 className="text-[17px] font-semibold text-foreground">Get the code</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {hasAccess
                  ? "Download the source zip and unpack it where you keep projects."
                  : "Buy the template, then download the source zip from this page."}
              </p>
            </li>
            <li className="rounded-tile bg-tint-mint p-6">
              <h3 className="text-[17px] font-semibold text-foreground">Install</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">In the project folder:</p>
              <InstallCard command="npm install" className="mt-3" />
            </li>
            <li className="rounded-tile bg-tint-peach p-6">
              <h3 className="text-[17px] font-semibold text-foreground">Start it</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Then open localhost:3000.</p>
              <InstallCard command="npm run dev" className="mt-3" />
            </li>
          </ol>
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="more" className="px-4 pb-24">
          <div className="mx-auto max-w-[1152px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="more" className="pg-display text-[clamp(32px,4.5vw,44px)] text-foreground">
                More templates
              </h2>
              <PillLink href="/templates" variant="white" size="sm">
                See all templates
              </PillLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {related.map((t) => (
                <TemplateCard key={t.slug} tmpl={t} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Band tint="butter">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="pg-display max-w-[620px] text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">
              {hasAccess ? `${name} is yours` : `Make ${name} yours`}
            </h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              {hasAccess
                ? "Swap in your words and colours, or drop in more sections from the component library."
                : `$${TEMPLATE_PRICE} once for the full source. Swap in your words and colours and ship it.`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {hasAccess ? (
              <PillLink href="/components">Browse components</PillLink>
            ) : (
              <button type="button" onClick={() => setBuyOpen(true)} className={pillClassName("ink", "md")}>
                Buy template
              </button>
            )}
            <PillLink href={previewHref} variant="white">
              Live preview
            </PillLink>
          </div>
        </div>
      </Band>

      <CheckoutDialog tmpl={tmpl} open={buyOpen} onOpenChange={setBuyOpen} />
      <ScreenshotViewer shot={shot} onClose={() => setShot(null)} />
    </>
  );
}
