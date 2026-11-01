import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.89;

/** A coin whistling down, a bright ting as it lands, and a soft leathery thud as the wallet takes it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 3200, 5200, 0.02);
  ding(c, o, N.E7, t(0.3), 0.1, 0.5);
  ding(c, o, 3520, t(0.3), 0.05, 0.3);
  thud(c, o, t(0.32), 140, 0.14, 0.12);
  tick(c, o, t(0.3), 0.1, 3400);
}
