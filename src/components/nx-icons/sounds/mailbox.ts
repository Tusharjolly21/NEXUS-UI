import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.48;

/** A tinny swing as the flag drops, a metal tap when it lands, then a springy clang as it snaps back up and a small rattle as it wobbles still. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 1200, 600, 0.025); // 0.00-0.22 the flag swings down
  tick(c, o, t(0.22), 0.06, 3000); // 0.22 it taps the top of the box
  blip(c, o, 520, t(0.4), 0.04, 0.2, 900); // 0.40-0.60 the spring flicks the flag up
  ding(c, o, 1250, t(0.62), 0.06, 0.3); // 0.62 the flag clangs upright
  tick(c, o, t(0.8), 0.03, 3600); // 0.80 a last rattle as it wobbles
}
