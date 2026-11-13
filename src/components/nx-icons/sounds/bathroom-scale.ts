import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.53;

/** A spring whirr as the needle falls to zero, a dull thud as someone steps on, rattling ratchet ticks as the needle races across, a clack at the far end, then two small bounces and a last tick as it rests. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.13), 2000, 900, 0.015); // 0.00-0.13 the needle falls back to zero
  tick(c, o, t(0.14), 0.1, 2600); // 0.14 the needle hits the zero stop
  thud(c, o, t(0.2), 110, 0.12, 0.09); // 0.20 a foot steps onto the platform
  [0.24, 0.28, 0.32].forEach((at, i) => tick(c, o, t(at), 0.07, 2800 + i * 400)); // 0.24-0.32 the needle ratchets across
  tick(c, o, t(0.36), 0.14, 2200); // 0.36 the needle hits its far end
  tick(c, o, t(0.54), 0.09, 2600); // 0.54 first bounce back
  tick(c, o, t(0.7), 0.06, 3000); // 0.70 second small bounce
  tick(c, o, t(0.85), 0.05, 3400); // 0.85 third tiny bounce
  tick(c, o, t(1.0), 0.04, 3600); // 1.00 the needle comes to rest
}
