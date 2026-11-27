"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COMMENTS, commentKey, tone, type Comment } from "@/components/home/reddit-love-data";
import { cn } from "@/lib/utils";

/** The components the wall links to: their name, a picture for the small tile, and how far to zoom into it. */
const ON: Record<string, { name: string; image: string; zoom: number }> = {
  "pumpkin-reveal": { name: "Pumpkin Reveal", image: "/posters/pumpkin-reveal.webp", zoom: 2.2 },
  "eclipse-toggle": { name: "Eclipse Toggle", image: "/og-shots/components/eclipse-toggle.jpg", zoom: 2.6 },
  "venom-button": { name: "Venom Button", image: "/og-shots/components/venom-button.jpg", zoom: 2.2 },
  "web-sling-button": { name: "Web Sling Button", image: "/og-shots/components/web-sling-button.jpg", zoom: 1.8 },
  "pull-cord": { name: "Pull Cord", image: "/og-shots/components/pull-cord.jpg", zoom: 1.3 },
};

/** One card on the homepage wall: who said it and where, the words (big when there are only a few), and the component it's about. */
function WallCard({ c }: { c: Comment }) {
  const [from, to] = tone(c.user);
  const insta = c.platform === "instagram";
  const onX = c.platform === "x";
  const words = c.excerpt ?? c.quote;
  const slug = c.on ?? c.about;
  const on = slug ? ON[slug] : undefined;
  return (
    <figure className="flex flex-col gap-4 rounded-[22px] bg-card p-[22px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_1px_2px_rgba(0,0,0,.04),0_18px_36px_-24px_rgba(0,0,0,.28)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
      <figcaption className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-[38px] shrink-0 items-center justify-center rounded-full text-[15px] font-semibold uppercase text-white"
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {c.user[0]}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-[14.5px] font-semibold tracking-[-0.01em] text-foreground">
            <span className="truncate">{insta ? c.user : onX ? `@${c.user}` : `u/${c.user}`}</span>
            {c.verified ? (
              <Image src="/images/testimonials/verified.png" alt="Verified account" width={15} height={15} className="size-[15px] shrink-0" />
            ) : null}
          </span>
          {c.source.startsWith("r/") ? <span className="mt-px block text-[13px] text-muted-foreground">on {c.source}</span> : null}
        </span>
        {insta ? (
          <Image src="/images/testimonials/instagram.png" alt="Instagram" width={22} height={22} className="ml-auto size-[22px] shrink-0" />
        ) : onX ? (
          <Image src="/images/testimonials/x.png" alt="X" width={22} height={22} className="ml-auto size-[22px] shrink-0 rounded-[6px] dark:invert" />
        ) : (
          <Image src="/reddit-icon.png" alt="Reddit" width={22} height={22} className="ml-auto size-[22px] shrink-0 rounded-[6px]" />
        )}
      </figcaption>
      <blockquote
        className={cn(
          "text-foreground",
          words.length < 36 ? "text-[21px] font-medium leading-[1.25] tracking-[-0.4px]" : "text-[15.5px] leading-[1.55] tracking-[-0.15px]",
        )}
      >
        &ldquo;{words}&rdquo;
      </blockquote>
      {on && slug ? (
        <Link
          href={`/components/${slug}`}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-foreground/[0.045] py-1.5 pl-1.5 pr-3 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.07] dark:hover:bg-white/[0.11]"
        >
          <span className="size-7 shrink-0 overflow-hidden rounded-lg bg-[#f0f0f3]">
            <Image src={on.image} alt="" width={56} height={56} sizes="28px" className="size-full object-cover" style={{ transform: `scale(${on.zoom})` }} />
          </span>
          <span>
            About <span className="font-semibold text-foreground">{on.name}</span>
          </span>
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      ) : null}
    </figure>
  );
}

/** Seconds for one full loop of each column; they differ so the columns never line up. */
const SPEEDS = [62, 74, 56];

/**
 * Every comment in columns that scroll forever, neighbours in opposite directions. The cards blur and fade as
 * they reach the top and bottom edge. Hovering a column, or focusing a link in it, stops it; with reduced
 * motion nothing moves and each column scrolls by hand instead (see .pg-wall in globals.css).
 */
function Wall({ columns, className }: { columns: number; className?: string }) {
  const buckets: Comment[][] = Array.from({ length: columns }, () => []);
  COMMENTS.forEach((c, i) => buckets[i % columns].push(c));
  return (
    <div className={cn("pg-wall relative h-[640px] gap-5 sm:h-[720px]", className)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {buckets.map((items, i) => (
        <div key={i} className="pg-wall-col -mx-2 px-2">
          <div
            className="pg-wall-track flex flex-col gap-5 pb-5"
            data-reverse={i % 2 ? "true" : undefined}
            style={{ ["--pg-wall-time" as string]: `${SPEEDS[i % SPEEDS.length]}s` }}
          >
            <ul className="flex flex-col gap-5">
              {items.map((c) => (
                <li key={commentKey(c)}>
                  <WallCard c={c} />
                </li>
              ))}
            </ul>
            {/* Second copy so the loop has no seam: hidden from screen readers and out of the tab order. */}
            <ul className="flex flex-col gap-5" aria-hidden inert>
              {items.map((c) => (
                <li key={commentKey(c)}>
                  <WallCard c={c} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <span aria-hidden className="pg-wall-edge" data-edge="top">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span aria-hidden className="pg-wall-edge" data-edge="bottom">
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

/** How many columns fit: three on desktop, two on tablets, one on phones (the same breakpoints as Tailwind's lg and md). */
function useColumns() {
  const [columns, setColumns] = useState<1 | 2 | 3 | null>(null);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)");
    const update = () => setColumns(lg.matches ? 3 : md.matches ? 2 : 1);
    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);
  return columns;
}

/** True once the element has come within `margin` of the screen, and stays true. */
function useNearScreen(margin: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, near] as const;
}

/**
 * The comment wall, drawn in the browser as one set of columns for the screen it is on, and only once it is
 * about to scroll into view. Drawing it on the server meant all three column layouts (only one of them ever shows)
 * went into the page twice, once as HTML and once as data, about 600 KB that every visitor had to download and
 * parse before anything else. The reserved box keeps the page from jumping when the wall arrives.
 */
export function LoveWall() {
  const columns = useColumns();
  const [ref, near] = useNearScreen("600px 0px");
  return (
    <div ref={ref} className="mt-10 h-[640px] sm:h-[720px] md:mt-12 lg:mt-14">
      {columns && near ? <Wall columns={columns} className="grid" /> : null}
    </div>
  );
}
