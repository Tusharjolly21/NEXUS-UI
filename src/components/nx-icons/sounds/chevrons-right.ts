import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.5;

/** A wave of three glassy notes climbing as the colour runs through the chevrons, with a light sweep to the right underneath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.4), 900, 3600, 0.025);
  ding(c, o, N.G5, t(0.05), 0.06, 0.35);
  ding(c, o, N.D6, t(0.17), 0.055, 0.35);
  ding(c, o, N.A6, t(0.3), 0.05, 0.45);
  tick(c, o, t(0.08), 0.05, 4400);
  tick(c, o, t(0.2), 0.05, 4800);
}
