import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft slide of tubing, then two heartbeats as low lub-dub thumps, each answered by a small bright tink from the chest piece. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.24), 700, 1500, 0.02);
  thud(c, o, t(0.3), 84, 0.26, 0.11);
  thud(c, o, t(0.41), 104, 0.19, 0.09);
  ding(c, o, N.B5, t(0.32), 0.05, 0.32);
  thud(c, o, t(0.66), 84, 0.26, 0.11);
  thud(c, o, t(0.77), 104, 0.19, 0.09);
  ding(c, o, N.G4, t(0.68), 0.06, 0.4);
}
