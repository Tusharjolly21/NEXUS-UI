import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.94;

/** A latch click and a hollow plastic pop as the lid unclasps, light knocks as the open lid bounces on its hinge, soft sine pulses for the swelling cross, and a thud with a latch click as the lid shuts. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04 the latch lets go and the lid starts up
  tick(c, o, t(0.04), 0.14, 3400);
  blip(c, o, 260, t(0.05), 0.1, 0.1, 620, "triangle");
  swish(c, o, t(0.06), t(0.19), 500, 1300, 0.02);
  // 0.27 the lid reaches its highest point
  thud(c, o, t(0.27), 300, 0.1, 0.05);
  // 0.38 the cross swells
  blip(c, o, 330, t(0.38), 0.08, 0.22, 392);
  // 0.45 the lid bounces back to its lowest point
  thud(c, o, t(0.45), 280, 0.06, 0.04);
  // 0.585 the lid bounces up once more
  thud(c, o, t(0.585), 260, 0.04, 0.04);
  // 0.60-0.88 the lid swings shut
  swish(c, o, t(0.6), t(0.28), 1300, 500, 0.03);
  // 0.78 the cross swells again
  blip(c, o, 330, t(0.78), 0.06, 0.25, 392);
  // 0.9 the lid snaps shut
  thud(c, o, t(0.9), 135, 0.2, 0.09);
  tick(c, o, t(0.9), 0.14, 3400);
}
