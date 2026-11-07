import { plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A mechanical click, the shutter sliding with a low whirr, four quick disk-seek chirps, and a bright two note jingle that says saved before the shutter clicks home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.14, 3600);
  swish(c, o, t(0.04), t(0.24), 300, 900, 0.04);
  blip(c, o, 140, t(0.1), 0.05, 0.4, 190, "sawtooth");
  [0.32, 0.38, 0.43, 0.49].forEach((at, i) => blip(c, o, [1900, 2600, 2100, 3000][i], t(at), 0.035, 0.03));
  plink(c, o, N.D5, t(0.58), 0.09, 0.14);
  plink(c, o, N.B5, t(0.67), 0.09, 0.22);
  swish(c, o, t(0.76), t(0.22), 900, 300, 0.03);
  tick(c, o, t(0.98), 0.12, 3200);
}
