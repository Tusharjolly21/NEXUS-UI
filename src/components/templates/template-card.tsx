import Image from "next/image";
import Link from "next/link";
import { Check, Play } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";
import { cn } from "@/lib/utils";

/** "Helix — AI Workflow Intelligence" → "Helix". */
export function templateName(t: MarketplaceTemplate) {
  return t.title.split(" — ")[0];
}

/** "Helix — AI Workflow Intelligence" → "AI Workflow Intelligence", or null when the title has no tagline. */
export function templateTagline(t: MarketplaceTemplate) {
  return t.title.split(" — ")[1] ?? null;
}

/** A screenshot in a light browser window: three dots, then the page. */
export function BrowserFrame({
  src,
  alt,
  aspect = "aspect-[16/10]",
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  aspect?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden bg-card", className)}>
      <div aria-hidden className="flex gap-1.5 border-b border-border/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff605c]" />
        <span className="size-2.5 rounded-full bg-[#ffbd44]" />
        <span className="size-2.5 rounded-full bg-[#00ca4e]" />
      </div>
      <div className={cn("relative overflow-hidden bg-muted", aspect)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * A template in the gallery: its real screenshot in a browser frame, the name, and the two things
 * people do next (watch it live, or go get it).
 */
export function TemplateCard({
  tmpl,
  owned = false,
  wide = false,
  priority = false,
  headingLevel = "h2",
}: {
  tmpl: MarketplaceTemplate;
  owned?: boolean;
  wide?: boolean;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const name = templateName(tmpl);
  const href = `/templates/${tmpl.slug}`;

  return (
    <article
      className={cn(
        "pg-float group relative overflow-hidden rounded-tile bg-card transition-transform duration-150 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        wide && "md:col-span-2",
      )}
    >
      {tmpl.previewImages ? (
        <Link href={href} tabIndex={-1} aria-hidden className="block">
          <BrowserFrame
            src={tmpl.previewImages.hero}
            alt=""
            aspect={wide ? "aspect-[16/10] md:aspect-[16/7]" : "aspect-[16/10]"}
            sizes={wide ? "(max-width: 767px) 100vw, 1152px" : "(max-width: 767px) 100vw, 566px"}
            priority={priority}
          />
        </Link>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <Heading
            className={cn(
              "font-semibold text-foreground",
              wide ? "text-[24px] tracking-[-0.6px]" : "text-[18px] tracking-[-0.4px]",
            )}
          >
            <Link href={href} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              {name}
            </Link>
          </Heading>
          <p className="text-[14px] text-muted-foreground">
            {tmpl.category}
            {owned ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-tint-mint px-2 py-0.5 text-[12px] font-semibold text-[#126b3a] dark:text-[#7ee2a8]">
                <Check className="size-3" aria-hidden />
                Yours
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/template-preview/${tmpl.slug}`} className={pillClassName("white", "sm", "h-[40px]")}>
            <Play className="size-3.5" aria-hidden />
            Live preview
            <span className="sr-only">of {name}</span>
          </Link>
          <Link href={href} className={pillClassName("ink", "sm", "h-[40px]")}>
            {owned ? "Open" : "Get template"}
            <span className="sr-only">{name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
