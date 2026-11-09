import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A deep rotor whop at each of the four rotor blur beats (0.11, 0.34, 0.56 and 0.79) over a high tail rotor buzz that sinks as its spin slows, and a turbine whine that climbs as the helicopter lifts (0.00 to 0.35) and falls as it settles to a light skid tap at 1.00. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.00-0.90 the tail rotor buzzes, high at first and sinking as the spin eases
  swish(c, o, t(0.0), t(0.9), 3600, 1300, 0.02);
  // 0.00-0.35 the turbine spools up as the helicopter lifts
  blip(c, o, 700, t(0.0), 0.025, 0.35, 1300, "sawtooth");
  // 0.11 rotor whop
  thud(c, o, t(0.11), 95, 0.16, 0.09);
  // 0.34 rotor whop
  thud(c, o, t(0.34), 95, 0.16, 0.09);
  // 0.56 rotor whop
  thud(c, o, t(0.56), 95, 0.16, 0.09);
  // 0.70-1.00 the helicopter settles, turbine whine falls
  blip(c, o, 1300, t(0.7), 0.025, 0.3, 800, "sawtooth");
  // 0.79 rotor whop
  thud(c, o, t(0.79), 95, 0.14, 0.09);
  // 1.00 the skids touch down
  thud(c, o, t(1.0), 120, 0.1, 0.07);
}
