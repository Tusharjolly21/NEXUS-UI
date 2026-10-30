import { TRAIL } from "./data";
import { Lightfall, type LightfallPalette } from "./lightfall";

const TRAIL_PALETTE: LightfallPalette = { bg: "#000000", haze: "#ff7a2f", c: ["#ff7a2f", "#ffc58a", "#ff4d2e", "#fff4e6"] };

export function Trail() {
  return (
    <section aria-labelledby="ag-trail" className="relative h-[clamp(640px,92vh,860px)] w-full">
      <Lightfall palette={TRAIL_PALETTE} height="100%">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(#000,transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_34%_at_50%_16%,rgba(0,0,0,.78),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[linear-gradient(transparent,rgba(0,0,0,.92)_70%)]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-[1180px] flex-col items-center px-5 pt-16 text-center sm:px-8 sm:pt-20">
          <h2
            id="ag-trail"
            className="max-w-[16ch] text-[clamp(36px,6vw,68px)] font-semibold leading-[1] tracking-[-0.05em] text-[#f3efe9] [text-shadow:0_4px_40px_rgba(0,0,0,.8)]"
          >
            {TRAIL.title}
          </h2>
          <p className="mt-4 max-w-[48ch] text-[17px] leading-[1.55] text-[#d9d3cb] [text-shadow:0_2px_20px_rgba(0,0,0,.9)]">
            {TRAIL.body}
          </p>
        </div>
        <dl className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-5 pb-14 sm:grid-cols-3 sm:px-8">
          {TRAIL.stats.map((e) => (
            <div key={e.label} className="flex flex-col gap-1 border-l border-white/15 pl-4">
              <dt className="order-2 text-[14px] leading-[1.4] text-[#a39c94]">{e.label}</dt>
              <dd className="order-1 text-[34px] font-semibold tabular-nums tracking-[-0.04em] text-[#f3efe9]">
                {e.value}
              </dd>
            </div>
          ))}
        </dl>
      </Lightfall>
    </section>
  );
}
