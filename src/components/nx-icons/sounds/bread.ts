import { ding, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A warm low swell as the dough rises, a crackle of crust, then three breathy puffs of steam with a soft high chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 147, t(0.02), 0.07, 0.6, 196, "triangle");
  swish(c, o, t(0.04), t(0.5), 220, 700, 0.03);
  [0.22, 0.3, 0.37, 0.52].forEach((at, i) => tick(c, o, t(at), 0.05 + i * 0.01, 2400 + i * 380));
  [0.2, 0.38, 0.56].forEach((at) => puff(c, o, t(at), 0.22, 4800, 0.03, "bandpass"));
  ding(c, o, N.G5, t(0.74), 0.035, 0.4);
  ding(c, o, N.A6, t(0.84), 0.03, 0.4);
}
