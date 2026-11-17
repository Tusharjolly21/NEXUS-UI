import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Real comments from Reddit threads, Instagram and X about Nexus UI components, quoted as written (an
 * ellipsis marks anything left out). On the homepage they fill columns that scroll forever, neighbours in opposite
 * directions; hovering pauses a column, and people who prefer reduced motion get columns they scroll by hand instead. No images or scripts
 * are loaded from Reddit, Instagram or X: the avatar is just the first letter of the username, and the
 * small Reddit, Instagram or X logo marks where each comment came from. The blue badge shows only on an
 * account that Instagram or X itself shows as verified.
 */

export type Comment = {
  user: string;
  source: string;
  quote: string;
  /** Defaults to Reddit. */
  platform?: "instagram" | "x";
  verified?: boolean;
  /** Only needed when one person has more than one comment here, so each card keeps its own key. */
  id?: string;
  /** A shorter cut of a long comment for the smaller cards (pricing deck, components page), with an ellipsis where words are left out. */
  excerpt?: string;
  /** One sentence of the comment for the tightest spots (the upgrade dialog), with an ellipsis where words are left out. */
  line?: string;
  /** Slug of the component the comment is about, so that component's page can show it. */
  about?: string;
  /** The part of the comment about that component, for its page. */
  aboutCut?: string;
  /**
   * Slug of the component the comment talks about, for the "About" link on the homepage wall only (unlike
   * `about`, it doesn't put the comment on that component's page).
   */
  on?: string;
};

/** A stable key for a comment: its id if it has one, otherwise the username. */
export const commentKey = (c: Comment) => c.id ?? c.user;

const ROW_ONE: Comment[] = [
  { user: "aspiring_abundance", source: "r/SaaS", quote: "The pumpkin smash component alone deserves $79 dollars … what a perfect little detail to throw into a UI library", on: "pumpkin-reveal" },
  {
    user: "itsmeekaran",
    id: "itsmeekaran-moon-toggle",
    source: "X",
    quote:
      "This is honestly one of the cleanest toggle interactions I\u2019ve seen \u{1F319} The drag-the-moon detail with the starry background makes it feel so premium compared to a basic switch. Just checked out nexus-ui.com too, love that you\u2019re building a whole library of components like this. Bookmarked it for my next project \u{1F525}",
    excerpt:
      "This is honestly one of the cleanest toggle interactions I\u2019ve seen \u{1F319} \u2026 love that you\u2019re building a whole library of components like this. Bookmarked it for my next project \u{1F525}",
    line: "\u2026love that you\u2019re building a whole library of components like this. Bookmarked it for my next project \u{1F525}",
    about: "eclipse-toggle",
    aboutCut:
      "This is honestly one of the cleanest toggle interactions I\u2019ve seen \u{1F319} The drag-the-moon detail with the starry background makes it feel so premium compared to a basic switch. \u2026 Bookmarked it for my next project \u{1F525}",
    platform: "x",
    verified: true,
  },
  { user: "JOvertron", source: "r/webdesign", quote: "Very cool" },
  { user: "vrangnarr", source: "r/MotionDesign", quote: "Brilliant, love it!" },
  { user: "benjaminhu", source: "Reddit", quote: "This is incredibly good! Source code, please! :)" },
  { user: "DarkBlade_12", source: "Reddit", quote: "Woahh this is soo cool!! The effect of the symbiote taking over if you stay close for too long is genuinely awesome", on: "venom-button" },
  { user: "nuestras", source: "Reddit", quote: "soooooooo nice!" },
  { user: "InformationOne8032", source: "Reddit", quote: "Very very cool!" },
  { user: "dfnslvtr", source: "r/MotionDesign", quote: "ok the rope is satisfying", on: "pull-cord" },
  {
    user: "liuxueqi0044",
    source: "r/creativecoding",
    quote: "The refill meter turns this into a tiny game \u{1F602} I'd forget what I came to click and start rationing my web fluid instead.",
    on: "web-sling-button",
  },
  { user: "ssmlee04", source: "Reddit", quote: "Hi! Your website looks great" },
];

const ROW_TWO: Comment[] = [
  { user: "itsmeekaran", source: "X", quote: "This really looks cool, especially the attention to physics and smooth animations. Love seeing people build things like this", platform: "x", verified: true },
  { user: "noahelhadedy", source: "Instagram", quote: "The library looks really solid\u{1F525}", platform: "instagram", verified: true },
  { user: "Skaifessurk", source: "r/SaaS", quote: "agreed, the web needs way more goofy little interactions like that imo." },
  { user: "velvetlane1", source: "r/webdesign", quote: "yeah super creative concept tbh" },
  { user: "ds1008", source: "r/SaaS", quote: "Pretty sick UI kit" },
  { user: "BonRoxz", source: "r/webdesign", quote: "That's awesome good stuff" },
  { user: "Present_Gur1911", source: "Reddit", quote: "looks cool man. I felt like I'm poisoned with venom when the cursor is all black", on: "venom-button" },
  { user: "Actual-Deal-4445", source: "Reddit", quote: "I like it man. That's what I can call a cool project" },
  { user: "NomsaMbeki-8", source: "Reddit", quote: "This would be awesome for a game!" },
  { user: "No_Speech8210", source: "r/SideProject", quote: "Really cool concept man, the creativity is unreal" },
  { user: "webdesign_786", source: "Instagram", quote: "Fabulous work \u{1F90D}", platform: "instagram", verified: true },  {
    user: "Magnificenceure-JNR",
    source: "Reddit",
    quote: "Hey! I saw your post about creating your own end-credits scene with Doomsday x Nexus UI. That creativity is awesome!",
  },
];

const TONES: [string, string][] = [
  ["#5ac8fa", "#0071e3"],
  ["#ffb340", "#ff6b3d"],
  ["#7ee0a1", "#1fa463"],
  ["#d6a4ff", "#8e44ec"],
  ["#ff8fa3", "#ff375f"],
];

/** The avatar's two gradient colours, fixed per username. */
export function tone(user: string) {
  let h = 0;
  for (const c of user) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

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

function SourcePill({ src, label, invert }: { src: string; label: string; invert?: boolean }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.045] py-1.5 pl-1.5 pr-3 text-[14px] font-medium text-foreground dark:bg-white/[0.07]">
      <Image src={src} alt="" width={18} height={18} className={cn("size-[18px] rounded-[5px]", invert && "dark:invert")} />
      {label}
    </li>
  );
}

/** Every comment, in the homepage's order. The pricing page's deck reads the same list. */
export const COMMENTS: Comment[] = [...ROW_ONE, ...ROW_TWO];

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
      <Wall columns={1} className="mt-10 grid md:hidden" />
      <Wall columns={2} className="mt-12 hidden md:grid lg:hidden" />
      <Wall columns={3} className="mt-14 hidden lg:grid" />
    </div>
  );
}
