import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.78;

/** A quiet lift, a quickening swish as the stamp drops, a heavy rubber thunk with a paper slap as it lands, a soft squash as it presses, and a sticky peel as it lifts away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 500, 1500, 0.025); // 0.02-0.24 the stamp lifts
  swish(c, o, t(0.3), t(0.17), 700, 2400, 0.05); // 0.30-0.47 the stamp drops quickly
  thud(c, o, t(0.468), 85, 0.25, 0.2); // 0.47 the stamp hits the page: thunk
  blip(c, o, 520, t(0.468), 0.06, 0.05, 260, "triangle"); // 0.47 the wooden body knocks
  puff(c, o, t(0.468), 0.06, 2200, 0.07, "bandpass"); // 0.47 the paper slaps
  blip(c, o, 240, t(0.5), 0.045, 0.1, 130, "triangle"); // 0.50 the rubber squashes and the ink line widens
  tick(c, o, t(0.58), 0.06, 2800); // 0.58 the rubber starts to peel off
  swish(c, o, t(0.58), t(0.3), 1600, 500, 0.02); // 0.58-0.88 the stamp rises, peeling away
}
