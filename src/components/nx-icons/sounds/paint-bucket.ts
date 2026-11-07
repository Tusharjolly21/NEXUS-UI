import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.57;

/** Paint sloshing and glugging as the bucket tips, a thin whistle as the drop falls, a wet plop where it lands, then a rising gurgle as the swatch fills and a small bloop as the next drop forms. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.24), 250, 520, 0.04); // 0.04-0.28 the bucket tips and the paint sloshes
  blip(c, o, 170, t(0.1), 0.08, 0.1, 290, "triangle"); // 0.10 first glug at the fastest part of the tilt
  blip(c, o, 210, t(0.19), 0.07, 0.1, 340, "triangle"); // 0.19 second glug as the tilt eases out
  blip(c, o, 1300, t(0.3), 0.02, 0.26, 2400); // 0.30-0.56 the drop lets go and falls, a thin rising whistle
  blip(c, o, 420, t(0.56), 0.14, 0.11, 1100); // 0.56 the drop lands in the swatch: plop
  puff(c, o, t(0.56), 0.05, 1500, 0.06, "lowpass"); // 0.56 splat of the landing
  swish(c, o, t(0.52), t(0.43), 300, 700, 0.035); // 0.52-0.95 the bucket slides back upright
  swish(c, o, t(0.58), t(0.3), 400, 1900, 0.03); // 0.58-0.9 the colour rises in the swatch
  blip(c, o, 260, t(0.66), 0.05, 0.09, 520, "triangle"); // 0.66 a gurgle as the swatch fills
  blip(c, o, 1500, t(0.8), 0.04, 0.07, 2300); // 0.80 the next drop swells at the lip
}
