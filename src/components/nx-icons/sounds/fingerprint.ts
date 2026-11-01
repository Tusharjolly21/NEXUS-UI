import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.23;

/** A low scanner hum that rises as the beam sweeps down, a tick at each ridge it crosses, and a two-note success. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 280, t(0.05), 0.05, 0.8, 1200, "square");
  swish(c, o, t(0.1), t(0.7), 900, 3600, 0.02);
  [0.25, 0.45, 0.65].forEach((at, i) => tick(c, o, t(at), 0.09, 3200 + i * 400));
  ding(c, o, N.G6, t(0.88), 0.07, 0.4);
  ding(c, o, N.C7, t(0.98), 0.07, 0.55);
}
