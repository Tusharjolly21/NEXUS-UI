import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.59;

/** A soft rubber click as the power button is pressed and a lighter one as it comes back, then short rising electronic chirps that fire with each signal arc, inner arc then outer arc, twice. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.175), 240, 0.1, 0.06); // 0.175 the power button bottoms out
  tick(c, o, t(0.175), 0.1, 1000); // 0.175 rubber click
  tick(c, o, t(0.3), 0.05, 1800); // 0.30 the power button springs back
  blip(c, o, 3000, t(0.31), 0.04, 0.09, 3900, "square"); // 0.31 the inner arc fires
  blip(c, o, 3800, t(0.43), 0.04, 0.09, 4900, "square"); // 0.43 the outer arc fires
  blip(c, o, 3000, t(0.76), 0.035, 0.09, 3900, "square"); // 0.76 the inner arc fires again
  blip(c, o, 3800, t(0.88), 0.035, 0.09, 4900, "square"); // 0.88 the outer arc fires again
  swish(c, o, t(0.31), t(0.34), 2500, 5200, 0.012); // 0.31-0.65 the first wave grows outward
  swish(c, o, t(0.76), t(0.34), 2500, 5200, 0.012); // 0.76-1.10 the second wave grows outward
}
