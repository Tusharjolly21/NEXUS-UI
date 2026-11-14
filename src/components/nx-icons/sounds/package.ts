import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.88;

/** A cardboard creak as the box crouches, a ripping tape as it hops, a tape press as it falls, and a hollow cardboard thud on landing. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 210, t(0.02), 0.05, 0.1, 150, "triangle"); // 0.00-0.12 the box crouches and its sides creak
  swish(c, o, t(0.12), t(0.22), 500, 1700, 0.03); // 0.12-0.34 the hop up, a little air
  [0.13, 0.155, 0.175, 0.2, 0.215, 0.24, 0.26, 0.285].forEach((at, i) => tick(c, o, t(at), 0.07 + (i % 3) * 0.02, 4200 + (i % 4) * 400)); // 0.12-0.30 the tape peels back off the lid
  swish(c, o, t(0.12), t(0.18), 1800, 5600, 0.04); // the rip itself
  puff(c, o, t(0.4), 0.15, 2200, 0.035, "bandpass"); // 0.36-0.58 the tape is pressed back on while falling
  thud(c, o, t(0.58), 105, 0.26, 0.16); // 0.58 the box lands and squashes
  puff(c, o, t(0.58), 0.1, 800, 0.05, "lowpass"); // 0.58 dust and cardboard air out of the box
  tick(c, o, t(0.58), 0.12, 3000); // 0.58 the tape slaps flat as it lands
  thud(c, o, t(0.72), 190, 0.07, 0.07); // 0.72 the settle rebound
}
