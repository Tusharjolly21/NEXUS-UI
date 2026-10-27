"use client";

import {
  TextAnimationBlurFadeIn,
  TextAnimationTypewriterEffect,
  TextGenerateTypewriter,
  TypewriterHeading,
  type TextAnimationBlurFadeInProps,
  type TextAnimationTypewriterEffectProps,
  type TextGenerateTypewriterProps,
  type TypewriterHeadingProps,
} from "@/components/blocks/text-animations";
import { ScrambleHeading } from "@/components/blocks/motion-kit/scramble-heading";
import { ScrollReadManifesto } from "@/components/blocks/motion-kit/scroll-read-manifesto";
import type { PropDoc } from "@/components/library/prop-controls";
import { cn } from "@/lib/utils";
import type { BlockPlaygrounds } from "./types";

const CLASS_NAME: PropDoc = {
  name: "className",
  type: "string",
  description: "Extra classes for the outer element (spacing, size, colour overrides).",
};

const importFor = (name: string) => `import { ${name} } from "@/components/blocks/text-animations";`;

/* ── Stages: the same compositions the block page shows around each component ───────────────── */

const CHANGELOG_NOTES = [
  ["Oct 14", "Branch previews", "Every pull request gets its own URL, torn down on merge."],
  ["Oct 07", "Faster cold starts", "Median boot fell from 410 ms to 160 ms on the new runtime."],
  ["Sep 30", "Audit log export", "Stream every workspace event to your own bucket as JSONL."],
  ["Sep 22", "Keyboard-first search", "Press / anywhere to jump to a project, page, or teammate."],
];

