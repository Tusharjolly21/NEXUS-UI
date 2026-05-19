/**
 * Plays keyboard sounds from an OGG sprite (`sound.ogg`) with a JSON timing map
 * (`sprite-config.json`). Offsets/durations are in milliseconds from the start of the
 * decoded buffer. All playback routes through a master `GainNode` so toggling sound off
 * immediately silences in-flight sprite slices and fallback clicks (no refresh required).
 */

export type TerminalSpriteTick =
  | { kind: "key"; ch: string; volume?: number }
  | { kind: "enter"; volume?: number };

type SpriteConfigFile = {
  sound?: string;
  defines?: Record<string, [number, number]>;
};

function pickSpriteSlice(
  defines: Record<string, [number, number]>,
  kind: "key" | "enter",
  ch: string,
): [number, number] | null {
  if (kind === "enter") {
    return defines["13"] ?? defines["10"] ?? null;
  }
  const code = ch.charCodeAt(0);
  const direct = defines[String(code)];
  if (direct) return direct;
  if (code >= 97 && code <= 122) {
    const upper = defines[String(code - 32)];
    if (upper) return upper;
  }
  return defines["32"] ?? defines["65"] ?? null;
}

function playSynthFallback(ac: AudioContext, sink: AudioNode, opts: TerminalSpriteTick) {
  const t0 = ac.currentTime;
  const isEnter = opts.kind === "enter";
  const vol = opts.volume ?? (isEnter ? 0.12 : 0.08);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + (isEnter ? 0.08 : 0.04));
  g.connect(sink);
  const o = ac.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(isEnter ? 165 : 245 + Math.random() * 60, t0);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + (isEnter ? 0.08 : 0.04));
}

export function createTerminalSpriteSfx(options?: {
  soundUrl?: string;
  configUrl?: string;
  /** When true, plays the entire soundUrl file on each keypress (no sprite config needed). */
  simpleMode?: boolean;
}) {
  const simpleMode = options?.simpleMode ?? false;
  const soundUrl = options?.soundUrl ?? "/sounds/sound.ogg";
  const configUrl = options?.configUrl ?? "/sounds/sprite-config.json";

  let ctx: AudioContext | null = null;
  let destinationSink: GainNode | null = null;
  let outputMuted = false;
  let decoded: AudioBuffer | null = null;
  let defines: Record<string, [number, number]> | null = null;
  let loadState: "idle" | "ready" | "failed" = "idle";
  let loadPromise: Promise<void> | null = null;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  };

  const getSink = (ac: AudioContext) => {
    if (!destinationSink) {
      destinationSink = ac.createGain();
      destinationSink.gain.value = outputMuted ? 0 : 1;
      destinationSink.connect(ac.destination);
    }
    return destinationSink;
  };

  const setMuted = (muted: boolean) => {
    outputMuted = muted;
    const ac = ctx;
    if (!ac) return;
    const sink = getSink(ac);
    const t = ac.currentTime;
    sink.gain.cancelScheduledValues(t);
    sink.gain.setValueAtTime(muted ? 0 : 1, t);
  };

  const loadOnce = async () => {
    const ac = getCtx();
    getSink(ac);
    if (simpleMode) {
      const bRes = await fetch(soundUrl);
      if (!bRes.ok) throw new Error(`Could not load ${soundUrl} (${bRes.status}).`);
      const arr = await bRes.arrayBuffer();
      decoded = await ac.decodeAudioData(arr.slice(0));
      defines = {};
      return;
    }
    const [bRes, cRes] = await Promise.all([fetch(soundUrl), fetch(configUrl)]);
    if (!bRes.ok) {
      throw new Error(
        `Could not load ${soundUrl} (${bRes.status}). Place sound.ogg in public/sounds/ or run npm run sounds:fetch (see public/sounds/README.md).`,
      );
    }
    if (!cRes.ok) {
      throw new Error(`Could not load ${configUrl} (${cRes.status}).`);
    }
    const cfg = (await cRes.json()) as SpriteConfigFile;
    if (!cfg.defines) throw new Error("Sprite config missing defines");
    defines = cfg.defines;
    const arr = await bRes.arrayBuffer();
    decoded = await ac.decodeAudioData(arr.slice(0));
  };

  const ensureLoaded = async () => {
    if (loadState === "ready" && decoded && defines) return;
    if (loadState === "failed") return;
    if (!loadPromise) {
      loadPromise = loadOnce();
    }
    try {
      await loadPromise;
      loadState = "ready";
    } catch {
      loadState = "failed";
      decoded = null;
      defines = null;
      loadPromise = null;
    }
  };

  const resume = async () => {
    const ac = getCtx();
    getSink(ac);
    if (ac.state === "suspended") await ac.resume().catch(() => {});
  };

  const tick = (opts: TerminalSpriteTick) => {
    if (outputMuted) return;
    void (async () => {
      const ac = getCtx();
      const sink = getSink(ac);
      try {
        if (ac.state !== "running") await resume();
        if (outputMuted) return;
        await ensureLoaded();
        if (outputMuted) return;
        if (ac.state !== "running") await resume();
        if (outputMuted) return;

        const ch = opts.kind === "key" ? (opts.ch.length ? opts.ch[0]! : " ") : "\r";
        const vol = opts.volume ?? (opts.kind === "enter" ? 0.52 : 0.4);
        const buf = decoded;
        const def = defines;

        if (loadState === "ready" && buf && def) {
          if (simpleMode) {
            const src = ac.createBufferSource();
            src.buffer = buf;
            const g = ac.createGain();
            g.gain.setValueAtTime(vol, ac.currentTime);
            g.connect(sink);
            src.connect(g);
            src.start(ac.currentTime);
            return;
          }
          const slice = pickSpriteSlice(def, opts.kind, ch);
          if (slice) {
            const [offMs, durMs] = slice;
            const offsetSec = offMs / 1000;
            const durationSec = durMs / 1000;
            if (offsetSec < buf.duration && durationSec > 0) {
              const maxDur = Math.min(durationSec, Math.max(0.02, buf.duration - offsetSec));
              const src = ac.createBufferSource();
              src.buffer = buf;
              const g = ac.createGain();
              g.gain.setValueAtTime(vol, ac.currentTime);
              g.connect(sink);
              src.connect(g);
              src.start(ac.currentTime, offsetSec, maxDur);
              return;
            }
          }
        }
        if (outputMuted) return;
        playSynthFallback(ac, sink, opts);
      } catch {
        if (outputMuted) return;
        try {
          playSynthFallback(getCtx(), getSink(getCtx()), opts);
        } catch {
          /* ignore */
        }
      }
    })();
  };

  return { tick, resume, ensureLoaded, setMuted };
}
