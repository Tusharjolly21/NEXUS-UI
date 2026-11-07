import { blip, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick backward swish, a hard punch whoosh, a heavy leather thump with a snap on contact, and a light pop as it snaps back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.25), 300, 900, 0.04);
  swish(c, o, t(0.27), t(0.15), 1200, 3400, 0.09);
  thud(c, o, t(0.41), 85, 0.4, 0.2);
  puff(c, o, t(0.41), 0.06, 2500, 0.1, "bandpass");
  tick(c, o, t(0.43), 0.12, 2200);
  blip(c, o, N.C5, t(0.62), 0.05, 0.12, N.G4, "triangle");
}
