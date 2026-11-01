import { plink, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.74;

/** A falling swish, a deep thud as the arrow lands on the floor line, and a bright tink as the line flashes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 2600, 500, 0.05);
  thud(c, o, t(0.3), 95, 0.22, 0.12);
  tick(c, o, t(0.3), 0.1, 2800);
  plink(c, o, N.G6, t(0.34), 0.06, 0.12);
}
