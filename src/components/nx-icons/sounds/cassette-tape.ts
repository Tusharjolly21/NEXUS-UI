import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.21;

/** A deck engages with a plastic clunk, then two tape reels whirr up and down in pitch with tape hiss and a ratchet of reel clicks that speeds up and slows down as the reels turn, ending with a stop click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04 the deck engages as the reels start
  thud(c, o, t(0.04), 120, 0.16, 0.08);
  tick(c, o, t(0.04), 0.1, 2200);
  // 0.05-0.5 reels speed up
  swish(c, o, t(0.05), t(0.45), 400, 2200, 0.07);
  blip(c, o, 80, t(0.05), 0.08, 0.45, 230, "triangle");
  // 0.5-0.95 reels slow down
  swish(c, o, t(0.5), t(0.45), 2200, 450, 0.065);
  blip(c, o, 230, t(0.52), 0.07, 0.4, 85, "triangle");
  swish(c, o, t(0.06), t(0.88), 4200, 6200, 0.03); // tape hiss
  // a reel spoke passes every 30 degrees of the turn (slow start, fast middle, slow end)
  [0.202, 0.283, 0.346, 0.401, 0.451, 0.5, 0.549, 0.599, 0.654, 0.717, 0.798].forEach((at, i) => tick(c, o, t(at), 0.09 + (i % 2) * 0.03, 2400 + (i % 3) * 500));
  // 0.97 the reels stop
  tick(c, o, t(0.97), 0.1, 1800);
  thud(c, o, t(0.97), 90, 0.14, 0.08);
}
