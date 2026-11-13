import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three fast glassy cracks as the zigzag opens, a pause while the halves hang apart, then a whoosh, a dull knock and a thin ring as they meet. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.05), 0.12, 4800); // 0.05 the crack starts at the notch
  tick(c, o, t(0.12), 0.1, 3900); // 0.12 the crack zigzags down
  tick(c, o, t(0.19), 0.09, 5400); // 0.19 the crack reaches the tip
  swish(c, o, t(0.5), t(0.1), 600, 1800, 0.02); // 0.50-0.60 the halves swing back
  thud(c, o, t(0.61), 150, 0.12, 0.09); // 0.61 the halves knock together
  ding(c, o, 1760, t(0.61), 0.03, 0.4); // 0.61 a thin ring of the break
  tick(c, o, t(0.7), 0.06, 3000); // 0.70 the overshoot settles
}
