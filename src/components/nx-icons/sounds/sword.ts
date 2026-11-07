import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.07;

/** A slow metallic draw-back, a hard whoosh through the swing that ends in a ringing steel clang as the blade stops, and a thin glint shimmer running up the blade. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.06), t(0.22), 400, 1100, 0.06); // 0.06 the blade winds back
  tick(c, o, t(0.29), 0.06, 3000); // 0.29 the wind-up reaches its stop
  swish(c, o, t(0.34), t(0.22), 1500, 5000, 0.1); // 0.34 the slash, fastest at 0.46
  ding(c, o, 1480, t(0.55), 0.1, 0.55); // 0.55 the blade reaches the end of the arc and rings
  ding(c, o, 2290, t(0.55), 0.045, 0.35); // 0.55 inharmonic ring of the steel
  tick(c, o, t(0.55), 0.12, 3500); // 0.55 hard stop of the swing
  swish(c, o, t(0.6), t(0.18), 2600, 900, 0.025); // 0.6 the blade bounces back, overshoot
  ding(c, o, 5300, t(0.58), 0.035, 0.3); // 0.58 the glint appears on the blade
  swish(c, o, t(0.62), t(0.32), 4000, 8500, 0.018); // 0.62 the glint runs up the blade
}
