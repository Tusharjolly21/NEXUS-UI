import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { COMMENTS, commentKey, tone, type Comment } from "@/components/home/reddit-love-data";
import { LoveWall } from "@/components/home/love-wall";

export { COMMENTS, commentKey, tone, type Comment };

/**
 * Real comments from Reddit threads, Instagram and X about Nexus UI components, quoted as written (an
 * ellipsis marks anything left out). On the homepage they fill columns that scroll forever, neighbours in opposite
 * directions; hovering pauses a column, and people who prefer reduced motion get columns they scroll by hand instead. No images or scripts
 * are loaded from Reddit, Instagram or X: the avatar is just the first letter of the username, and the
 * small Reddit, Instagram or X logo marks where each comment came from. The blue badge shows only on an
 * account that Instagram or X itself shows as verified.
 */

/** One comment card. `className` can override the width (the marquee rows use the default); `short` shows the excerpt when there is one. */
export function Card({ c, className, short = false }: { c: Comment; className?: string; short?: boolean }) {
  const [from, to] = tone(c.user);
  const insta = c.platform === "instagram";
  const onX = c.platform === "x";
  return (
    <figure
      className={cn(
        "flex w-[300px] shrink-0 flex-col justify-between gap-5 rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] sm:w-[340px]",
        className,
      )}
    >
      <blockquote className="text-[16px] leading-[1.5] tracking-[-0.2px] text-foreground">
        &ldquo;{short ? (c.excerpt ?? c.quote) : c.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold uppercase text-white"
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {c.user[0]}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
            <span className="truncate">{insta ? c.user : onX ? `@${c.user}` : `u/${c.user}`}</span>
            {c.verified ? (
              <Image src="/images/testimonials/verified.png" alt="Verified account" width={16} height={16} className="size-4 shrink-0" />
            ) : null}
          </span>
          {c.source.startsWith("r/") ? <span className="block text-[13px] text-muted-foreground">on {c.source}</span> : null}
        </span>
        {insta ? (
          <Image src="/images/testimonials/instagram.png" alt="Instagram" width={24} height={24} className="ml-auto size-6 shrink-0" />
        ) : onX ? (
          <Image src="/images/testimonials/x.png" alt="X" width={24} height={24} className="ml-auto size-6 shrink-0 rounded-[7px] dark:invert" />
        ) : (
          <Image src="/reddit-icon.png" alt="Reddit" width={24} height={24} className="ml-auto size-6 shrink-0 rounded-[7px]" />
        )}
      </figcaption>
    </figure>
  );
}


function SourcePill({ src, label, invert }: { src: string; label: string; invert?: boolean }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.045] py-1.5 pl-1.5 pr-3 text-[14px] font-medium text-foreground dark:bg-white/[0.07]">
      <Image src={src} alt="" width={18} height={18} className={cn("size-[18px] rounded-[5px]", invert && "dark:invert")} />
      {label}
    </li>
  );
}


/** The comment someone left about one component, if there is one. */
export const commentAbout = (slug: string) => COMMENTS.find((c) => c.about === slug);

/** The comment used where a single line of social proof fits (the upgrade dialog). */
export const LINE_COMMENT = COMMENTS.find((c) => c.line);

/**
 * A small quote for side panels and dialogs: the words, then a single line with the person, the
 * verified badge and where they said it. `text` picks how much of the comment to show.
 */
export function MiniQuote({
  c,
  text = "excerpt",
  className,
  onNavigate,
}: {
  c: Comment;
  text?: "full" | "excerpt" | "line" | "about";
  className?: string;
  /** Runs when the "see what people think" link is followed, so a dialog can close itself. */
  onNavigate?: () => void;
}) {
  const [from, to] = tone(c.user);
  const insta = c.platform === "instagram";
  const onX = c.platform === "x";
  const words =
    text === "line" ? (c.line ?? c.excerpt ?? c.quote) : text === "about" ? (c.aboutCut ?? c.quote) : text === "excerpt" ? (c.excerpt ?? c.quote) : c.quote;
  return (
    <figure className={cn("rounded-2xl bg-foreground/[0.035] p-3.5 dark:bg-white/[0.05]", className)}>
      <blockquote className="text-[13.5px] leading-[1.5] text-foreground/90">&ldquo;{words}&rdquo;</blockquote>
      <figcaption className="mt-2.5 flex items-center gap-2">
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold uppercase text-white"
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {c.user[0]}
        </span>
        <span className="flex min-w-0 items-center gap-1 text-[12.5px] font-medium text-foreground">
          <span className="truncate">{insta ? c.user : onX ? `@${c.user}` : `u/${c.user}`}</span>
          {c.verified ? (
            <Image src="/images/testimonials/verified.png" alt="Verified account" width={14} height={14} className="size-3.5 shrink-0" />
          ) : null}
        </span>
        {insta ? (
          <Image src="/images/testimonials/instagram.png" alt="Instagram" width={18} height={18} className="ml-auto size-[18px] shrink-0" />
        ) : onX ? (
          <Image src="/images/testimonials/x.png" alt="X" width={18} height={18} className="ml-auto size-[18px] shrink-0 rounded-[5px] dark:invert" />
        ) : (
          <Image src="/reddit-icon.png" alt="Reddit" width={18} height={18} className="ml-auto size-[18px] shrink-0 rounded-[5px]" />
        )}
      </figcaption>
      <Link
        href={`/#${LOVE_ID}`}
        onClick={onNavigate}
        className="mt-3 inline-flex text-[12.5px] font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        See what people think of us
      </Link>
    </figure>
  );
}

/** Anchor of the "What people say" section on the home page, where every comment is. */
export const LOVE_ID = "what-people-say";

export function RedditLove() {
  return (
    <div id={LOVE_ID} className="scroll-mt-28">
      <div className="max-w-[640px]">
        <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">What people say</h2>
        <p className="mt-4 text-[18px] text-muted-foreground">
          Comments from Reddit, Instagram and X on the components, quoted as written.
        </p>
        <ul aria-hidden className="mt-5 flex flex-wrap gap-2">
          <SourcePill src="/reddit-icon.png" label="Reddit" />
          <SourcePill src="/images/testimonials/x.png" label="X" invert />
          <SourcePill src="/images/testimonials/instagram.png" label="Instagram" />
        </ul>
      </div>
      <LoveWall />
    </div>
  );
}
