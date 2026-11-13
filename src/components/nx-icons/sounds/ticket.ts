import { tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A paper rustle as the ticket tilts, then three sharp punch clicks that rise in pitch, one per perforation dot. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.16, 2600, 0.05); // 0.00-0.20 ticket tilts one way
  tick(c, o, t(0.27), 0.2, 3400); // 0.27 first dot pops
  tick(c, o, t(0.43), 0.2, 4600); // 0.43 second dot pops
  tick(c, o, t(0.59), 0.2, 6000); // 0.59 third dot pops
  puff(c, o, t(0.6), 0.1, 2200, 0.03); // 0.60 tilt returns
  thud(c, o, t(0.8), 260, 0.05, 0.05); // 0.80 the ticket settles flat
}
