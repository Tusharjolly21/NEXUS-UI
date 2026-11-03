import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.42;

/** A smooth sweep as the tablet tips over, a soft wake-up click, a rising three-note chime when the screen lights, a quiet sweep as it tips back upright, and a small settling tap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 800, 2400, 0.04);
  tick(c, o, t(0.3), 0.1, 3200);
  ding(c, o, N.D5, t(0.32), 0.05, 0.5);
  ding(c, o, N.A5, t(0.38), 0.06, 0.55);
  ding(c, o, N.E6, t(0.46), 0.05, 0.5);
  ding(c, o, N.G6, t(0.56), 0.035, 0.45);
  swish(c, o, t(0.76), t(0.3), 2400, 800, 0.035);
  thud(c, o, t(1.06), 180, 0.1, 0.07);
}
