import { ding, blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.18;

/** A hinge creak made of rapid sawtooth pulses as the door swings shut, a dull knock and latch click when it meets the frame, a faint glint for the sliver of light, a latch release and a lower creak as it swings open, then a small knock. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => {
    const f = 170 + i * 16 + (i % 2) * 28;
    blip(c, o, f, t(0.06 + i * 0.037), 0.02 + 0.035 * Math.sin(Math.PI * (i + 0.5) / 9), 0.06, f * 1.15, "sawtooth"); // 0.06-0.38 the door swings shut, creaking loudest at its fastest swing near 0.22
  });
  thud(c, o, t(0.38), 150, 0.22, 0.1); // 0.38 the door meets the frame
  tick(c, o, t(0.4), 0.1, 2600); // 0.4 the latch clicks
  ding(c, o, 3400, t(0.42), 0.03, 0.3); // 0.42 the sliver of light is fully lit
  tick(c, o, t(0.6), 0.09, 3200); // 0.6 the latch lets go
  [0, 1, 2, 3, 4, 5, 6].forEach((i) => {
    const f = 320 - i * 18 + (i % 2) * 20;
    blip(c, o, f, t(0.62 + i * 0.036), 0.02 + 0.03 * Math.sin(Math.PI * (i + 0.5) / 7), 0.06, f * 0.88, "sawtooth"); // 0.62-0.86 the door swings open, creaking loudest near 0.72
  });
  thud(c, o, t(0.84), 120, 0.1, 0.08); // 0.84 the door reaches its open stop
  blip(c, o, 175, t(0.92), 0.025, 0.08, 150, "sawtooth"); // 0.92 a last little creak as it settles to rest
}