/** Changelog hero: eyebrow, the typing headline, two calls to action and a list of recent notes. */
function TypewriterHeadingStage({ className, ...props }: TypewriterHeadingProps) {
  return (
    <section className="grid h-full min-h-full w-full overflow-hidden bg-[#f5f5f7] px-5 py-10 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-14">
      <div className="flex flex-col justify-center">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Changelog</p>
        <TypewriterHeading {...props} className={cn("mt-3", className)} />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center rounded-full bg-[#0071e3] px-5 text-[15px] font-medium text-white">
            Read the latest
          </span>
          <span className="inline-flex h-11 items-center rounded-full bg-[#e8e8ed] px-5 text-[15px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
            Subscribe by email
          </span>
        </div>
      </div>
      <ol className="mt-10 hidden flex-col justify-center gap-2 lg:mt-0 lg:flex">
        {CHANGELOG_NOTES.map(([date, title, copy]) => (
          <li
            key={title}
            className="grid grid-cols-[64px_1fr] gap-4 rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
          >
            <span className="pt-0.5 text-[12.5px] tabular-nums text-[#86868b] dark:text-[#98989d]">{date}</span>
            <span>
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">{title}</span>
              <span className="mt-1 block text-[13.5px] leading-5 text-[#6e6e73] dark:text-[#a1a1a6]">{copy}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Dark hero: a fixed first line with the cycling claims typed underneath it. */
function TypewriterEffectStage({ className, ...props }: TextAnimationTypewriterEffectProps) {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-black px-5 py-12 text-[#f5f5f7] sm:px-8">
      <div className="w-full max-w-3xl">
        <p className="text-[13px] font-medium text-[#a1a1a6]">Hosting for small teams</p>
        <h3 className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">Push to main.</h3>
        <div className="mt-2 min-h-[2.6em] text-[34px] leading-[1.05] sm:text-5xl">
          <TextAnimationTypewriterEffect {...props} className={cn("text-[34px] text-[#86868b] sm:text-5xl", className)} />
        </div>
        <p className="mt-8 max-w-xl text-pretty text-[16px] leading-7 text-[#a1a1a6]">
          Cycles through short claims, typing and deleting each one. The line keeps its height, so the copy below
          never shifts.
        </p>
      </div>
    </section>
  );
}

/** Founders' note: the paragraph blurs in word by word above a byline. */
function BlurFadeInStage({ className, ...props }: TextAnimationBlurFadeInProps) {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-white px-5 py-12 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8">
      <div className="w-full max-w-3xl">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">From the founders</p>
        <TextAnimationBlurFadeIn
          {...props}
          className={cn(
            "mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-5xl",
            className,
          )}
        />
        <p className="mt-8 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Ana Ruiz and Tom Becker, co-founders</p>
      </div>
    </section>
  );
}

/** Assistant reply: a user question bubble, then the answer typing itself out underneath. */
function TextGenerateStage({ className, ...props }: TextGenerateTypewriterProps) {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-[#f5f5f7] px-5 py-12 dark:bg-black sm:px-8">
      <div className="w-full max-w-2xl">
        <div className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-[#0071e3] px-4 py-3 text-[15px] text-white">
          Why did churn go up last quarter?
        </div>
        <TextGenerateTypewriter {...props} className={cn("mt-4", className)} />
      </div>
    </section>
  );
}

/* ── Playgrounds ─────────────────────────────────────────────────────────────────────────────── */

const TYPEWRITER_TEXTS = ["Preview every branch.", "Roll back in one click.", "Sleep through deploys."];

const playgrounds: BlockPlaygrounds = {
  "text-typewriter-heading": {
    Component: TypewriterHeadingStage,
    props: [
      {
        name: "text",
        required: true,
        type: "string",
        description: "The headline that types itself out. Required. A new value starts typing again from the first letter.",
        defaultValue: '"Release notes people read."',
      },
      {
        name: "description",
        required: true,
        type: "string",
        description: "Paragraph that blurs in under the headline once typing starts. Leave empty to hide it.",
        defaultValue:
          '"Ship a headline that types itself out, then let the summary settle in underneath. The layout is reserved up front, so nothing below it jumps."',
      },
      {
        name: "typingSpeed",
        type: "number",
        description: "Base milliseconds per character. A little unevenness is added so it reads like a person typing.",
        defaultValue: "82",
        min: 20,
        max: 200,
        step: 2,
      },
      {
        name: "startDelay",
        type: "number",
        description: "Milliseconds to wait before the first character (and before each pass when looping).",
        defaultValue: "350",
        min: 0,
        max: 2000,
        step: 50,
      },
      {
        name: "cursorColor",
        type: "string",
        description: "Caret colour, any CSS colour. Leave empty for the default blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "loop",
        type: "boolean",
        description: "Hold the finished line for 2 seconds, clear it and type it again.",
        defaultValue: "false",
      },
      {
        name: "showCursor",
        type: "boolean",
        description: "Show the thin rounded caret: solid while typing, blinking once the line is done.",
        defaultValue: "true",
      },
      CLASS_NAME,
    ],
    jsxName: "TypewriterHeading",
    importLine: importFor("TypewriterHeading"),
  },

  "text-typewriter-effect": {
    Component: TypewriterEffectStage,
    baseProps: { texts: TYPEWRITER_TEXTS },
    props: [
      {
        name: "typingSpeed",
        type: "number",
        description: "Milliseconds per character while typing.",
        defaultValue: "46",
        min: 10,
        max: 200,
        step: 2,
      },
      {
        name: "deletingSpeed",
        type: "number",
        description: "Milliseconds per character while deleting.",
        defaultValue: "24",
        min: 10,
        max: 150,
        step: 2,
      },
      {
        name: "delay",
        type: "number",
        description: "Milliseconds before the first line starts, and how long each finished line is held.",
        defaultValue: "1200",
        min: 0,
        max: 4000,
        step: 100,
      },
      {
        name: "loop",
        type: "boolean",
        description: "Keep cycling. Off: stops once the last line is typed.",
        defaultValue: "true",
      },
      {
        name: "showCursor",
        type: "boolean",
        description: "Show the caret. It holds solid while keys move and blinks while a line rests.",
        defaultValue: "true",
      },
      {
        name: "cursor",
        type: "string",
        description: 'The caret. "|" draws a thin rounded bar in the accent blue; any other text is shown as is.',
        defaultValue: '"|"',
      },
      {
        name: "texts",
        type: "string | string[]",
        description: "One line or a list of lines to type, delete and cycle through. Required.",
      },
      CLASS_NAME,
    ],
    jsxName: "TextAnimationTypewriterEffect",
    importLine: importFor("TextAnimationTypewriterEffect"),
    snippetProps: [`texts={${JSON.stringify(TYPEWRITER_TEXTS)}}`],
  },

  "text-blur-fade-in": {
    Component: BlurFadeInStage,
    props: [
      {
        name: "text",
        required: true,
        type: "string",
        description: "The paragraph to reveal. Required. Line breaks in it are kept.",
        defaultValue:
          '"We built the tool we kept wishing for. It does fewer things than the others. Each of them, properly."',
      },
      {
        name: "by",
        type: '"word" | "line" | "character"',
        description: "What each piece of the reveal is: a word, a line (split on line breaks) or a single character.",
        defaultValue: '"word"',
      },
      {
        name: "highlight",
        type: "string",
        description: "A word or phrase inside the text to set in the accent blue (word and line modes).",
      },
      {
        name: "stagger",
        type: "number",
        description: "Seconds between one piece starting and the next.",
        defaultValue: "0.035",
        min: 0,
        max: 0.2,
        step: 0.005,
      },
      {
        name: "duration",
        type: "number",
        description: "Seconds each piece takes to settle (a spring with no bounce).",
        defaultValue: "0.55",
        min: 0.1,
        max: 2,
        step: 0.05,
      },
      {
        name: "repeat",
        type: "boolean",
        description: "After a pause, blur the words away and run the reveal again, for as long as it is in view.",
        defaultValue: "false",
      },
      {
        name: "once",
        type: "boolean",
        description: "Reveal only the first time it scrolls into view. Off: hides again when it leaves.",
        defaultValue: "true",
      },
      {
        name: "repeatDelay",
        type: "number",
        description: "Milliseconds the finished paragraph is held before a repeat.",
        defaultValue: "1800",
        min: 300,
        max: 6000,
        step: 100,
      },
      {
        name: "delay",
        type: "number",
        description: "Seconds before the first piece starts.",
        defaultValue: "0",
        min: 0,
        max: 2,
        step: 0.1,
      },
      CLASS_NAME,
    ],
    jsxName: "TextAnimationBlurFadeIn",
    importLine: importFor("TextAnimationBlurFadeIn"),
  },

  "text-generate": {
    Component: TextGenerateStage,
    props: [
      {
        name: "text",
        required: true,
        type: "string",
        description: "The reply to type out, one character per tick. Required.",
        defaultValue:
          '"Churn rose 1.8 points, almost entirely from annual plans that renewed in August. Most of those accounts never invited a second teammate."',
      },
      {
        name: "typingSpeed",
        type: "number",
        description: "Milliseconds per character.",
        defaultValue: "22",
        min: 10,
        max: 120,
        step: 2,
      },
      {
        name: "showControls",
        type: "boolean",
        description: "Show the Replay button in the top-right corner.",
        defaultValue: "true",
      },
      {
        name: "showCursor",
        type: "boolean",
        description: "Show the blue caret after the last character.",
        defaultValue: "true",
      },
      {
        name: "startOnView",
        type: "boolean",
        description: "Start typing on its own when scrolled into view. Off: waits for a click or the Start typing button.",
        defaultValue: "true",
      },
      {
        name: "startOnHover",
        type: "boolean",
        description: "Start typing when the pointer enters the card.",
        defaultValue: "false",
      },
      CLASS_NAME,
    ],
    jsxName: "TextGenerateTypewriter",
    importLine: importFor("TextGenerateTypewriter"),
  },

  "mk-scramble-heading": {
    Component: ScrambleHeading,
    props: [
      {
        name: "lead",
        type: "string",
        description: "First line of the headline. Decodes out of random glyphs when it scrolls into view.",
        defaultValue: '"Push code."',
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Mono line above the headline, in the accent colour. It decodes too.",
        defaultValue: '"Deploys, rethought"',
      },
      {
        name: "accent",
        type: "string",
        description: "Accent colour for the eyebrow, the cycling phrase and its marker stroke. Leave empty for blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Re-decode the second line to the next phrase every 3.2 seconds while on screen.",
        defaultValue: "true",
      },
      {
        name: "words",
        type: "string[]",
        description: 'Phrases the second line cycles through. Defaults to "ship faster.", "sleep better.", "break nothing.".',
      },
      {
        name: "features",
        type: "ScrambleHeadingFeature[]",
        description: "Feature cells under the headline: { k, title, body }. Titles re-scramble on hover. Defaults to three deploy features.",
      },
      CLASS_NAME,
    ],
    jsxName: "ScrambleHeading",
    importLine: 'import { ScrambleHeading } from "@/components/blocks/motion-kit/scramble-heading";',
  },

  "mk-scroll-read-manifesto": {
    Component: ScrollReadManifesto,
    props: [
      {
        name: "text",
        type: "string",
        description: "The manifesto. Each word sharpens from grey to ink in order as it is read.",
        defaultValue:
          '"We think software should feel calm. Fast enough that you never wait, quiet enough that you never notice it, and honest enough that you always know what it\'s doing with your work."',
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Small line above the paragraph, in the accent colour.",
        defaultValue: '"What we believe"',
      },
      {
        name: "accent",
        type: "string",
        description: "Colour for the eyebrow, the hot words and the progress bar. Leave empty for blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Read the paragraph by itself once it is in view, without pinning. In a clipped box like this preview it does that anyway.",
        defaultValue: "false",
      },
      {
        name: "hot",
        type: "string[]",
        description: 'Words (matched exactly, punctuation included) that land in the accent colour. Defaults to "calm.", "never", "honest".',
      },
      CLASS_NAME,
    ],
    jsxName: "ScrollReadManifesto",
    importLine: 'import { ScrollReadManifesto } from "@/components/blocks/motion-kit/scroll-read-manifesto";',
  },
};

export default playgrounds;
