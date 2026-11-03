import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.16;

/** A rising sweep as the arrow glides in towards the handset, then a two-note chime that falls from B to G as it arrives, a faint high D on top, and a soft bump underneath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.42), 500, 3000, 0.05);
  thud(c, o, t(0.44), 120, 0.14, 0.09);
  ding(c, o, N.B5, t(0.46), 0.08, 0.45);
  ding(c, o, N.G5, t(0.62), 0.07, 0.55);
  ding(c, o, N.D6, t(0.76), 0.03, 0.4);
}
