import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CodeBlock } from "@/components/code-block";
import { DEFAULT_HEADER } from "@/components/code-block/code-block";
import { CopyButton } from "@/components/nx-icons/copy-button";
import { SoundDemo } from "@/components/nx-icons/sound-demo";
import { RainbowWord } from "@/components/site";
import { ICONS } from "@/lib/icons/catalog";
import { FREE_ICON_COUNT, PRO_ICON_COUNT } from "@/lib/icons/count";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Add Sound to Animated Icons in React",
  description: `How to add a synthesised sound to any of the ${ICONS.length} animated React icons: copy the sound engine and an icon's score, call one function. No audio files, no dependencies.`,
  alternates: { canonical: "/icons/sounds" },
});

const code = (s: string) => <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">{s}</code>;

const HOVER_EXAMPLE = `"use client";

import { BellIcon } from "@/components/icons/bell";
import * as bell from "@/components/icons/sounds/bell";
import { playIconScore } from "@/components/icons/sound-engine";

export function NotificationsButton() {
  return (
    <button
      type="button"
      aria-label="Notifications"
      onPointerEnter={() => playIconScore(bell)}   // plays with the icon's own animation
      onClick={() => playIconScore(bell)}          // and again on tap (touch screens have no hover)
    >
      <BellIcon size={24} />
    </button>
  );
}`;

const SPEED_EXAMPLE = `// Keep picture and sound in step: pass the same speed to both.
<BellIcon speed={1.5} />
playIconScore(bell, { speed: 1.5 });

// Quieter or louder, on top of the icon's own measured level:
playIconScore(bell, { volume: 0.5 });`;

const SWITCH_EXAMPLE = `"use client";

import { useSyncExternalStore } from "react";
import { getIconSoundsEnabled, setIconSoundsEnabled, subscribeIconSounds } from "@/components/icons/sound-engine";

export function SoundSwitch() {
  const on = useSyncExternalStore(subscribeIconSounds, getIconSoundsEnabled, () => true);
  return (
    <button type="button" aria-pressed={on} onClick={() => setIconSoundsEnabled(!on)}>
      Sound {on ? "on" : "off"}
    </button>
  );
}
// The choice is remembered in the browser. playIconScore() stays silent while it is off.`;

const VANILLA_EXAMPLE = `// No React needed: a score is just a module with length, level and play().
import * as coin from "./sounds/coin";
import { playIconScore } from "./sound-engine";

document.querySelector("#pay")?.addEventListener("click", () => playIconScore(coin));`;

const LOOKS_EXAMPLE = `import { mercury } from "@/components/icons/material-sounds";
import { playIconScore } from "@/components/icons/sound-engine";

// when the visitor picks the look: pouring metal, the blob landing, a ring as it sets
playIconScore(mercury.switch);

// while an icon wearing the look is hovered, on top of the icon's own sound
playIconScore(mercury.hover);

// liquid and glass work the same way: liquid.switch, liquid.hover, glass.switch, glass.hover`;

const REDUCED_EXAMPLE = `// Optional: stay quiet for visitors who asked the system for less.
const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!quiet) playIconScore(bell);`;

const STEPS = [
  { title: "Copy the engine", body: "Two small files do all the work. Save sound-engine.ts and sound-kit.ts side by side, for example in components/icons/. They have no dependencies." },
  { title: "Copy the icon's sound", body: "Every icon page has a Sound section with that icon's score. Save it as components/icons/sounds/<icon>.ts, next to sound-kit.ts. Take only the icons you use." },
  { title: "Call playIconScore", body: "Call it from a click, tap or hover handler, passing the score. That is the whole integration." },
];

