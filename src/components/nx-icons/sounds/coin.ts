import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.74;

/** A bright ting as it is tossed, whooshes and edge-on ticks as it spins, a clink on landing and two sparkles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.C7, t(0), 0.1, 0.5);
  ding(c, o, N.G7, t(0.01), 0.06, 0.5);
  swish(c, o, t(0.1), t(0.25), 3000, 5200, 0.025);
  swish(c, o, t(0.55), t(0.25), 3000, 5200, 0.025);
  tick(c, o, t(0.225), 0.06, 7000);
  tick(c, o, t(0.675), 0.06, 7000);
  ding(c, o, N.G6, t(0.9), 0.12, 0.6);
  ding(c, o, N.D7, t(0.9), 0.08, 0.6);
  tick(c, o, t(0.9), 0.12, 4000);
  ding(c, o, N.C8, t(1.07), 0.04, 0.4);
  ding(c, o, N.G7, t(1.19), 0.04, 0.4);
}
