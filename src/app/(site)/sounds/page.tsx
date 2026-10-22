import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Plus } from "lucide-react";
import { CodeBlock } from "@/components/code-block/code-block";
import { InstallCard } from "@/components/site/install-card";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { SoundBoard } from "@/components/sounds/sound-board";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import { createMetadata, siteConfig } from "@/lib/seo";
import { SOUNDS } from "@/lib/ui-sounds";
import { COMPONENT_SOUNDS } from "@/lib/catalog/component-sounds";

export const metadata: Metadata = createMetadata({
  title: "UI Sound Effects for React — Web Audio, No Files",
  description:
    "24 free UI sound effects for React and Next.js: taps, pops, chimes, toggles and success sounds synthesised with the Web Audio API. One file, nothing to download.",
  alternates: { canonical: "/sounds" },
});

const COUNT = Object.keys(SOUNDS).length;
const SOUND_COMPONENTS = Object.keys(COMPONENT_SOUNDS).length;
const INSTALL = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/ui-sounds`;

const USAGE = `"use client";

import { playSound } from "@/lib/ui-sounds";

export function LikeButton() {
  return (
    <button onClick={() => playSound("pop")}>
      Like
    </button>
  );
}`;

const PATTERNS = `import { playSound, setSoundVolume, setSoundsEnabled, useSound, useSoundsEnabled } from "@/lib/ui-sounds";

// In a component: silent when the prop is false or the visitor has sounds off
const play = useSound(enableSound);
<button onClick={() => play("tap")}>Save</button>

// A toggle: one sound for each direction
onCheckedChange={(on) => playSound(on ? "on" : "off")}

// Async work: start, then success or failure
playSound("charge");
const ok = await save();
playSound(ok ? "success" : "error");

// A notification arriving, quieter than the rest
playSound("chime", 0.6);

// A sound switch for your settings: remembered in this browser
const [on, setOn] = useSoundsEnabled();
<button onClick={() => setOn(!on)}>{on ? "Sound on" : "Sound off"}</button>

// Or switch everything off from code, and set the level
setSoundsEnabled(false);
setSoundVolume(0.7);`;

const FAQ = [
  {
    q: "Do the sounds need audio files?",
    a: `No. All ${COUNT} sounds are synthesised in the browser with the Web Audio API from oscillators, filtered noise and volume envelopes, so the library is one TypeScript file of about 8 KB and nothing is downloaded.`,
  },
  {
    q: "Why does nothing play until I click?",
    a: "Browsers only allow audio after a user gesture. Call playSound from a click, key press or pointer event; the audio context starts on the first one.",
  },
  {
    q: "Does it work with the Next.js App Router?",
    a: 'Yes. Import playSound inside a client component ("use client"). On the server the functions do nothing, so importing them is safe anywhere.',
  },
  {
    q: "How do I let people turn sounds off?",
    a: "Use the useSoundsEnabled hook for a speaker button, or call setSoundsEnabled(false) from anywhere. The choice is remembered in this browser (localStorage key ui-sounds) and every sound follows it. setSoundVolume(0 to 1) sets the level, and a component that makes sound also takes enableSound={false} to be silent on its own. Interface sounds should be optional and quiet; the defaults are already soft.",
  },
  {
    q: "Which Nexus UI components make sound?",
    a: `${SOUND_COMPONENTS} components play these sounds on press, toggle, snap, send, drop and success, never on hover and never in their self-playing demos. Filter the component gallery by Sound to see them. On this site sound is off until you switch it on with the speaker in the menu; in your own app it is on by default.`,
  },
  {
    q: "Is it free?",
    a: "Yes. The sounds library is free to use in personal and commercial projects, installed with the shadcn CLI or copied from this page.",
  },
];

export default async function SoundsPage() {
  const source = await readFile(path.join(process.cwd(), "src/lib/ui-sounds.ts"), "utf8");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: "UI Sounds",
      description: `${COUNT} interface sound effects for React, synthesised with the Web Audio API.`,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Web browser",
      url: `${siteConfig.url}/sounds`,
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display text-[clamp(52px,9vw,88px)] text-foreground">Sounds</h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            {COUNT} interface sounds you can <RainbowWord>hear</RainbowWord>, made entirely in code with the Web Audio API.
            Tap an orb to play it, then copy the one line that does the same in your app. Free, and nothing to download.
          </p>
        </div>
      </section>

      <section aria-label="Sound board" className="px-4 pb-20">
        <div className="mx-auto max-w-[1152px]">
          <SoundBoard source={source} />
        </div>
      </section>

      <section aria-labelledby="use-heading" className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 id="use-heading" className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">
              Add it to your app
            </h2>
            <p className="mt-4 max-w-[440px] text-[17px] leading-relaxed text-muted-foreground">
              One command puts <code className="font-mono text-[15px] text-foreground">lib/ui-sounds.ts</code> in your
              project. Then any click, toggle or toast can make a sound.
            </p>
            <InstallCard wrap command={INSTALL} className="mt-6" />
          </div>
          <div className="grid min-w-0 gap-4">
            <CodeBlock
              code={USAGE}
              language="tsx"
              theme="dark"
              header={{ enabled: true, showDots: true, title: "like-button.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 } }}
              codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
              border={{ radius: "20px" }}
            />
            <CodeBlock
              code={PATTERNS}
              language="tsx"
              theme="dark"
              header={{ enabled: true, showDots: true, title: "patterns.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 } }}
              codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
              border={{ radius: "20px" }}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="sounds-faq" className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 id="sounds-faq" className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">
            Questions
          </h2>
          <div className="border-t border-border">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-border">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold tracking-[-0.3px] text-foreground [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
                </summary>
                <p className="max-w-[620px] pb-5 text-[15.5px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Band tint="violet">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Give them something to press.</h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              The sounds pair with the components: a pop for a like, a latch for a toggle, a chime for a toast.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <PillLink href="/components">Browse components</PillLink>
            <PillLink href="/blocks" variant="white">
              See blocks
            </PillLink>
          </div>
        </div>
      </Band>
    </>
  );
}
