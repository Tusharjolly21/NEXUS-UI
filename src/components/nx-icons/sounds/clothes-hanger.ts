import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Soft cloth swishes with a small metal squeak of the hook at each end of the swing, fading as the hanger comes to rest. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 700, 1500, 0.03); // 0.00-0.20 the hanger swings out to the right
  blip(c, o, 3400, t(0.2), 0.03, 0.06, 2900, "triangle"); // 0.20 the hook squeaks on the rail at the far end
  swish(c, o, t(0.2), t(0.24), 1500, 700, 0.03); // 0.20-0.44 it swings back left
  blip(c, o, 3200, t(0.44), 0.025, 0.06, 2800, "triangle"); // 0.44 squeak at the left end
  swish(c, o, t(0.44), t(0.22), 1200, 600, 0.022); // 0.44-0.66 a smaller swing right
  blip(c, o, 3000, t(0.66), 0.018, 0.05, 2700, "triangle"); // 0.66 squeak, quieter
  swish(c, o, t(0.66), t(0.18), 900, 500, 0.015); // 0.66-0.84 a smaller swing left
  tick(c, o, t(0.84), 0.04, 2600); // 0.84 the hook ticks on the rail
  tick(c, o, t(1.0), 0.03, 2200); // 1.00 it hangs still
}
