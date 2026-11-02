import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.68;

/** A round, soft pop as the dot springs up, a tiny rebound, and two gentle ripple pings that climb and fade out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 280, t(0.03), 0.12, 0.09, 720, "sine");
  blip(c, o, 540, t(0.14), 0.05, 0.07, 400, "sine");
  ding(c, o, N.A5, t(0.12), 0.05, 0.45);
  ding(c, o, N.E6, t(0.26), 0.035, 0.4);
  ding(c, o, N.C7, t(0.4), 0.02, 0.35);
  tick(c, o, t(0.05), 0.05, 2800);
}
