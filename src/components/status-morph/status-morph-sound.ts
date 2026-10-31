/**
 * Status Morph's sounds, made with the Web Audio API (no audio files), in a soft, glassy Apple-like voice:
 * small sine bells with a quiet overtone, bubbly plinks that pitch up, and airy swishes.
 *
 * Each sound is scored against the animation, so its notes land on the picture: the dots' plinks as each
 * dot drops into the ring's gap, the chime's notes as each Wi-Fi arc fills in, the pips as each bar stands
 * back up. `p` is the component's playback speed, so the score keeps in step at any speed.
 *
 *   connect      a soft tap, three glassy notes falling as the battery drains, an airy swish as the outline
 *                rounds into the ring, then four rising plinks as the dots drop into the gap
 *   ripple       three faint ticks climbing with the Wi-Fi arcs, once per ripple while it searches
 *   connected    tiny gulps as the ring swallows the dots, a warm bloom with the pulse, then a bright
 *                three-note chime as the arcs fill in
 *   disconnect   a falling swish as the ring unrolls, four pips climbing as the bars stand back up, and a
 *                bubbly two-note "charging" chime as the bolt pops in
 *   cancel       two soft notes stepping down, for letting go while it is still joining
 */
import { hiss, tone, type SoundDef } from "@/lib/ui-sounds";

type Out = AudioNode;

/** A small glass bell: a pure tone with a quiet octave and a faint glassy overtone that dies first. */
function bell(c: AudioContext, o: Out, freq: number, at: number, gain: number, decay = 0.6) {
  tone(c, o, { freq, at, attack: 0.004, decay, gain });
  tone(c, o, { freq: freq * 2, at, attack: 0.003, decay: decay * 0.45, gain: gain * 0.28 });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.002, decay: decay * 0.18, gain: gain * 0.12 });
}

/** A bubbly plink: a note that springs up into pitch, with a tiny bright tick on top. */
function plink(c: AudioContext, o: Out, freq: number, at: number, gain: number) {
  tone(c, o, { freq: freq * 0.72, to: freq, glide: 0.035, at, attack: 0.003, decay: 0.13, gain });
  tone(c, o, { freq: freq * 3, at, attack: 0.001, decay: 0.025, gain: gain * 0.18 });
}

/** A soft swish of air sweeping between two pitches. */
function swish(c: AudioContext, o: Out, at: number, from: number, to: number, length: number, gain: number) {
  hiss(c, o, { at, attack: length * 0.45, decay: length * 0.55, freq: from, to, gain, q: 0.8 });
}

// C major pentatonic, around the top of a piano: bright but never shrill.
const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98, A6 = 1760;

export type StatusMorphSound = "connect" | "ripple" | "connected" | "disconnect" | "cancel";

export function statusMorphSounds(speed: number): Record<StatusMorphSound, SoundDef> {
  const t = (s: number) => s / speed;
  return {
    connect: {
      category: "Status Morph",
      label: "Connect",
      play: (c, o) => {
        tone(c, o, { freq: 1500, to: 1100, glide: 0.02, attack: 0.002, decay: 0.045, gain: 0.16 });
        hiss(c, o, { freq: 5200, decay: 0.012, gain: 0.05, filter: "highpass" });
        // the battery drains: green, amber, red
        [E6, C6, A5].forEach((f, i) => bell(c, o, f, t(0.06 + i * 0.11), 0.07, 0.28));
        swish(c, o, t(0.36), 900, 2600, t(0.5), 0.05);
        // dots land in the gap rightmost first (they set off in that order), so the notes climb
        [G5, A5, C6, D6].forEach((f, i) => plink(c, o, f, t(1.0 + i * 0.07), 0.13));
      },
    },
    ripple: {
      category: "Status Morph",
      label: "Searching",
      play: (c, o) => [C6, E6, G6].forEach((f, i) => tone(c, o, { freq: f, at: t(i * 0.17), attack: 0.003, decay: 0.07, gain: 0.06 })),
    },
    connected: {
      category: "Status Morph",
      label: "Connected",
      play: (c, o) => {
        [D6, C6, A5, G5].forEach((f, i) => tone(c, o, { freq: f, to: f * 0.7, glide: 0.06, at: t(0.05 + i * 0.04), attack: 0.002, decay: 0.06, gain: 0.05 }));
        bell(c, o, C5, t(0.3), 0.1, 0.9);
        [C6, E6, G6].forEach((f, i) => bell(c, o, f, t(0.34 + i * 0.1), 0.11, 0.7));
        bell(c, o, C6 * 2, t(0.66), 0.035, 0.9);
      },
    },
    disconnect: {
      category: "Status Morph",
      label: "Disconnect",
      play: (c, o) => {
        swish(c, o, t(0.12), 2400, 700, t(0.45), 0.045);
        // the bars stand back up, shortest first
        [G5, A5, C6, E6].forEach((f, i) => plink(c, o, f, t(0.82 + i * 0.06), 0.09));
        // the bolt pops in: a bubbly "charging" chime
        tone(c, o, { freq: 420, to: 840, glide: 0.07, at: t(1.0), attack: 0.004, decay: 0.12, gain: 0.12 });
        bell(c, o, E6, t(1.07), 0.08, 0.5);
        bell(c, o, A6, t(1.15), 0.06, 0.6);
      },
    },
    cancel: {
      category: "Status Morph",
      label: "Cancel",
      play: (c, o) => {
        bell(c, o, G5, 0, 0.08, 0.25);
        bell(c, o, E5, t(0.1), 0.08, 0.35);
      },
    },
  };
}
