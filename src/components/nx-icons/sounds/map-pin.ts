import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.8;

/** A whistle as the pin falls, a thud and a sonar ping as it lands, and a smaller bounce after. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.28), 1600, 380, 0.04);
  thud(c, o, t(0.31), 140, 0.28, 0.12);
  ding(c, o, N.G6, t(0.32), 0.09, 0.8);
  ding(c, o, N.C7, t(0.45), 0.04, 0.6);
  thud(c, o, t(0.68), 160, 0.07, 0.07);
}
