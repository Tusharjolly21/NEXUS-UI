import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CodeBlock } from "@/components/code-block/code-block";
import { InstallCard } from "@/components/site/install-card";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { SoundBoard } from "@/components/sounds/sound-board";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import { createMetadata, siteConfig } from "@/lib/seo";
import { SOUNDS } from "@/lib/ui-sounds";
import { COMPONENT_SOUNDS } from "@/lib/catalog/component-sounds";
import { PRO_SOUND_META } from "@/lib/ui-sounds-pro-meta";
import { RECORDED_SOUND_META } from "@/lib/ui-sounds-recorded-meta";
import usage from "@/lib/catalog/sound-usage.generated.json";

const COUNT = Object.keys(SOUNDS).length;
const SYNTH_PRO_COUNT = PRO_SOUND_META.length;
const RECORDED_COUNT = RECORDED_SOUND_META.length;
const PRO_COUNT = SYNTH_PRO_COUNT + RECORDED_COUNT;

export const metadata: Metadata = createMetadata({
  title: "UI Sound Effects for React — Web Audio and Recorded",
  description: `${COUNT + PRO_COUNT} UI sound effects for React and Next.js, ${COUNT} free and ${PRO_COUNT} Pro, plus a Mac style that re-voices every sound to feel at home on a Mac or iPhone: taps, chimes, glass, paper, arcade, studio and device sounds synthesised with the Web Audio API, and ${RECORDED_COUNT} recorded sounds for typing, camera, messages, notifications, screenshots, build-ups, landings and stings.`,
  alternates: { canonical: "/sounds" },
});
const SOUND_COMPONENTS = Object.keys(COMPONENT_SOUNDS).length;
const INSTALL = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/ui-sounds`;
const INSTALL_PRO = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/ui-sounds-pro`;
const INSTALL_MAC = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/ui-sounds-mac`;
const INSTALL_RECORDED = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/ui-sounds-recorded`;

const USAGE = `"use client";

import { playSound } from "@/lib/ui-sounds";

export function LikeButton() {
  return (
    <button onClick={() => playSound("pop")}>
      Like
    </button>
  );
}`;

const PATTERNS = `import { AutoplaySound, playSound, setSoundVolume, setSoundsEnabled, useSound, useSoundsEnabled } from "@/lib/ui-sounds";

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

// A component that plays itself (autoplay) uses play.auto: same sounds, silent until the first click
play.auto("success");

// Keep demos quiet in part of your page, and let one be heard
<AutoplaySound allow={false}>{gridOfDemos}</AutoplaySound>
<AutoplaySound allow>{theDemoYouAreShowing}</AutoplaySound>

// A sound switch for your settings: remembered in this browser
const [on, setOn] = useSoundsEnabled();
<button onClick={() => setOn(!on)}>{on ? "Sound on" : "Sound off"}</button>

// Or switch everything off from code, and set the level
setSoundsEnabled(false);
setSoundVolume(0.7);`;

const PRO_USAGE = `"use client";

import { playProSound, useProSound } from "@/lib/ui-sounds-pro";

// One-off, from any click or key press
<button onClick={() => playProSound("glass-tap")}>Open</button>

// Inside a component with an enableSound prop: follows the visitor's on/off choice
const play = useProSound(enableSound);
<button onClick={() => play("coin")}>Collect</button>`;

const RECORDED_USAGE = `"use client";

import { playRecordedSound, useRecordedSound } from "@/lib/ui-sounds-recorded";

// One-off, from any click or key press
<button onClick={() => playRecordedSound("message")}>Send</button>

// Inside a component with an enableSound prop: follows the visitor's on/off choice
const play = useRecordedSound(enableSound);
<button onClick={() => play("camera")}>Take photo</button>

// Optional: decode the recordings ahead of time so the first play is on time
preloadRecordedSounds();`;

const MAC_USAGE = `"use client";

import { useMacSounds } from "@/lib/ui-sounds-mac";

// Once, near the root: every component that makes sound now plays the Mac style
export function SoundStyle() {
  useMacSounds();
  return null;
}

// Or let people choose, remembered in this browser
import { setSoundStyle } from "@/lib/ui-sounds";
setSoundStyle("mac"); // or "nexus"`;

