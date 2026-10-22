import type { SoundName } from "@/lib/ui-sounds";

/**
 * The components that make interface sound, with one plain sentence for the page about what you
 * hear. Every one of them takes `enableSound` (default true), follows the site-wide sound switch
 * and stays silent on hover and in autoplay. The sounds are synthesised in `@/lib/ui-sounds`.
 */
export const COMPONENT_SOUNDS: Record<string, string> = {
  "stateful-button": "Taps on press, chimes on success and bumps on error.",
  "progress-button": "Taps on press and plays a soft rising chime when the download finishes.",
  "hold-to-confirm": "Rises while you hold, chimes when it confirms and hushes if you let go early.",
  "slide-to-confirm": "Ticks softly as the knob passes each quarter of the track, chimes on confirm and bumps if the confirm fails.",
  "feedback-pill": "Pops open, taps shut, chimes when the message is sent and bumps if sending fails.",
  "copy-button": "Chimes softly when you copy; the key field also latches on and off for reveal and hide and whooshes on rotate.",
  "code-block": "Chimes softly when you press Copy.",
  "hold-to-record": "Clicks on when recording starts, off when you keep the note, hushes when you cancel and taps on play, pause and delete.",
  "otp-input": "Ticks quietly for each digit, chimes when the code verifies and bumps on a wrong code.",
  "password-strength": "Stays quiet while you type, then gives one soft chime the first time the password reaches Strong.",
  "signup-form": "Taps when you press submit, chimes on success and bumps on an error, with a very quiet tick when a password rule turns green.",
  "ask-nexus-input": "Whooshes when you send a question.",
  "forge-ai-command-bar": "Whooshes on send, ticks when you switch mode and taps when you pick a suggestion.",
  "seek-search": "Taps when you pick a suggestion.",
  "gooey-search-input": "Pops open, switches off on close and taps when you pick a suggestion.",
  "generate-image": "Taps when you press Generate and chimes when the picture finishes.",
  "tick-slider": "Ticks quietly as you drag or use the keys across each tick mark.",
  "ruler-picker": "Ticks as the ruler passes each unit while you drag, fling or press arrows, and taps on a preset.",
  "time-scrubber": "Ticks for each mark crossed while you drag or fling, then one soft drop when it lands.",
  "bolting-sliders": "Lifts as the knob leaps to your click and drops when it lands.",
  "slosh-slider": "Ticks every 5% as you drag, click or use the keys.",
  "wake-slider": "Ticks each time your drag moves onto a new bar.",
  "bending-rail": "Gives a soft latch click when you grab the knob and ticks as the value changes.",
  "scrub-inputs": "Ticks for each step as you scrub a number sideways or press up and down.",
  "thermo-dial": "Ticks very quietly for each step you turn the dial.",
  "liquid-dial": "Taps when you pick an action.",
  "wheel-selector": "Ticks as each item passes the top and drops softly when the dial settles on a choice.",
  "throw-wheel": "Ticks as each card passes the front and drops softly when it settles on a card.",
  "crumple-to-trash": "Swishes as the page scrunches and thumps when it lands in the bin; the shatter variant knocks as the card cracks; Undo swishes the pieces back.",
  "tear-off-ticket": "Swishes when the stub tears free and taps on New ticket.",
  "scratch-reveal": "Quiet rasps while you scratch, a chime when the foil comes off and a tap on Copy.",
  "sign-and-seal": "Knocks as the sleeve lands on your signature, then chimes when it is sealed.",
  "zipper-reveal": "Quiet ticks as you pull the zip, a latch click when it reaches the open end and a tap on Copy.",
  "slingshot-send": "Lifts as you pull the stone back and whooshes as the message flies out.",
  "sand-timer": "Taps when you turn the glass and chimes when the sand runs out, but only after you have turned it.",
  "pull-cord": "Clicks on when the light comes on and off when it goes out, once per pull.",
  "ink-theme-switch": "Clicks on when it goes dark and off when it goes back to light.",
  "box-spill": "Pops when you open the box.",
  "domino-select": "Knocks as the select-all chain starts, with soft ticks as each row's box is ticked; clicking one row knocks.",
  "capsule-toggles": "Latches on when a switch turns on and off when it turns off.",
  "animated-tabs": "Ticks when you change tab, latches on and off on the switches, pops on a new document tab, swipes on close and thumps when you drop a dragged tab.",
  "radio-cards": "Ticks when you pick a different plan.",
  "elastic-stepper": "Taps when you step up and ticks when you step down.",
  "stagger-menu": "Pops when the menu opens, ticks when you press an item, then chimes as the button shows its confirmation.",
  "command-palette": "Pops when it opens, ticks as the highlight moves by keyboard and taps when you run a command.",
  "pixel-select": "Pops when the menu opens and taps when you choose a mood.",
  "magnet-select": "Ticks when you pick a different status, by click or arrow keys.",
  "assign-picker": "Pops when you tick a person and ticks when you untick them.",
  "stretch-nav": "Ticks when you select a different item.",
  "layout-switch": "Taps when you switch layouts.",
};

export function soundFor(slug: string): string | undefined {
  return COMPONENT_SOUNDS[slug];
}

export const ENABLE_SOUND_PROP = {
  name: "enableSound",
  type: "boolean",
  defaultValue: "true",
  description:
    "Plays interface sounds on interaction. They follow the sound switch (setSoundsEnabled, on by default) and stay silent on hover and in autoplay. Pass false to silence this component.",
} as const;

/** The question every sound component answers, so the page and its search listing both carry it. */
export function soundFaq(slug: string): { q: string; a: string } | null {
  const what = COMPONENT_SOUNDS[slug];
  if (!what) return null;
  return {
    q: "Does it make sound, and how do I turn it off?",
    a: `${what} Sounds are synthesised with the Web Audio API, so there are no audio files, and they only play after a click or key press. Pass \`enableSound={false}\` to silence this component, or call \`setSoundsEnabled(false)\` from \`@/lib/ui-sounds\` to switch every sound off at once. The CLI installs \`@/lib/ui-sounds\` with the component.`,
  };
}

export type { SoundName };
