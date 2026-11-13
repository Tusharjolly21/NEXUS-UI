import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** An archer's draw and release: a creaking bow that tightens in pitch, a click at full draw, a sharp string twang as the arrow is let go with a rising whoosh as it flies off, then a gentle slide and a tap as a fresh arrow nocks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 150, t(0.0), 0.03, 0.42, 330, "sawtooth"); // 0.00-0.42 the bow creaks as the string is drawn
  tick(c, o, t(0.42), 0.06, 1800); // 0.42 full draw
  blip(c, o, 240, t(0.53), 0.1, 0.4, 200, "triangle"); // 0.53 the string is released, twang
  tick(c, o, t(0.53), 0.1, 3000); // 0.53 string snaps
  swish(c, o, t(0.53), t(0.17), 1500, 3500, 0.05); // 0.53-0.70 the arrow whooshes off the edge
  swish(c, o, t(0.9), t(0.5), 2500, 1200, 0.02); // 0.90-1.40 a fresh arrow slides in
  tick(c, o, t(1.4), 0.05, 2200); // 1.40 the arrow nocks on the string
}
