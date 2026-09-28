export type SleepSoundId = "drizzle" | "rain" | "downpour" | "storm";

export type SleepPreset = {
  id: SleepSoundId;
  label: string;
  description: string;
  /** Centre frequency of the band-passed "hiss" layer, in Hz. */
  bandFreq: number;
  bandQ: number;
  /** Cut-off of the low-passed "body" layer, in Hz. */
  bodyFreq: number;
  gain: number;
  lfoRate: number;
  lfoDepth: number;
  thunder: boolean;
};

/**
 * Rain is basically shaped noise, so all of these are synthesised from a noise
 * buffer rather than loaded from a file. No assets to ship, nothing to license,
 * and it works with no network at all.
 */
export const SLEEP_PRESETS: SleepPreset[] = [
  {
    id: "drizzle",
    label: "Drizzle",
    description: "Light and airy",
    bandFreq: 2600,
    bandQ: 0.7,
    bodyFreq: 420,
    gain: 0.4,
    lfoRate: 0.35,
    lfoDepth: 0.35,
    thunder: false,
  },
  {
    id: "rain",
    label: "Steady rain",
    description: "The everyday one",
    bandFreq: 1800,
    bandQ: 0.8,
    bodyFreq: 300,
    gain: 0.6,
    lfoRate: 0.25,
    lfoDepth: 0.3,
    thunder: false,
  },
  {
    id: "downpour",
    label: "Downpour",
    description: "Heavy and constant",
    bandFreq: 1300,
    bandQ: 0.9,
    bodyFreq: 190,
    gain: 0.78,
    lfoRate: 0.18,
    lfoDepth: 0.25,
    thunder: false,
  },
  {
    id: "storm",
    label: "Thunderstorm",
    description: "Rain with distant thunder",
    bandFreq: 1100,
    bandQ: 1,
    bodyFreq: 140,
    gain: 0.88,
    lfoRate: 0.15,
    lfoDepth: 0.22,
    thunder: true,
  },
];

export const DEFAULT_PRESET_ID: SleepSoundId = "rain";
export const DEFAULT_SLEEP_VOLUME = 0.5;

export function getPreset(id: string | null | undefined): SleepPreset {
  return SLEEP_PRESETS.find((preset) => preset.id === id) ?? SLEEP_PRESETS[1];
}

function noiseBuffer(context: AudioContext, seconds: number, brown = false) {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  if (brown) {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  } else {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  return buffer;
}

export type SleepEngine = {
  readonly playing: boolean;
  setPreset(preset: SleepPreset): void;
  setVolume(volume: number): void;
  fadeIn(): void;
  fadeOut(): void;
  dispose(): void;
};

const FADE_SECONDS = 1.2;

/**
 * Two noise layers make rain: a band-passed top for the hiss of drops on a
 * window, and a low-passed layer for the weight behind it. A slow LFO on the
 * top layer stops it sounding like flat static.
 */
export function createSleepEngine(
  context: AudioContext,
  initialPreset: SleepPreset,
  initialVolume: number,
): SleepEngine {
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const rainGain = context.createGain();
  const bodyGain = context.createGain();
  rainGain.connect(master);
  bodyGain.connect(master);

  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.connect(rainGain);

  const body = context.createBiquadFilter();
  body.type = "lowpass";
  body.connect(bodyGain);

  const noise = noiseBuffer(context, 4);
  const top = context.createBufferSource();
  top.buffer = noise;
  top.loop = true;
  top.connect(band);

  const low = context.createBufferSource();
  low.buffer = noise;
  low.loop = true;
  low.connect(body);

  const lfo = context.createOscillator();
  lfo.type = "sine";
  const lfoDepth = context.createGain();
  lfo.connect(lfoDepth);
  lfoDepth.connect(rainGain.gain);

  let preset = initialPreset;
  let volume = initialVolume;
  let playing = false;
  let thunderTimer: ReturnType<typeof setTimeout> | null = null;
  let started = false;
  let disposed = false;

  const apply = () => {
    const now = context.currentTime;
    band.frequency.value = preset.bandFreq;
    band.Q.value = preset.bandQ;
    body.frequency.value = preset.bodyFreq;
    rainGain.gain.value = preset.gain;
    bodyGain.gain.value = preset.gain * 0.7;
    lfo.frequency.value = preset.lfoRate;
    lfoDepth.gain.value = preset.gain * preset.lfoDepth;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(playing ? volume : 0, now + (playing ? 0.1 : FADE_SECONDS));
  };

  const thunder = () => {
    if (!playing || disposed) return;

    const source = context.createBufferSource();
    source.buffer = noiseBuffer(context, 3, true);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 110;

    const envelope = context.createGain();
    const now = context.currentTime;
    const peak = 0.5 + Math.random() * 0.35;
    const attack = 0.4 + Math.random() * 0.9;
    const decay = 2.5 + Math.random() * 2.5;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(peak, now + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);

    source.start(now);
    source.stop(now + attack + decay + 0.1);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };

    thunderTimer = setTimeout(thunder, 9000 + Math.random() * 18000);
  };

  const engine: SleepEngine = {
    get playing() {
      return playing;
    },

    setPreset(next) {
      preset = next;
      if (playing) apply();
    },

    setVolume(next) {
      volume = Math.min(1, Math.max(0, next));
      if (playing) {
        const now = context.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(volume, now + 0.1);
      }
    },

    fadeIn() {
      if (disposed) return;

      if (!started) {
        started = true;
        top.start();
        low.start();
        lfo.start();
      }

      playing = true;
      apply();

      if (preset.thunder && !thunderTimer) {
        thunderTimer = setTimeout(thunder, 3000 + Math.random() * 5000);
      }
    },

    fadeOut() {
      if (!playing) return;
      playing = false;
      apply();

      if (thunderTimer) {
        clearTimeout(thunderTimer);
        thunderTimer = null;
      }
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      playing = false;

      if (thunderTimer) clearTimeout(thunderTimer);

      try {
        top.stop();
        low.stop();
        lfo.stop();
      } catch {
        // Sources that never started throw; nothing to do.
      }

      [top, low, lfo, band, body, rainGain, bodyGain, lfoDepth, master].forEach((node) =>
        node.disconnect(),
      );
    },
  };

  apply();
  return engine;
}
