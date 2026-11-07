import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A dry switch click, a short rising hum as the bulb catches, a flicker of buzzy blips, then a glassy bell and two high sparkles as the full beam fans out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.04), 0.14, 2400);
  thud(c, o, t(0.05), 180, 0.06, 0.05);
  blip(c, o, 130, t(0.28), 0.04, 0.2, 520, "sawtooth");
  swish(c, o, t(0.3), t(0.34), 600, 3600, 0.035);
  ding(c, o, N.B5, t(0.4), 0.07, 0.5);
  blip(c, o, 1900, t(0.5), 0.022, 0.035, undefined, "square");
  blip(c, o, 2300, t(0.58), 0.022, 0.035, undefined, "square");
  ding(c, o, N.E7, t(0.64), 0.04, 0.4);
  ding(c, o, N.A6, t(0.74), 0.03, 0.4);
}