const FAQ = [
  {
    q: "Do the sounds need audio files?",
    a: `No. The ${COUNT} free sounds and the ${SYNTH_PRO_COUNT} synthesised Pro sounds are made in the browser with the Web Audio API from oscillators, filtered noise and volume envelopes, so the free library is one TypeScript file of about 8 KB and nothing is downloaded. The ${RECORDED_COUNT} recorded Pro sounds are the one exception: they are short audio recordings, but they ship inside the package as code, so you still have no file to host.`,
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
    a: `${SOUND_COMPONENTS} components play these sounds on press, toggle, snap, send, drop and success, never on hover. When a component plays itself with autoplay, it makes the same sounds once you have clicked anywhere on the page, because browsers keep audio asleep until then. Filter the component gallery by Sound to see them. On this site sound is off until you switch it on with the speaker in the menu; in your own app it is on by default.`,
  },
  {
    q: "Which sounds are free and which are Pro?",
    a: `The ${COUNT} sounds the components use are free, with their full source on this page. The Pro plan adds ${SYNTH_PRO_COUNT} synthesised sounds in five sets (glass, paper and wood, arcade, studio, and devices) and ${RECORDED_COUNT} recorded ones. Every Pro sound plays on this page for everyone, so you can hear it before you decide. Its code, install command and full-quality file come with the Pro plan.`,
  },
  {
    q: "What is the Mac style? Are these Apple's sounds?",
    a: `A second voice for the ${COUNT} free sounds: the same names, re-voiced to feel at home on a Mac or an iPhone, with glassy bells, soft key tocks, bubbles and airy swooshes instead of buzzier synth tones. Switch it on with the Style control above and every component on this site plays it. They are not Apple's sounds: Apple's system sounds are copyrighted recordings that can't be redistributed, so every Mac-style sound is an original recipe made with the Web Audio API, with no audio files. The file comes with the Pro plan.`,
  },
  {
    q: "What are the recorded sounds?",
    a: `Nine short recordings for moments a synthesiser does not do well: typing, camera, message, notification and screenshot, plus a build-up, a landing, a pitch tick and a glass sting cut from the Nexus UI Word Rush and Glass Orbit video soundtracks. On this page they play from small, compressed previews so you can judge them. The install carries the full-quality recordings, levelled to sit with the other sounds, inside a TypeScript file, so there is nothing to host. They follow the same on/off switch, volume and autoplay rules as every other sound, and they are Pro only.`,
  },
  {
    q: "How do I add the Pro sounds to my app?",
    a: "On a Pro plan, set up your API key as in the Quick Start (save it as NEXUS_API_KEY in .env.local and add the registries entry to components.json), run the install command for ui-sounds-pro (it also installs ui-sounds), then call playProSound or the useProSound hook. For the recorded sounds, install ui-sounds-recorded and call playRecordedSound or useRecordedSound. All of them follow the same on/off switch and volume as the free ones.",
  },
  {
    q: "Is it free?",
    a: "The core library is free to use in personal and commercial projects, installed with the shadcn CLI or copied from this page. The Pro pack is included in the Pro plan.",
  },
];

