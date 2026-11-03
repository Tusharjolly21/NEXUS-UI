import { ding, plink, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.98;

/** Three quick keyboard ticks as the left chevron types, a small blinking blip, three more ticks for the right chevron, and a bright pluck and bell when the line is finished. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.07, 0.12].forEach((at, i) => tick(c, o, t(at), 0.08, 3800 + i * 500));
  blip(c, o, N.E6, t(0.28), 0.04, 0.06, undefined, "square");
  blip(c, o, N.E6, t(0.52), 0.04, 0.06, undefined, "square");
  [0.6, 0.66, 0.72].forEach((at, i) => tick(c, o, t(at), 0.08, 4600 - i * 400));
  plink(c, o, N.A6, t(0.82), 0.07, 0.12);
  ding(c, o, N.D7, t(0.86), 0.04, 0.35);
}
