"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { AppIcon } from "./app-icon";
import { LiveSky } from "./sky/live-sky";
import { SkyBackdrop } from "./sky/sky-backdrop";
import { PillButton, Reveal, TextLink } from "./ui";

/** Pause between the closing section coming into view and the sky turning to day. */
const DAWN_DELAY_MS = 900;

/**
 * The closing call to action. It opens on a starry night; once it is in view the sky brightens to a sunny day
 * behind the app icon and the download buttons, and returns to night when you scroll away.
 */
export function Closing() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [dawned, setDawned] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setDawned(true), DAWN_DELAY_MS);
    return () => {
      clearTimeout(id);
      setDawned(false);
    };
  }, [inView]);

  const condition = dawned ? "sunny" : "night";
  return (
    <section ref={ref} className="relative overflow-clip px-5 py-40 text-center text-white sm:py-52">
      <SkyBackdrop condition={condition} />
      <LiveSky mode={condition} density={0.6} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 50% at 50% 50%, rgba(8,16,32,.24), transparent 75%)" }}
      />
      <div className="relative">
        <Reveal className="mx-auto mb-7 w-fit">
          <AppIcon size={96} style={{ filter: "drop-shadow(0 22px 36px rgba(4,12,44,.4))" }} />
        </Reveal>
        <h2 className="m-0 font-semibold leading-[1.02] tracking-[-0.045em]" style={{ fontSize: "clamp(44px, 7vw, 88px)", textShadow: "0 2px 30px rgba(0,0,0,.12)" }}>
          Know before
          <br />
          you go.
        </h2>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
          <PillButton light>Download for iPhone</PillButton>
          <TextLink light>Get it for Android</TextLink>
        </div>
      </div>
    </section>
  );
}
