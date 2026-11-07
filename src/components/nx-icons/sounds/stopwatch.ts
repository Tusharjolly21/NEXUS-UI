import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.18;

/** A crisp metal button click, a run of ticks that follow the sweeping hand and slow down at the end, firmer tocks as it passes the four dial dots, and a second click when the button stops it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.08), 0.15, 2600); // 0.08 the top button bottoms out: start click
  thud(c, o, t(0.08), 300, 0.05, 0.04); // 0.08 the button body knocks
  tick(c, o, t(0.17), 0.07, 3400); // 0.17 the button springs back up
  swish(c, o, t(0.18), t(0.75), 1800, 2800, 0.012); // 0.18-0.93 the hand whirrs round
  [0.269, 0.304, 0.392, 0.44, 0.519, 0.555, 0.629, 0.67, 0.779, 0.822, 0.867].forEach((at, i) => tick(c, o, t(at), 0.06, 3600 + (i % 2) * 400)); // 0.27-0.87 the hand ticks round the dial, slowing at the end
  [0.35, 0.491, 0.601, 0.732].forEach((at) => { tick(c, o, t(at), 0.11, 2400); ding(c, o, 3100, t(at), 0.03, 0.08); }); // 0.35 0.49 0.60 0.73 the hand passes a dial dot
  tick(c, o, t(0.93), 0.05, 3000); // 0.93 the hand is back at the top
  tick(c, o, t(1.0), 0.17, 2400); // 1.00 the button bottoms out: stop click
  thud(c, o, t(1.0), 220, 0.06, 0.05); // 1.00 the button body knocks
  ding(c, o, 2000, t(1.0), 0.03, 0.2); // 1.00 a small metal ring of the case
  tick(c, o, t(1.09), 0.07, 3400); // 1.09 the button springs back up
}
