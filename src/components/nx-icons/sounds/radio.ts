import { ding, blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.6;

/** A switch click, static between stations, a whistle sweeping down then back up as the dial turns, and a clear tone when it locks on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.1, 2200);
  puff(c, o, t(0.04), 0.8, 5200, 0.03, "highpass");
  blip(c, o, 1900, t(0.06), 0.04, 0.45, 380);
  blip(c, o, 500, t(0.5), 0.04, 0.3, 1300);
  ding(c, o, N.A6, t(0.88), 0.07, 0.5);
  tick(c, o, t(0.9), 0.08, 3000);
}
