/**
 * Showcraft — Web Audio API Sound Design, Gemini 3.8 TTS Decoder & Stream Muxer
 */

export class StudioAudioEngine {
  constructor() {
    this.ctx = null;
    this.streamDest = null;
    this.enabled = true;
    this.voiceoverBuffer = null;
    this.activeVoiceSource = null;
    this.lastTriggeredStep = -1;
    this.waveformPeaks = [0.25, 0.62, 0.88, 0.45, 0.74, 0.92, 0.38, 0.68, 0.81, 0.34, 0.59, 0.42];
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.streamDest = this.ctx.createMediaStreamDestination();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setEnabled(flag) {
    this.enabled = Boolean(flag);
    if (!this.enabled) {
      this.stopVoiceover();
    }
  }

  /**
   * Connects an audio node to both speakers and the MediaStream destination (for .webm muxing).
   */
  connectOutput(node) {
    const ctx = this.ensureContext();
    node.connect(ctx.destination);
    if (this.streamDest) {
      node.connect(this.streamDest);
    }
  }

  /**
   * Synthesizes a tactile mechanical studio click transient + subtle camera spring whoosh
   * whenever the playhead crosses a keyframe step.
   */
  triggerKeyframeTransient(stepIndex, zoomScale = 1.65) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // 1. Crisp mechanical UI switch transient (high-passed impulse)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1450, now);
    clickOsc.frequency.exponentialRampToValueAtTime(180, now + 0.032);

    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    clickOsc.connect(clickGain);
    this.connectOutput(clickGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.038);

    // 2. Subtle sub-bass camera optics whoosh proportional to zoomScale
    const whooshOsc = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    whooshOsc.type = 'sine';
    const baseFreq = 90 + Math.round((zoomScale - 1) * 45);
    whooshOsc.frequency.setValueAtTime(baseFreq, now);
    whooshOsc.frequency.exponentialRampToValueAtTime(52, now + 0.19);

    whooshGain.gain.setValueAtTime(0.001, now);
    whooshGain.gain.linearRampToValueAtTime(0.09, now + 0.04);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.21);

    whooshOsc.connect(whooshGain);
    this.connectOutput(whooshGain);
    whooshOsc.start(now);
    whooshOsc.stop(now + 0.22);
  }

  /**
   * Evaluates frame-by-frame whether a new keyframe transient should fire.
   */
  syncFrameStep(activeStepIndex, zoomScale) {
    if (activeStepIndex !== this.lastTriggeredStep) {
      if (activeStepIndex >= 0) {
        this.triggerKeyframeTransient(activeStepIndex, zoomScale);
      }
      this.lastTriggeredStep = activeStepIndex;
    }
  }

  /**
   * Decodes base64 WAV audio returned by `gemini-3.8-flash-tts` into an AudioBuffer
   * and extracts normalized waveform peaks for the NLE timeline track.
   */
  async loadBase64Audio(base64Data) {
    const ctx = this.ensureContext();
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    this.voiceoverBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
    this.extractPeaks(this.voiceoverBuffer, 18);
    return this.voiceoverBuffer;
  }

  /**
   * Generates a procedural studio narration cadence buffer when offline or without an API key,
   * ensuring the NLE timeline track and .webm audio muxer always have a valid AudioBuffer.
   */
  synthesizeProceduralVoiceBuffer(durationMs = 6000, keyframes = []) {
    const ctx = this.ensureContext();
    const sampleRate = ctx.sampleRate;
    const totalSamples = Math.floor((durationMs / 1000) * sampleRate);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    keyframes.forEach((kf) => {
      const startSample = Math.floor((kf.timeMs / 1000) * sampleRate);
      const envSamples = Math.min(Math.floor(0.55 * sampleRate), totalSamples - startSample);
      for (let i = 0; i < envSamples; i++) {
        const t = i / sampleRate;
        const env = Math.sin((Math.PI * i) / envSamples) * 0.08;
        data[startSample + i] =
          env * (Math.sin(2 * Math.PI * 195 * t) + 0.5 * Math.sin(2 * Math.PI * 390 * t));
      }
    });

    this.voiceoverBuffer = buffer;
    this.extractPeaks(buffer, 18);
    return buffer;
  }

  extractPeaks(audioBuffer, bucketCount = 18) {
    const raw = audioBuffer.getChannelData(0);
    const step = Math.max(Math.floor(raw.length / bucketCount), 1);
    const peaks = [];
    for (let b = 0; b < bucketCount; b++) {
      let max = 0.12;
      const start = b * step;
      const end = Math.min(start + step, raw.length);
      for (let i = start; i < end; i += 16) {
        const val = Math.abs(raw[i]);
        if (val > max) max = val;
      }
      peaks.push(Number(Math.min(max * 1.8, 1.0).toFixed(2)));
    }
    this.waveformPeaks = peaks;
    return peaks;
  }

  playVoiceoverFrom(offsetMs = 0) {
    this.stopVoiceover();
    if (!this.enabled || !this.voiceoverBuffer) return;

    const ctx = this.ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this.voiceoverBuffer;
    this.connectOutput(source);

    const offsetSec = Math.max(0, offsetMs / 1000);
    if (offsetSec < this.voiceoverBuffer.duration) {
      source.start(0, offsetSec);
      this.activeVoiceSource = source;
    }
  }

  stopVoiceover() {
    if (this.activeVoiceSource) {
      try {
        this.activeVoiceSource.stop();
      } catch {}
      this.activeVoiceSource = null;
    }
  }

  getMuxStreamTrack() {
    this.ensureContext();
    const tracks = this.streamDest ? this.streamDest.stream.getAudioTracks() : [];
    return tracks[0] || null;
  }
}

/**
 * Calls the server's `/api/tts` endpoint (`gemini-3.8-flash-tts`).
 */
export async function synthesizeGeminiTts(apiKey, text, voice = 'Kore') {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      text,
      voice,
      style: 'crisp, confident studio product launch narrator',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'TTS request failed');
  }

  return response.json();
}