export default async function SoundsPage() {
  // Only the free file is read here. The Pro file is served by the gated registry route.
  const source = await readFile(path.join(process.cwd(), "src/lib/ui-sounds.ts"), "utf8");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: "UI Sounds",
      description: `${COUNT + PRO_COUNT} interface sound effects for React (${COUNT} free, ${PRO_COUNT} Pro), synthesised with the Web Audio API apart from ${RECORDED_COUNT} recorded Pro sounds.`,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Web browser",
      url: `${siteConfig.url}/sounds`,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", description: `${COUNT} sounds free; ${PRO_COUNT} more with the Pro plan` },
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
            {COUNT + PRO_COUNT} interface sounds you can <RainbowWord>hear</RainbowWord>, made entirely in code with the
            Web Audio API, apart from {RECORDED_COUNT} recorded ones. {COUNT} are free and {PRO_COUNT} are Pro, and every one plays here. Switch to the Mac style to
            hear the free ones re-voiced for a Mac or iPhone, across every component on the site. Tap an orb, then copy
            the line that does the same in your app.
          </p>
        </div>
      </section>

      <section aria-label="Sound board" className="px-4 pb-20">
        <div className="mx-auto max-w-[1152px]">
          <SoundBoard
            source={source}
            usedBy={usage as Record<string, { slug: string; name: string }[]>}
            installFree={INSTALL}
            installPro={INSTALL_PRO}
            installMac={INSTALL_MAC}
            installRecorded={INSTALL_RECORDED}
          />
        </div>
      </section>

      <section aria-labelledby="use-heading" className="px-4 pb-24">
        {/* Each install step sits beside the code that uses it, so neither column runs on alone. */}
        <div className="mx-auto flex max-w-[1152px] flex-col gap-14 lg:gap-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
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
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h3 className="text-[19px] font-semibold tracking-[-0.3px] text-foreground">Patterns you will use</h3>
              <p className="mt-2 max-w-[440px] text-[15.5px] leading-relaxed text-muted-foreground">
                Toggles, async work, notifications, components that play themselves, and a sound switch for your settings page. Copy the ones you need.
              </p>
            </div>
            <div className="min-w-0">
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

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h3 className="text-[19px] font-semibold tracking-[-0.3px] text-foreground">The Pro pack</h3>
              <p className="mt-2 max-w-[440px] text-[15.5px] leading-relaxed text-muted-foreground">
                {SYNTH_PRO_COUNT} more sounds in glass, paper and wood, arcade and studio sets. Included in the Pro plan. The
                command needs your Nexus API key, set up once as described in the{" "}
                <Link href="/docs/cli" className="font-medium text-foreground underline underline-offset-4">CLI guide</Link>.
              </p>
              <InstallCard wrap command={INSTALL_PRO} className="mt-4" />
            </div>
            <div className="min-w-0">
                <CodeBlock
                  code={PRO_USAGE}
                  language="tsx"
                  theme="dark"
                  header={{ enabled: true, showDots: true, title: "pro-sounds.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 } }}
                  codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
                  border={{ radius: "20px" }}
                />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h3 className="text-[19px] font-semibold tracking-[-0.3px] text-foreground">The recorded sounds</h3>
              <p className="mt-2 max-w-[440px] text-[15.5px] leading-relaxed text-muted-foreground">
                {RECORDED_COUNT} recordings: typing, camera, message, notification, screenshot, build-up, landing, pitch tick and glass sting. The audio ships inside the
                package, so there is no file to host. Included in the Pro plan.
              </p>
              <InstallCard wrap command={INSTALL_RECORDED} className="mt-4" />
            </div>
            <div className="min-w-0">
                <CodeBlock
                  code={RECORDED_USAGE}
                  language="tsx"
                  theme="dark"
                  header={{ enabled: true, showDots: true, title: "recorded-sounds.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 } }}
                  codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
                  border={{ radius: "20px" }}
                />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h3 className="text-[19px] font-semibold tracking-[-0.3px] text-foreground">The Mac style</h3>
              <p className="mt-2 max-w-[440px] text-[15.5px] leading-relaxed text-muted-foreground">
                All {COUNT} free sounds re-voiced to feel at home on a Mac or iPhone. Install it, call{" "}
                <code className="font-mono text-[14px] text-foreground">useMacSounds()</code> once, and every component that
                makes sound switches to it. Original recipes, no Apple recordings. Included in the Pro plan.
              </p>
              <InstallCard wrap command={INSTALL_MAC} className="mt-4" />
            </div>
            <div className="min-w-0">
                <CodeBlock
                  code={MAC_USAGE}
                  language="tsx"
                  theme="dark"
                  header={{ enabled: true, showDots: true, title: "mac-style.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 } }}
                  codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
                  border={{ radius: "20px" }}
                />
            </div>
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
              The sounds pair with the components: a pop for a like, a latch for a toggle, a chime for a toast. The videos come with soundtracks of their own.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <PillLink href="/components">Browse components</PillLink>
            <PillLink href="/videos" variant="white">
              Watch the videos
            </PillLink>
          </div>
        </div>
      </Band>
    </>
  );
}
