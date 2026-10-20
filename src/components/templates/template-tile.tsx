import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Play } from "lucide-react";
import type { MarketplaceTemplate, TemplateCategory } from "@/lib/catalog/templates";
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
  owned = false,
  priority = false,
}: {
  tmpl: MarketplaceTemplate;
  owned?: boolean;
  priority?: boolean;
}) {
  const name = templateName(tmpl);
  const tagline = templateTagline(tmpl);
  const href = `/templates/${tmpl.slug}`;
  const pages = tmpl.previewImages ? [tmpl.previewImages.hero, ...tmpl.previewImages.sections] : [];
  const tint = CATEGORY_TINT[tmpl.category] ?? "bg-tint-sky";

  return (
    <article className={cn("group relative isolate flex h-full flex-col overflow-hidden rounded-[28px] p-2.5", tint)}>
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
                transitionDuration: `${Math.max(1, pages.length - 1) * 1700}ms`,
              } as React.CSSProperties
            }
          >
            {pages.map((src, i) => (
              <div key={src} className="relative aspect-[16/10] w-full shrink-0">
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={priority && i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  sizes="(max-width: 767px) 94vw, 560px"
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* caption */}
      <div className="flex items-center justify-between gap-3 px-2.5 pb-1 pt-3.5">
        <div className="min-w-0">
          <h2 className="truncate text-[18px] font-semibold tracking-[-0.025em] text-foreground">
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
          {owned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:bg-black/30 dark:text-[#7ee2a8]">
              <Check className="size-3" aria-hidden />
              Yours
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
              {owned ? "Open" : "Get it"}
              <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only">{name}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
