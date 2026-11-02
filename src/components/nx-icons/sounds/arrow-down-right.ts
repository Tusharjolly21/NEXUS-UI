import { ding, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.23;

/** A soft low note that sinks as the arrow rocks back, a falling whoosh as it fires off, a rising whoosh as it returns, then a dull thud and two glassy bells as it lands and ripples. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.A4, t(0.02), 0.06, 0.14, N.E4, "triangle");
  swish(c, o, t(0.12), t(0.26), 3000, 500, 0.06);
  swish(c, o, t(0.4), t(0.3), 600, 2000, 0.035);
  thud(c, o, t(0.68), 100, 0.2, 0.12);
  ding(c, o, N.G6, t(0.7), 0.06, 0.4);
  ding(c, o, N.C7, t(0.8), 0.035, 0.3);
}
