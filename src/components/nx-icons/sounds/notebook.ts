import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A flap of the cover opening, three quick pencil scratches as the lines are written, and a soft pat as the cover settles shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.26), 500, 1800, 0.05);
  thud(c, o, t(0.07), 320, 0.07, 0.05);
  [0.32, 0.46, 0.6].forEach((at, i) => puff(c, o, t(at), 0.11, 5600 - i * 400, 0.045, "highpass"));
  [0.32, 0.46, 0.6].forEach((at) => swish(c, o, t(at), t(0.1), 3000, 5200, 0.02));
  swish(c, o, t(0.72), t(0.2), 1500, 450, 0.04);
  thud(c, o, t(0.88), 150, 0.14, 0.09);
}
