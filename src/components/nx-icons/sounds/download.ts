import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.73;

/** A whoosh as the arrow drops, a thud and a bright two-note chime as the tray lights, and a soft rise as it returns. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.3), 2400, 600, 0.05);
  thud(c, o, t(0.3), 150, 0.16, 0.12);
  ding(c, o, N.D6, t(0.32), 0.1, 0.5);
  ding(c, o, N.G6, t(0.4), 0.1, 0.6);
  swish(c, o, t(0.34), t(0.38), 500, 1500, 0.02);
}
