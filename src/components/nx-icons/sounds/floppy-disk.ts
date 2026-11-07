import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.4;

/** The metal shutter slides open with a scrape and a click at the end of its travel (0.25), a rising digital chirp as the save tick is drawn and a square beep when it completes at 0.5, then the shutter slides shut and clicks home at 1.0. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02-0.25 shutter slides open
  tick(c, o, t(0.02), 0.1, 3600);
  swish(c, o, t(0.02), t(0.23), 500, 1400, 0.04);
  // 0.25 shutter hits the end of its travel
  tick(c, o, t(0.25), 0.12, 2800);
  thud(c, o, t(0.25), 260, 0.07, 0.04);
  // 0.26-0.5 the save tick is drawn: chirp rises
  blip(c, o, 900, t(0.26), 0.035, 0.24, 2100, "square");
  // 0.5 the tick is complete: save beep
  blip(c, o, 2400, t(0.5), 0.05, 0.12, undefined, "square");
  // 0.7-1.0 shutter slides shut
  tick(c, o, t(0.7), 0.05, 3000);
  swish(c, o, t(0.7), t(0.3), 1400, 500, 0.035);
  // 1.0 shutter clicks home
  tick(c, o, t(1.0), 0.14, 3200);
  thud(c, o, t(1.0), 260, 0.08, 0.05);
}
