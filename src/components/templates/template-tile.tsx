import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Lock, Play } from "lucide-react";
import type { MarketplaceTemplate, TemplateCategory } from "@/lib/catalog/templates";
import { templatePageShots } from "@/lib/template-shots";
import { cn } from "@/lib/utils";
import { templateName, templateTagline } from "./template-card";

/** One pastel per category, so the wall reads as a set rather than a list. */
const CATEGORY_TINT: Partial<Record<TemplateCategory, string>> = {
  SaaS: "bg-tint-sky",
  "AI Startup": "bg-tint-violet",
  "AI Tools": "bg-tint-violet",
  Portfolio: "bg-tint-peach",
  "Developer Portfolio": "bg-tint-peach",
  Agency: "bg-tint-pink",
  "Startup Landing Pages": "bg-tint-mint",
  "E-Commerce": "bg-tint-butter",
  Dashboard: "bg-tint-sky",
  Productivity: "bg-tint-mint",
  "Creator Websites": "bg-tint-butter",
  Fintech: "bg-tint-mint",
  Travel: "bg-tint-peach",
  Music: "bg-tint-violet",
};

/**
 * A template on the gallery wall. Every tile is the same shape — they all show the same thing, a
 * whole landing page — so the grid stays even. The page sits in a browser window on a pastel
 * tile; on hover the window takes a slow tour down the page (hero, then each section) and the two
 * actions slide in.
 */
export function TemplateTile({
  tmpl,
  isPro = false,
  priority = false,
  featured = false,
}: {
  tmpl: MarketplaceTemplate;
  /** The visitor has Pro or All-Access. */
  isPro?: boolean;
  priority?: boolean;
  /** The big tile that opens the wall: two columns wide, with a line about the template. */
  featured?: boolean;
}) {
  const name = templateName(tmpl);
  const tagline = templateTagline(tmpl);
  const href = `/templates/${tmpl.slug}`;
  const unlocked = isPro || !tmpl.premium;
  const allPages = templatePageShots(tmpl, unlocked);
  const firstLocked = allPages.findIndex((p) => p.locked);
  // Without Pro the tour stops on the first blurred page, where the lock fades in.
  const pages = firstLocked === -1 ? allPages : allPages.slice(0, firstLocked + 1);
  const tourMs = Math.max(1, pages.length - 1) * 1700;
  const tint = CATEGORY_TINT[tmpl.category] ?? "bg-tint-sky";

  return (
    <article
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-[28px] p-2.5",
        featured && "lg:col-span-2 lg:row-span-2 lg:p-3.5",
        tint,
      )}
    >
      {/* window */}
      <div
        aria-hidden
        className="pointer-events-none overflow-hidden rounded-[20px] bg-[#0f0f13] shadow-[0_0_0_1px_rgba(23,23,28,0.08),0_18px_40px_-20px_rgba(23,23,28,0.45)] transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
      >
        <div className="flex h-7 items-center gap-1.5 bg-[#1b1b21] px-3.5">
          <span className="size-2 rounded-full bg-[#ff605c]" />
          <span className="size-2 rounded-full bg-[#ffbd44]" />
          <span className="size-2 rounded-full bg-[#00ca4e]" />
          <span className="mx-auto max-w-[55%] truncate rounded-md bg-white/[0.06] px-3 py-0.5 text-[10.5px] text-white/45">
            {name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com
          </span>
          <span className="w-[34px]" />
        </div>
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* the page tour: each screenshot is one viewport tall; hover scrolls down through them */}
          <div
            className="absolute inset-x-0 top-0 flex flex-col transition-transform ease-in-out group-hover:[transform:translateY(calc(-100%*(var(--pages)-1)/var(--pages)))] motion-reduce:transition-none"
            style={
              {
                "--pages": Math.max(1, pages.length),
                transitionDuration: `${tourMs}ms`,
              } as React.CSSProperties
            }
          >
            {pages.map(({ src, unoptimized }, i) => (
              <div key={src} className="relative aspect-[16/10] w-full shrink-0">
                <Image
                  src={src}
                  unoptimized={unoptimized}
                  alt=""
                  fill
                  priority={priority && i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  sizes={featured ? "(max-width: 1023px) 94vw, 820px" : "(max-width: 767px) 94vw, (max-width: 1279px) 48vw, 400px"}
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
          {firstLocked !== -1 ? (
            <div
              className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:[transition-delay:var(--lock-at)] motion-reduce:transition-none"
              style={{ "--lock-at": `${Math.round(tourMs * 0.7)}ms` } as React.CSSProperties}
            >
              <span className="inline-flex translate-y-2 scale-95 items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0 group-hover:scale-100 group-hover:[transition-delay:var(--lock-at)]">
                <Lock className="size-3.5" aria-hidden />
                The rest comes with Pro
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* caption */}
      <div className={cn("flex items-center justify-between gap-3 px-2.5 pb-1 pt-3.5", featured && "lg:pt-5")}>
        <div className="min-w-0">
          <h2 className={cn("truncate text-[18px] font-semibold tracking-[-0.025em] text-foreground", featured && "lg:text-[26px]")}>
            {/* the whole tile is clickable through this link's ::after */}
            <Link
              href={href}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[28px] [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-offset-2 [&:focus-visible]:after:outline-ring"
            >
              {name}
            </Link>
          </h2>
          <p className="truncate text-[13.5px] text-muted-foreground">
            {tagline ? `${tagline} · ` : ""}
            {tmpl.category}
          </p>
        </div>

        <div className="relative z-20 flex shrink-0 items-center gap-1.5">
          {!tmpl.premium ? (
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] transition-opacity md:group-hover:opacity-0 md:group-focus-within:opacity-0 dark:bg-black/30 dark:text-[#7ee2a8] [@media(hover:none)]:hidden">
              Free
            </span>
          ) : unlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] transition-opacity md:group-hover:opacity-0 md:group-focus-within:opacity-0 dark:bg-black/30 dark:text-[#7ee2a8] [@media(hover:none)]:hidden">
              <Check className="size-3" aria-hidden />
              Unlocked
            </span>
          ) : (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[12px] font-semibold text-background transition-opacity md:group-hover:opacity-0 md:group-focus-within:opacity-0 [@media(hover:none)]:hidden">
              Pro
            </span>
          )}
          <div
            className={cn(
              "flex items-center gap-1.5 transition-[opacity,transform] duration-200",
              "md:pointer-events-none md:absolute md:right-0 md:translate-x-2 md:opacity-0",
              "md:group-hover:pointer-events-auto md:group-hover:translate-x-0 md:group-hover:opacity-100",
              "md:group-focus-within:pointer-events-auto md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100",
              "[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:static [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100",
            )}
          >
            <Link
              href={`/template-preview/${tmpl.slug}`}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(23,23,28,0.08)] transition-colors hover:bg-white/80"
            >
              <Play className="size-3 fill-current" aria-hidden />
              Live
              <span className="sr-only">preview of {name}</span>
            </Link>
            <Link
              href={href}
              className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-full bg-[#1d1d1f] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-black"
            >
              {unlocked ? "Open" : "Details"}
              <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only">{name}</span>
            </Link>
          </div>
        </div>
      </div>

      {featured ? (
        <div className="hidden px-2.5 pb-2 pt-3 lg:block">
          <p className="line-clamp-3 max-w-[640px] text-[15px] leading-[1.55] text-foreground/75">{tmpl.description}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tmpl.tags.slice(0, 6).map((tag) => (
              <li key={tag} className="rounded-full bg-white/70 px-3 py-1 text-[12.5px] font-medium text-foreground/80 dark:bg-black/25">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
