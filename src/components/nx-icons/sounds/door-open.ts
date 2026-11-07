import { ding, blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A latch click and a long creaking sawtooth as the door swings shut with a dull knock, a thin bell for the line of light, then a creak back open. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.03), 0.1, 2600);
  blip(c, o, 150, t(0.05), 0.045, 0.34, 270, "sawtooth");
  thud(c, o, t(0.42), 150, 0.2, 0.08);
  ding(c, o, N.B5, t(0.46), 0.05, 0.4);
  blip(c, o, N.E5 / 2, t(0.66), 0.04, 0.3, 140, "sawtooth");
  puff(c, o, t(0.7), 0.3, 700, 0.02, "bandpass");
  tick(c, o, t(0.98), 0.06, 3400);
}
