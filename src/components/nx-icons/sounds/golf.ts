import { ding, blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.75;

/** A soft roll across the green, a hollow plop and a rattle of the cup as the ball drops in, fabric flaps as the flag flutters, and a small pop as the ball reappears on its mound. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.74, 2000, 1200, 0.03); // 0.33 the ball rolls over the grass
  thud(c, o, t(0.3), 180, 0.05, 0.05); // 0.30 it reaches the flat green
  blip(c, o, 420, t(0.74), 0.12, 0.08, 240); // 0.74 plop as it tips into the hole
  tick(c, o, t(0.84), 0.1, 2600); // 0.84 it reaches the bottom of the cup
  ding(c, o, 1900, t(0.84), 0.045, 0.25); // 0.84 the cup rattles
  swish(c, o, t(0.66), 0.6, 1500, 2200, 0.015); // 0.93 breeze blows the flag
  puff(c, o, t(0.8), 0.06, 2600, 0.05, "bandpass"); // 0.80 flag snaps one way
  puff(c, o, t(0.97), 0.06, 2300, 0.045, "bandpass"); // 0.97 flag snaps back
  puff(c, o, t(1.15), 0.06, 2000, 0.035, "bandpass"); // 1.15 a smaller snap
  blip(c, o, 600, t(0.93), 0.08, 0.08, 1100); // 0.93 the ball pops back onto its mound
}
