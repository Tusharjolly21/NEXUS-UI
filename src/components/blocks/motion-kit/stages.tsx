import { MorphingNav } from "./morphing-nav";

/** The nav on its own reads as an empty frame on the block page, so give it a faint page under it. */
export function MorphingNavStage({ autoplay }: { autoplay?: boolean }) {
  return (
    <div className="flex min-h-[560px] flex-col bg-[#fbfbfd] dark:bg-black">
      <MorphingNav autoplay={autoplay} />
      <div
        className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center gap-4 px-6 pb-16 pt-10 text-center"
        aria-hidden="true"
      >
        <span className="h-3 w-24 rounded-full bg-black/[.06] dark:bg-white/[.08]" />
        <span className="h-10 w-full max-w-[560px] rounded-2xl bg-black/[.05] dark:bg-white/[.07]" />
        <span className="h-10 w-full max-w-[420px] rounded-2xl bg-black/[.05] dark:bg-white/[.07]" />
        <span className="mt-2 h-3 w-full max-w-[480px] rounded-full bg-black/[.04] dark:bg-white/[.06]" />
        <span className="h-3 w-full max-w-[400px] rounded-full bg-black/[.04] dark:bg-white/[.06]" />
      </div>
    </div>
  );
}
