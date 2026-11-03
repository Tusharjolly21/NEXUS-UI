import { plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.59;

/** Two rising whooshes, one chasing the other, a quick buzzy three-note run up the scale as the chevrons race off, a falling breath as they return, and two bright notes when they land. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.36), 700, 4400, 0.06);
  swish(c, o, t(0.09), t(0.36), 500, 3800, 0.04);
  [N.E5, N.A5, N.C6].forEach((f, i) => blip(c, o, f, t(0.03 + i * 0.08), 0.03, 0.06, f * 1.3, "square"));
  swish(c, o, t(0.4), t(0.36), 3200, 900, 0.03);
  plink(c, o, N.D6, t(0.7), 0.06, 0.12);
  plink(c, o, N.A6, t(0.78), 0.05, 0.2);
}
