import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Play } from "lucide-react";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";
import { cn } from "@/lib/utils";
import { templateName, templateTagline } from "./template-card";
import { ProMark } from "@/components/pro/pro-access";

/**
 * A template as one line of the index view: a small thumbnail, the name and what it is for, its
 * category, whether it is free, and the two actions. Built for scanning many at once.
 */
export function TemplateRow({
  tmpl,
  isPro = false,
  priority = false,
}: {
  tmpl: MarketplaceTemplate;
  isPro?: boolean;
  priority?: boolean;
}) {
  const name = templateName(tmpl);
  const tagline = templateTagline(tmpl);
  const href = `/templates/${tmpl.slug}`;
  const unlocked = isPro || !tmpl.premium;

  return (
    <article className="pg-glass group relative flex items-center gap-4 rounded-[22px] bg-card p-2.5 pr-4 transition-colors hover:bg-card/80 sm:gap-5">
      <div
        aria-hidden
        className="relative aspect-[16/10] w-[112px] shrink-0 overflow-hidden rounded-[14px] bg-muted shadow-[0_0_0_1px_rgba(23,23,28,0.08)] sm:w-[168px]"
      >
        {tmpl.previewImages ? (
          <Image
            src={tmpl.previewImages.hero}
            alt=""
            fill
            priority={priority}
            sizes="168px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[16px] font-semibold tracking-[-0.02em] text-foreground sm:text-[18px]">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[22px] [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-offset-2 [&:focus-visible]:after:outline-ring"
          >
            {name}
          </Link>
        </h2>
        <p className="truncate text-[13.5px] text-muted-foreground">{tagline ?? tmpl.category}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground/80 md:hidden">{tmpl.category}</p>
      </div>

      <p className="hidden w-[150px] shrink-0 truncate text-[13.5px] text-muted-foreground md:block">{tmpl.category}</p>

      {tmpl.premium && !unlocked ? (
        <ProMark className="hidden shrink-0 py-1 text-[12px] sm:inline-flex" />
      ) : (
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-tint-mint px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] sm:inline-flex dark:text-[#7ee2a8]">
          {!tmpl.premium ? (
            "Free"
          ) : (
            <>
              <Check className="size-3" aria-hidden />
              Unlocked
            </>
          )}
        </span>
      )}

      <div className="relative z-20 hidden shrink-0 items-center gap-1.5 sm:flex">
        <Link
          href={`/template-preview/${tmpl.slug}`}
          className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-background px-3.5 text-[13px] font-semibold text-foreground shadow-[0_0_0_1px_rgba(23,23,28,0.1)] transition-colors hover:bg-muted"
        >
          <Play className="size-3 fill-current" aria-hidden />
          Live
          <span className="sr-only">preview of {name}</span>
        </Link>
        <Link
          href={href}
          className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-full bg-foreground px-3.5 text-[13px] font-semibold text-background transition-opacity hover:opacity-85"
        >
          {unlocked ? "Open" : "Details"}
          <ArrowUpRight className="size-3.5" aria-hidden />
          <span className="sr-only">{name}</span>
        </Link>
      </div>
    </article>
  );
}
