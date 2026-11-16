import Link from "next/link";
import { COMMENTS, Card, LOVE_ID, commentKey, type Comment } from "@/components/home/reddit-love";

/** Keys of the comments shown, in order (see commentKey). All three are on the homepage too, quoted as written. */
const PICKS = ["aspiring_abundance", "itsmeekaran-moon-toggle", "ds1008"];

/**
 * A short row of real comments in the middle of the /components wall (one full-width cell, two rows tall, three on a phone), for visitors without Pro. It is
 * plain content: no popup, no timer, no motion. On a phone the three cards scroll sideways; from
 * desktop width up they sit side by side.
 */
export function ComponentsProofRow() {
  const picks = PICKS.map((k) => COMMENTS.find((c) => commentKey(c) === k)).filter((c): c is Comment => !!c);
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="components-proof" className="flex h-full flex-col justify-center">
      <h2 id="components-proof" className="text-[17px] font-semibold text-foreground">
        What people say about them
      </h2>
      <p className="mt-1 text-[14px] text-muted-foreground">Comments from Reddit and X, quoted as written.</p>
      <ul
        tabIndex={0}
        aria-label="Comments, scroll sideways for more"
        className="-mx-4 -mb-5 mt-4 flex scroll-px-4 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-9 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:mb-0 lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {picks.map((c) => (
          <li key={commentKey(c)} className="flex w-[82%] shrink-0 snap-start sm:w-[340px] lg:w-auto">
            <Card c={c} short className="w-full sm:w-full" />
          </li>
        ))}
      </ul>
      <Link
        href={`/#${LOVE_ID}`}
        className="mt-4 self-start text-[14px] font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        See what people think of us
      </Link>
    </section>
  );
}
