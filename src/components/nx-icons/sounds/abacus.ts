import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.89;

/** Six wooden knocks: a bead on each rod clacks against its neighbour as it slides across, from the top rod to the bottom, and a second set of clacks as each slides back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.21), 700, 1400, 0.015); // 0.00-0.21 top bead slides
  blip(c, o, 1000, t(0.205), 0.1, 0.04, 640, "triangle"); // 0.21 top bead clacks into place
  tick(c, o, t(0.21), 0.08, 2600); // 0.21 wood on wood
  blip(c, o, 1250, t(0.355), 0.1, 0.04, 780, "triangle"); // 0.36 middle bead clacks
  tick(c, o, t(0.36), 0.08, 3000); // 0.36 wood on wood
  blip(c, o, 800, t(0.505), 0.1, 0.045, 500, "triangle"); // 0.51 bottom bead clacks
  tick(c, o, t(0.51), 0.08, 2300); // 0.51 wood on wood
  blip(c, o, 1000, t(0.695), 0.09, 0.04, 640, "triangle"); // 0.70 top bead returns and clacks
  blip(c, o, 1250, t(0.845), 0.09, 0.04, 780, "triangle"); // 0.85 middle bead returns
  blip(c, o, 800, t(0.995), 0.09, 0.045, 500, "triangle"); // 1.00 bottom bead returns
  tick(c, o, t(1.0), 0.06, 2300); // 1.00 last knock
}
