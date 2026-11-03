import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.7;

/** A buzzy motor that climbs fast as the disc spins up, then slides back down as it slows, with soft ticks from the spinning arcs and a gentle two-note bell as the hub pulses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 180, t(0.02), 0.04, 0.5, 1100, "sawtooth");
  blip(c, o, 1100, t(0.5), 0.03, 0.5, 240, "sawtooth");
  swish(c, o, t(0.05), t(0.9), 1200, 2400, 0.018);
  tick(c, o, t(0.3), 0.05, 4400);
  tick(c, o, t(0.52), 0.05, 4000);
  tick(c, o, t(0.76), 0.05, 3600);
  ding(c, o, N.E6, t(0.1), 0.045, 0.5);
  ding(c, o, N.C5, t(0.45), 0.04, 0.4);
  ding(c, o, N.D6, t(0.8), 0.04, 0.4);
  ding(c, o, N.A5, t(0.92), 0.05, 0.4);
}
