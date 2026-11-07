import { blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A little servo whirr as the camera pans out and back, with three crisp electronic beeps for the blinking record light. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.28, 2400, 0.03, "bandpass");
  blip(c, o, N.C4, t(0.02), 0.04, 0.26, N.G4, "sawtooth");
  puff(c, o, t(0.34), 0.34, 2000, 0.03, "bandpass");
  blip(c, o, N.A4, t(0.34), 0.04, 0.3, N.E4, "sawtooth");
  blip(c, o, N.G7, t(0.12), 0.05, 0.05);
  blip(c, o, N.G7, t(0.5), 0.05, 0.05);
  blip(c, o, N.G7, t(0.86), 0.05, 0.05);
  tick(c, o, t(0.98), 0.08, 3000);
}
