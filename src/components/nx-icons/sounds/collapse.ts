import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.02;

/** Air is sucked inwards as the four arrows pull towards the centre, a dull squeeze thud as the heads meet closest, a light bounce back out, and a tick as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.3), 2000, 500, 0.05); // 0.00-0.30 the arrows pull in, fastest at 0.15
  blip(c, o, 900, t(0.02), 0.06, 0.28, 300, "triangle"); // 0.02-0.30 the squeeze falls in pitch
  thud(c, o, t(0.3), 140, 0.2, 0.12); // 0.30 the heads are at their closest: a squeeze thud
  blip(c, o, 260, t(0.3), 0.06, 0.07, 400); // 0.30 a tiny pop of the compressed air
  swish(c, o, t(0.3), t(0.225), 600, 1500, 0.03); // 0.30-0.53 the arrows bounce back out past their start
  tick(c, o, t(0.525), 0.07, 2800); // 0.53 the bounce ends
  tick(c, o, t(0.73), 0.05, 2200); // 0.73 the arrows settle
}
