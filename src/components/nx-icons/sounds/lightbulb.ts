import { ding, blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.07;

/** A switch click, an electric hum, two flickers as the bulb catches, and a bright ting when it glows. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0), 0.16, 2400);
  thud(c, o, t(0), 200, 0.08, 0.04);
  puff(c, o, t(0.05), 0.2, 4000, 0.025, "highpass");
  blip(c, o, 120, t(0.05), 0.04, 0.8, 130);
  tick(c, o, t(0.27), 0.1, 4500);
  tick(c, o, t(0.53), 0.08, 4500);
  ding(c, o, N.A6, t(0.3), 0.08, 0.7);
  ding(c, o, N.E7, t(0.8), 0.07, 0.8);
}
