import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.18;

/** A rustle as the pages settle, a swish as the page turns, and a soft thump. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.15, 3600, 0.03, "highpass");
  swish(c, o, t(0.18), t(0.38), 1400, 4200, 0.05);
  puff(c, o, t(0.3), 0.15, 5200, 0.03, "highpass");
  thud(c, o, t(0.62), 110, 0.1, 0.07);
  ding(c, o, N.G6, t(0.66), 0.05, 0.4);
}
