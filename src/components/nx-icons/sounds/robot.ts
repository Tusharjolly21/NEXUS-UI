import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.12;

/** A servo whirr that follows each head tilt (rising for the left tilt, falling for the right) with a little stop-click where the eyes reach each end, and a square-wave antenna blip exactly when each of the two antenna pulses flashes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.03-0.25 head tilts left, servo winds up
  blip(c, o, 300, t(0.03), 0.035, 0.22, 560, "sawtooth");
  swish(c, o, t(0.03), t(0.22), 900, 2400, 0.03);
  // 0.2 antenna pulse #1 flashes
  blip(c, o, 2200, t(0.2), 0.05, 0.07, undefined, "square");
  blip(c, o, 3300, t(0.2), 0.02, 0.04);
  // 0.25 eyes and head reach the left end and stop
  tick(c, o, t(0.25), 0.07, 3200);
  // 0.26-0.5 head swings right (the big move), servo winds down
  blip(c, o, 560, t(0.27), 0.04, 0.24, 250, "sawtooth");
  swish(c, o, t(0.27), t(0.22), 2400, 800, 0.03);
  // 0.5 reaches the right end
  tick(c, o, t(0.5), 0.07, 3600);
  // 0.5-0.75 head tilts left again
  blip(c, o, 250, t(0.52), 0.035, 0.22, 470, "sawtooth");
  swish(c, o, t(0.52), t(0.22), 800, 2000, 0.028);
  // 0.6 antenna pulse #2 flashes
  blip(c, o, 2200, t(0.6), 0.05, 0.07, undefined, "square");
  blip(c, o, 3300, t(0.6), 0.02, 0.04);
  // 0.75 left end
  tick(c, o, t(0.75), 0.06, 3000);
  // 0.76-0.98 final small swing right and settle
  blip(c, o, 420, t(0.77), 0.03, 0.18, 230, "sawtooth");
  swish(c, o, t(0.77), t(0.2), 1800, 700, 0.022);
  // 0.97 head comes to rest
  tick(c, o, t(0.97), 0.05, 2600);
}
