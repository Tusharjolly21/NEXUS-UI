import { plink, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.61;

/** A dry shutter click, a short falling sweep as the slash is drawn, then two low descending plucks and a muted tick as the lens goes dark. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.03), 0.14, 4200);
  puff(c, o, t(0.05), 0.05, 2400, 0.05, "bandpass");
  swish(c, o, t(0.1), t(0.4), 3200, 700, 0.04);
  plink(c, o, N.D6, t(0.14), 0.07, 0.12);
  plink(c, o, N.A5, t(0.3), 0.07, 0.14);
  blip(c, o, 300, t(0.46), 0.06, 0.18, 140, "triangle");
  tick(c, o, t(0.5), 0.07, 1800);
}
