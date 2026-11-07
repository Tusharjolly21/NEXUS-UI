import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.79;

/** A latch snap and a springy pop as the lid flies open, a metal hinge clank, steel clinks as the hammer and wrench slide out, a rattle as they drop back, then a heavy clunk and latch click as the lid shuts. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.14, 2600); // 0.02 the latch snaps
  blip(c, o, 180, t(0.03), 0.08, 0.2, 420, "triangle"); // 0.03 the lid springs up
  swish(c, o, t(0.06), t(0.27), 1800, 3200, 0.03); // 0.06-0.33 the hammer slides out
  ding(c, o, 1480, t(0.29), 0.05, 0.25); // 0.29 the lid hits its open stop, the hinge clanks
  thud(c, o, t(0.29), 140, 0.1, 0.1);
  ding(c, o, 3100, t(0.33), 0.05, 0.3); // 0.33 the hammer head reaches the top
  tick(c, o, t(0.41), 0.04, 3200); // 0.42 the lid bounces back to rest on its stop
  ding(c, o, 2300, t(0.44), 0.05, 0.3); // 0.44 the wrench reaches the top
  tick(c, o, t(0.44), 0.06, 5400);
  swish(c, o, t(0.78), t(0.23), 3000, 900, 0.03); // 0.78-1.0 the tools drop back, rattling
  ding(c, o, 1900, t(1.01), 0.05, 0.25); // 1.01 the hammer lands
  tick(c, o, t(1.01), 0.08, 4800);
  ding(c, o, 2600, t(1.045), 0.04, 0.25); // 1.04 the wrench lands
  tick(c, o, t(1.045), 0.06, 5400);
  thud(c, o, t(1.08), 120, 0.3, 0.12); // 1.08 the lid slams shut
  tick(c, o, t(1.09), 0.1, 2000); // 1.09 the latch clicks
}
