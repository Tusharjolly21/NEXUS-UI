import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A whoosh as the gavel is raised, a sharp wooden crack and a deep knock as it hits the block, and three little ripples fading away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.26), 500, 1700, 0.035);
  blip(c, o, 520, t(0.5), 0.14, 0.05, 240, "square");
  thud(c, o, t(0.5), 95, 0.38, 0.16);
  tick(c, o, t(0.5), 0.18, 3000);
  [0.54, 0.62, 0.72].forEach((at, i) => ding(c, o, N.D7 - i * 330, t(at), 0.03, 0.2));
  swish(c, o, t(0.6), t(0.2), 1500, 500, 0.012);
}
