import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A ratchet click as the handle pulls out, a rolling rattle of small wheels with a short skid as it tilts, and a soft landing knock with a tiny bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.09, 0.14, 0.19].forEach((at, i) => tick(c, o, t(at), 0.09, 3000 + i * 500));
  swish(c, o, t(0.24), t(0.4), 150, 500, 0.06);
  [0.3, 0.37, 0.43, 0.49, 0.55, 0.6, 0.66].forEach((at, i) => thud(c, o, t(at), 120 + (i % 2) * 30, 0.06, 0.05));
  blip(c, o, N.A4, t(0.5), 0.025, 0.12, N.E5);
  thud(c, o, t(0.82), 100, 0.22, 0.12);
  ding(c, o, N.G7, t(0.88), 0.02, 0.3);
  ding(c, o, N.D5, t(0.96), 0.03, 0.4);
}
