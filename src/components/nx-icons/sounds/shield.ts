import { ding, blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.7;

/** A heavy thud and a metallic shing as it takes the hit, then two rising notes to say you are safe. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.03), 90, 0.2, 0.2);
  puff(c, o, t(0.05), 0.18, 5200, 0.07);
  blip(c, o, 2400, t(0.05), 0.05, 0.2, 3200);
  puff(c, o, t(0.2), 0.3, 1800, 0.02);
  ding(c, o, N.E6, t(0.35), 0.1, 0.6);
  ding(c, o, N.A6, t(0.52), 0.11, 0.7);
}