export default async function SoundsGuidePage() {
  const dir = path.join(process.cwd(), "src/components/nx-icons");
  const engine = await readFile(path.join(dir, "sound-engine.ts"), "utf8");
  const kit = await readFile(path.join(dir, "sound-kit.ts"), "utf8");
  const looks = await readFile(path.join(dir, "material-sounds.ts"), "utf8");

  const faq: { q: string; a: string }[] = [
    { q: "Are the sounds free?", a: `The sound engine, the note helpers and this guide are free. An icon's sound score comes with the icon: free for the ${FREE_ICON_COUNT} free icons, and part of Pro for the other ${PRO_ICON_COUNT}. You can hear every icon's sound on its page and on the icons page first.` },
    { q: "Do the icons need sound to work?", a: "No. Sound is optional and separate: the animated icon is one file, and the sound is a second, optional file per icon. Without it, nothing is loaded or played." },
    { q: "Why do I hear nothing the first time?", a: "Browsers only let a page make sound after the visitor has interacted with it (a click, a tap or a key press). Call playIconScore from an event handler, and the first interaction wakes the audio engine." },
    { q: "Does it work on iPhones and Android?", a: "Yes, after a tap. Hover does not exist on touch screens, so also play the sound on click. On iPhones, sounds follow the ringer volume." },
    { q: "How big is it?", a: "The engine is about 4 KB of TypeScript. Each icon's score is under 1 KB. There are no audio files, so nothing is downloaded." },
    { q: "Can I change a sound?", a: "Yes. A score is a short list of notes placed on moments of the icon's animation, written with a handful of helpers (ding, plink, blip, swish, tick, thud, puff). Edit the numbers, or write your own." },
    { q: "Is it accessible?", a: "Sound should never be the only signal. Keep every action visible, give visitors a switch (setIconSoundsEnabled), do not play anything on page load, and keep volumes modest." },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Add sound to an animated React icon",
      step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Icons", item: `${siteConfig.url}/icons` },
        { "@type": "ListItem", position: 2, name: "Sounds", item: `${siteConfig.url}/icons/sounds` },
      ],
    },
  ];

  return (
    <>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}

      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-muted-foreground">
            <Link href="/icons" className="hover:text-foreground">Icons</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">Sounds</span>
          </nav>
          <h1 className="pg-display mt-5 max-w-[900px] text-[clamp(40px,6.6vw,72px)] leading-[1.02] text-foreground">
            Add <RainbowWord>sound</RainbowWord> to your icons.
          </h1>
          <p className="mt-5 max-w-[660px] text-[19px] leading-[1.55] text-muted-foreground">
            Every one of the {ICONS.length} icons has a sound of its own, scored note by note against its animation. There are no audio files: it is all
            synthesised in the browser. Copy the engine once, copy the sounds you want, and call one function.
          </p>
        </div>
      </section>

      <section aria-labelledby="hear" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="hear" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">Hear a few first</h2>
          <p className="mt-2 max-w-[640px] text-[16px] text-muted-foreground">Press an icon to play it with its sound. Every icon page has its own preview, and the Sound switch on the icons page plays the whole set.</p>
          <div className="mt-6">
            <SoundDemo />
          </div>
        </div>
      </section>

      <section aria-labelledby="steps" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="steps" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">Three steps</h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                <span className="grid size-8 place-items-center rounded-full bg-foreground text-[14px] font-semibold text-background">{i + 1}</span>
                <h3 className="mt-4 text-[17px] font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-[700px] text-[15.5px] text-muted-foreground">
            Using Next.js? Put the files in a client component folder: the handlers that call {code("playIconScore")} need {code('"use client"')}. Nothing
            else is required: no provider, no setup call, no audio assets.
          </p>
        </div>
      </section>

      <section aria-labelledby="engine" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="engine" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">1. The engine</h2>
            <CopyButton text={engine} label="Copy sound-engine.ts" />
          </div>
          <p className="mt-2 max-w-[700px] text-[16px] text-muted-foreground">
            Creates one shared audio context, draws notes and bursts of noise, remembers the visitor&apos;s on/off choice and exposes {code("playIconScore")}.
          </p>
          <div className="mt-6">
            <CodeBlock code={engine} language="ts" theme="dark" header={{ ...DEFAULT_HEADER, title: "sound-engine.ts" }} hoverHighlight={false} enableSound={false} />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[20px] font-semibold text-foreground">The note helpers</h3>
            <CopyButton text={kit} label="Copy sound-kit.ts" />
          </div>
          <p className="mt-2 max-w-[700px] text-[16px] text-muted-foreground">
            The small vocabulary every score is written in: {code("ding")}, {code("plink")}, {code("blip")}, {code("swish")}, {code("tick")}, {code("thud")} and {code("puff")}, plus note names.
          </p>
          <div className="mt-6">
            <CodeBlock code={kit} language="ts" theme="dark" header={{ ...DEFAULT_HEADER, title: "sound-kit.ts" }} hoverHighlight={false} enableSound={false} />
          </div>
        </div>
      </section>

      <section aria-labelledby="use" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="use" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">2 and 3. Add a sound and play it</h2>
          <p className="mt-2 max-w-[700px] text-[16px] text-muted-foreground">
            Copy the score from the icon&apos;s page (for example <Link href="/icons/bell" className="text-foreground underline underline-offset-4">bell</Link>) into{" "}
            {code("components/icons/sounds/bell.ts")}, then play it from a handler.
          </p>
          <div className="mt-6">
            <CodeBlock code={HOVER_EXAMPLE} language="tsx" theme="dark" header={{ ...DEFAULT_HEADER, title: "notifications-button.tsx" }} hoverHighlight={false} enableSound={false} />
          </div>
        </div>
      </section>

      <section aria-labelledby="looks" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="looks" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">The liquid looks have a sound too</h2>
            <CopyButton text={looks} label="Copy material-sounds.ts" />
          </div>
          <p className="mt-2 max-w-[700px] text-[16px] text-muted-foreground">
            Mercury, Liquid and Glass each have two sounds in the same format as an icon&apos;s: a short layer for hovering an icon that wears the look, and a
            longer one for the moment it is picked. Mercury is a bead of metal rolling and ringing, Liquid is bloops and drips, Glass is a clink and a thin
            ring. Save the file beside {code("sound-kit.ts")}. On the icons page, picking a liquid look plays its sound and turns Sound on.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CodeBlock code={LOOKS_EXAMPLE} language="ts" theme="dark" header={{ ...DEFAULT_HEADER, title: "looks.ts" }} hoverHighlight={false} enableSound={false} />
            <CodeBlock code={looks} language="ts" theme="dark" header={{ ...DEFAULT_HEADER, title: "material-sounds.ts" }} hoverHighlight={false} enableSound={false} />
          </div>
        </div>
      </section>

      <section aria-labelledby="more" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="more" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">Patterns you will want</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            {[
              ["Match the icon's speed", SPEED_EXAMPLE, "speed.tsx", "tsx"],
              ["Give visitors a sound switch", SWITCH_EXAMPLE, "sound-switch.tsx", "tsx"],
              ["Use it without React", VANILLA_EXAMPLE, "vanilla.ts", "ts"],
              ["Respect reduced motion", REDUCED_EXAMPLE, "quiet.ts", "ts"],
            ].map(([title, src, file, lang]) => (
              <div key={title}>
                <h3 className="text-[17px] font-semibold text-foreground">{title}</h3>
                <div className="mt-3">
                  <CodeBlock code={src} language={lang as "ts" | "tsx"} theme="dark" header={{ ...DEFAULT_HEADER, title: file }} hoverHighlight={false} enableSound={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="rules" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="rules" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">Good habits</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Only after a gesture", "Browsers block sound until the visitor has clicked, tapped or pressed a key. Play from handlers, never on page load."],
              ["Touch has no hover", "Play on pointer enter for mouse users, and on click or tap for everyone. Both are shown above."],
              ["Always a switch", "Sound is a bonus, never the only signal. Let visitors turn it off, and keep volume modest."],
              ["Quiet when hidden", "The engine stays silent while the tab is hidden, and it respects the visitor's on/off choice."],
            ].map(([t, b]) => (
              <li key={t} className="rounded-[20px] bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                <p className="text-[16px] font-semibold text-foreground">{t}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="faq" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">Questions</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="text-[16px] font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-[15.5px] text-muted-foreground">
            Ready to pick sounds? <Link href="/icons" className="text-foreground underline underline-offset-4">Browse all {ICONS.length} icons</Link>, switch Sound on and hover.
          </p>
        </div>
      </section>
    </>
  );
}
