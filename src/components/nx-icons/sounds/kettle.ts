import { ding, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A heavy metal tip as the kettle leans over, a thin pouring stream with a few bubbly glugs, and a hollow tonk as it rocks back upright. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.3), 350, 700, 0.03); // 0.00-0.31 the kettle tips forward
  ding(c, o, 1150, t(0.3), 0.03, 0.2); // 0.31 the lid chimes as the tilt stops
  swish(c, o, t(0.1), t(0.45), 1400, 2400, 0.05); // 0.10-0.55 water streams out of the spout
  swish(c, o, t(0.55), t(0.4), 2400, 1500, 0.045); // 0.55-0.95 the stream keeps pouring then thins
  blip(c, o, 700, t(0.4), 0.05, 0.08, 1100); // 0.40 a glug in the stream
  blip(c, o, 620, t(0.53), 0.04, 0.08, 1000); // 0.53 another glug
  blip(c, o, 560, t(0.66), 0.035, 0.08, 900); // 0.66 a third glug
  swish(c, o, t(0.77), t(0.33), 450, 250, 0.025); // 0.77-1.10 the kettle rocks back
  ding(c, o, 520, t(1.08), 0.05, 0.28); // 1.08 the base lands with a hollow tonk
  thud(c, o, t(1.1), 120, 0.08, 0.1); // 1.10 weight settles on the stove
}
