import { ding, plink, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.23;

/** Two soft sweeps with two triangle tones gliding together until they land on the same note, a low squeeze thud, a dry click and a glassy ring as the branches join, and a last small pluck. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.42), 1800, 700, 0.035);
  swish(c, o, t(0.12), t(0.42), 2600, 900, 0.035);
  blip(c, o, N.E4, t(0.05), 0.06, 0.4, N.C5, "triangle");
  blip(c, o, N.C6, t(0.12), 0.05, 0.4, N.C5, "triangle");
  thud(c, o, t(0.5), 120, 0.2, 0.1);
  tick(c, o, t(0.56), 0.11, 3400);
  ding(c, o, N.C5, t(0.58), 0.07, 0.45);
  plink(c, o, N.G5, t(0.78), 0.05, 0.14);
}
