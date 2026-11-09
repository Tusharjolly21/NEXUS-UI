import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.4;

/** A wet slow squelch that glides forward with the shell, four tiny wet pops as the eye stalks wiggle, and a quieter squelch back as the snail settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.45), 260, 560, 0.1); // 0.00-0.45 the body glides forward
  blip(c, o, 150, t(0.04), 0.06, 0.3, 270); // 0.04-0.34 slimy squelch rises as it speeds up
  blip(c, o, 880, t(0.24), 0.03, 0.04, 1400); // 0.24 the first eye stalk flicks out
  blip(c, o, 760, t(0.39), 0.026, 0.04, 1250); // 0.39 the second eye stalk flicks out
  blip(c, o, 880, t(0.53), 0.022, 0.04, 1400); // 0.53 first stalk flicks back
  blip(c, o, 760, t(0.67), 0.02, 0.04, 1250); // 0.67 second stalk flicks back
  swish(c, o, t(0.6), t(0.4), 520, 230, 0.07); // 0.60-1.00 the body slides back, slower
  blip(c, o, 240, t(0.62), 0.04, 0.26, 130); // 0.62-0.88 squelch falls
  blip(c, o, 820, t(0.82), 0.014, 0.04, 1200); // 0.82 last eye stalk settles
}
