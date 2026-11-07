import { ding, blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A needle drops with a thud and a few dusty crackles while a spin-up whoosh rises, then a warm slightly staggered D minor ninth chord blooms and a single glint rings at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 95, 0.16, 0.12);
  [0.05, 0.11, 0.2, 0.31, 0.44, 0.58].forEach((at, i) => puff(c, o, t(at), 0.012, 5200 + i * 700, 0.05, "highpass"));
  swish(c, o, t(0.06), t(0.8), 260, 1900, 0.035);
  [146.83, 220, 349.23, 523.25, 698.46].forEach((f, i) => blip(c, o, f, t(0.3 + i * 0.045), 0.06, 0.75, undefined, "triangle"));
  blip(c, o, 73.42, t(0.3), 0.09, 0.8, undefined, "sine");
  ding(c, o, 1396.91, t(0.92), 0.05, 0.5);
}
