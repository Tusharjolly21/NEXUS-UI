import Image from "next/image";

/**
 * Real comments from Reddit threads about Nexus UI components, quoted as written (an ellipsis marks
 * anything left out). Two rows drift in opposite directions and never end; hovering pauses them, and
 * people who prefer reduced motion get a row they can scroll by hand instead. No images or scripts
 * are loaded from Reddit: the avatar is just the first letter of the username, and the small Reddit
 * logo marks where each comment came from.
 */

type Comment = { user: string; source: string; quote: string };

const ROW_ONE: Comment[] = [
  { user: "aspiring_abundance", source: "r/SaaS", quote: "The pumpkin smash component alone … what a perfect little detail to throw into a UI library" },
  { user: "JOvertron", source: "r/webdesign", quote: "Very cool" },
  { user: "benjaminhu", source: "Reddit", quote: "This is incredibly good! Source code, please! :)" },
  { user: "DarkBlade_12", source: "Reddit", quote: "Woahh this is soo cool!! The effect of the symbiote taking over if you stay close for too long is genuinely awesome" },
  { user: "nuestras", source: "Reddit", quote: "soooooooo nice!" },
  { user: "InformationOne8032", source: "Reddit", quote: "Very very cool!" },
];

const ROW_TWO: Comment[] = [
  { user: "Skaifessurk", source: "r/SaaS", quote: "agreed, the web needs way more goofy little interactions like that imo." },
  { user: "velvetlane1", source: "r/webdesign", quote: "yeah super creative concept tbh" },
  { user: "BonRoxz", source: "r/webdesign", quote: "That's awesome good stuff" },
  { user: "Present_Gur1911", source: "Reddit", quote: "looks cool man. I felt like I'm poisoned with venom when the cursor is all black" },
  { user: "Actual-Deal-4445", source: "Reddit", quote: "I like it man. That's what I can call a cool project" },
  { user: "NomsaMbeki-8", source: "Reddit", quote: "This would be awesome for a game!" },
];

const TONES: [string, string][] = [
  ["#5ac8fa", "#0071e3"],
  ["#ffb340", "#ff6b3d"],
  ["#7ee0a1", "#1fa463"],
  ["#d6a4ff", "#8e44ec"],
  ["#ff8fa3", "#ff375f"],
];

function tone(user: string) {
  let h = 0;
  for (const c of user) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

function Card({ c }: { c: Comment }) {
  const [from, to] = tone(c.user);
  return (
    <figure className="flex w-[300px] shrink-0 flex-col justify-between gap-5 rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] sm:w-[340px]">
      <blockquote className="text-[16px] leading-[1.5] tracking-[-0.2px] text-foreground">
        &ldquo;{c.quote}&rdquo;
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
          <span className="block truncate text-[14px] font-medium text-foreground">u/{c.user}</span>
          <span className="block text-[13px] text-muted-foreground">on {c.source}</span>
        </span>
        <Image src="/reddit-icon.png" alt="Reddit" width={24} height={24} className="ml-auto size-6 shrink-0 rounded-[7px]" />
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
            <li key={c.user} className="flex">
              <Card c={c} />
            </li>
          ))}
        </ul>
        {/* Second copy so the loop has no seam. Hidden from screen readers so nothing is read twice. */}
        <ul className="flex gap-5" aria-hidden>
          {items.map((c) => (
            <li key={c.user} className="flex">
              <Card c={c} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RedditLove() {
  return (
    <div>
      <div className="max-w-[640px]">
        <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">What people say</h2>
        <p className="mt-4 text-[18px] text-muted-foreground">
          Comments from Reddit threads about the components, quoted as written.
        </p>
      </div>
      <div className="-mx-4 mt-12 flex flex-col gap-2 sm:mx-0">
        <Row items={ROW_ONE} seconds={70} />
        <Row items={ROW_TWO} seconds={80} reverse />
      </div>
    </div>
  );
}
