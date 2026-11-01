import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.39;

/** A whine as the flash charges, a crisp shutter click, a pop of light and the shutter opening again. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1400, t(0), 0.025, 0.2, 3200, "sawtooth");
  tick(c, o, t(0.17), 0.12, 3800);
  thud(c, o, t(0.17), 220, 0.07, 0.04);
  puff(c, o, t(0.24), 0.14, 6200, 0.07, "highpass");
  blip(c, o, 2400, t(0.24), 0.04, 0.12);
  tick(c, o, t(0.32), 0.12, 3200);
}
