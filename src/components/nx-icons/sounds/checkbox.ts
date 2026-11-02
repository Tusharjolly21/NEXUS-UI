import { ding, plink, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.18;

/** A crisp click as the box is pressed, two quick rising plucks as the tick is drawn, and a bright bell chime on top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.03), 0.14, 3800);
  thud(c, o, t(0.04), 160, 0.12, 0.06);
  plink(c, o, N.G5, t(0.14), 0.08, 0.12);
  plink(c, o, N.C6, t(0.24), 0.08, 0.14);
  ding(c, o, N.E7, t(0.32), 0.06, 0.5);
}
