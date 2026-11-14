import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Real comments from Reddit threads, Instagram and X about Nexus UI components, quoted as written (an
 * ellipsis marks anything left out). Two rows drift in opposite directions and never end; hovering pauses them, and
 * people who prefer reduced motion get a row they can scroll by hand instead. No images or scripts
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
};

/** A stable key for a comment: its id if it has one, otherwise the username. */
export const commentKey = (c: Comment) => c.id ?? c.user;

const ROW_ONE: Comment[] = [
  { user: "aspiring_abundance", source: "r/SaaS", quote: "The pumpkin smash component alone deserves $79 dollars … what a perfect little detail to throw into a UI library" },
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
  { user: "DarkBlade_12", source: "Reddit", quote: "Woahh this is soo cool!! The effect of the symbiote taking over if you stay close for too long is genuinely awesome" },
  { user: "nuestras", source: "Reddit", quote: "soooooooo nice!" },
  { user: "InformationOne8032", source: "Reddit", quote: "Very very cool!" },
  { user: "dfnslvtr", source: "r/MotionDesign", quote: "ok the rope is satisfying" },
  {
    user: "liuxueqi0044",
    source: "r/creativecoding",
    quote: "The refill meter turns this into a tiny game \u{1F602} I'd forget what I came to click and start rationing my web fluid instead.",
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
  { user: "Present_Gur1911", source: "Reddit", quote: "looks cool man. I felt like I'm poisoned with venom when the cursor is all black" },
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

function Row({ items, seconds, reverse }: { items: Comment[]; seconds: number; reverse?: boolean }) {
  return (
    <div
      className="pg-marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
    >
      <div
        className="pg-marquee-track flex w-max gap-5 py-3 pr-5"
        data-reverse={reverse ? "true" : undefined}
        style={{ ["--pg-marquee-time" as string]: `${seconds}s` }}
      >
        <ul className="flex gap-5">
          {items.map((c) => (
            <li key={commentKey(c)} className="flex">
              <Card c={c} />
            </li>
          ))}
        </ul>
        {/* Second copy so the loop has no seam. Hidden from screen readers so nothing is read twice. */}
        <ul className="flex gap-5" aria-hidden>
          {items.map((c) => (
            <li key={commentKey(c)} className="flex">
              <Card c={c} />
            </li>
          ))}
        </ul>
      </div>
    </div>
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
      </div>
      <div className="-mx-4 mt-12 flex flex-col gap-2 sm:mx-0">
        <Row items={ROW_ONE} seconds={70} />
        <Row items={ROW_TWO} seconds={80} reverse />
      </div>
    </div>
  );
}
