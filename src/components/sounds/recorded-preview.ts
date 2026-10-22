import { playDef, type SoundDef } from "@/lib/ui-sounds";
import { RECORDED_SOUND_META } from "@/lib/ui-sounds-recorded-meta";

/**
 * Plays the recorded Pro sounds on the Sounds page. It uses small, compressed copies from
 * /sounds/preview, enough to judge each sound. The full-quality recordings are not part of the
 * site: they ship only in the `ui-sounds-recorded` registry item, which needs a Pro account.
 * Same engine, level and on/off rules as `@/lib/ui-sounds-recorded`.
 */
const LEVEL = 0.5;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

function buffer(name: string): Promise<AudioBuffer | null> {
  let p = buffers.get(name);
  if (!p) {
    p = fetch(`/sounds/preview/${name}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((bytes) => (bytes ? new OfflineAudioContext(1, 1, 48000).decodeAudioData(bytes) : null))
      .catch(() => null);
    buffers.set(name, p);
  }
  return p;
}

/** Start downloading and decoding a preview, e.g. when the pointer reaches its orb. */
export function warmRecordedPreview(name: string) {
  void buffer(name);
}

export function playRecordedPreview(name: string, force = true) {
  const meta = RECORDED_SOUND_META.find((m) => m.name === name);
  if (!meta) return;
  const def: SoundDef = {
    category: meta.category,
    label: meta.label,
    length: meta.length,
    play: (c, out) => {
      const asked = performance.now();
      void buffer(name).then((b) => {
        if (!b || performance.now() - asked > 1500) return;
        const source = c.createBufferSource();
        const level = c.createGain();
        level.gain.value = LEVEL;
        source.buffer = b;
        source.connect(level).connect(out);
        source.start();
      });
    },
  };
  playDef(`recorded:${name}`, def, 1, force);
}
