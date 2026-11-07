import { ding, blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three beeps for three lamps: a low one for red, a middle one for amber and a bright bell pair for green, each with a soft hum underneath and a relay click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.06), 0.1, 2500);
  blip(c, o, N.G4, t(0.08), 0.08, 0.2, undefined, "triangle");
  tick(c, o, t(0.38), 0.1, 2900);
  blip(c, o, N.C5, t(0.4), 0.08, 0.2, undefined, "triangle");
  tick(c, o, t(0.7), 0.1, 3400);
  ding(c, o, N.E5, t(0.72), 0.1, 0.5);
  ding(c, o, N.B5, t(0.8), 0.06, 0.5);
  puff(c, o, t(0.05), 0.7, 260, 0.02, "lowpass");
}
