# Showcraft

[![Showcraft Interactive Demo](./docs/assets/showcraft-hero-badge.svg)](https://nxtg-ai.github.io/ShowCraft/?embed=1&mode=playable)

> **60fps Auto-Zoom Launch Video & Interactive Product Sandbox Studio** — Turn a 15-second UI walkthrough into a spring-zoomed `.webm` launch video and a zero-install playable sandbox.
>
> **[Try the Live Interactive Sandbox →](https://nxtg-ai.github.io/ShowCraft/?embed=1&mode=playable)** · **[Open Studio Workbench →](https://nxtg-ai.github.io/ShowCraft/)** · **[Read the User Guide →](./docs/USER_GUIDE.md)**

---

## Features

- **4-Zone NLE Studio Workbench:** Precision dark-mode and daylight-adaptive interface (`#09090b` obsidian surface, tabular monospace timecodes, 4-track keyframe timeline).
- **Automatic Dead-Air Compression:** Excises hesitation and idle pauses (`> 800ms`) between clicks and normalizes pacing into crisp studio beats.
- **Critically-Damped Spring Camera:** Computes smooth 60Hz telephoto magnification (`1.20×` to `2.15×`) and focal pan trajectories centered on your interaction vectors.
- **Direct Timeline & Canvas Editing:** Drag camera zoom or caption blocks horizontally on the timeline to re-time beats, or click directly on the canvas to reposition a step's focal anchor.
- **Live 60fps Screen / Tab Capture (`getDisplayMedia`):** Stream any browser tab or desktop window directly into the floating studio frame at 60fps, or record any website with the unpacked Manifest V3 Chrome Extension ([`./extension`](./extension)).
- **Dual-Mode Output:**
  - **Cinema Compositor (`1`):** Export 60fps `VP9/Opus` `.webm` videos with dark or high-key daylight studio mattes, procedural WebAudio UI click/whoosh SFX, and timecoded lower-third subtitles.
  - **Interactive Sandbox (`2`):** Share `< 2 KB` stateless `#scraft=` URLs or animated SVG cards where viewers click pulsing hotspots to step through your workflow firsthand.
- **Optional Gemini 3.8 Flash & TTS Integration:** Bring your own `GEMINI_API_KEY` (stored strictly in volatile browser session memory) to synthesize punchy launch hooks, camera zoom choreography, and `gemini-3.8-flash-tts` voiceover tracks.

---

## Quickstart

### Prerequisites
- **Node.js** `>= 20.x`

### Run Locally
```bash
git clone https://github.com/nxtg-ai/ShowCraft.git
cd ShowCraft
npm install
npm start
```
Open **`http://localhost:3456`** in your browser.

### Run Verification Suite
```bash
npm test
```

---

## Google Gemini (`@google/genai`) & Modern Chrome Web Platform Showcase

Built by **[NXTG.ai](https://github.com/nxtg-ai)**, Showcraft serves as an open-source reference architecture for the **Google Gemini Interactions API (`@google/genai` `^2.29.1`)** and modern **Baseline Chrome Web Platform APIs**:

### 1. Structured Camera Choreography via `gemini-3.8-flash` (`client.interactions.create`)
Instead of legacy `generateContent` calls, [`server.mjs`](./server.mjs) uses the unified **Interactions API** with JSON Schema enforcement (`response_format`) to convert raw DOM click telemetry into focal zoom scales and timecoded captions:

```javascript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const interaction = await client.interactions.create({
  model: 'gemini-3.8-flash',
  input: telemetryPrompt,
  response_format: [
    {
      type: 'text',
      mime_type: 'application/json',
      schema: DIRECTOR_SCHEMA,
    },
  ],
});

const directed = JSON.parse(interaction.output_text);
```

### 2. Studio Voiceover Synthesis via `gemini-3.8-flash-tts` (`speech_metadata`)
Showcraft synthesizes expressive product launch voiceovers with `<short pause>` pacing tags and muxes the decoded WAV buffer directly with `canvas.captureStream(60)` into a single `VP9/Opus` `.webm` container:

```javascript
const interaction = await client.interactions.create({
  model: 'gemini-3.8-flash-tts',
  input: `<speech_metadata style="crisp, confident studio narrator">${scriptText}</speech_metadata>`,
  response_format: { type: 'audio' },
  generation_config: {
    speech_config: {
      voice_config: { prebuilt_voice_config: { voice_name: 'Kore' } },
    },
  },
});
```
> **Get a Free Gemini API Key:** You can generate a free key in 10 seconds at **[Google AI Studio (`aistudio.google.com/apikey`)](https://aistudio.google.com/apikey)** and paste it into the **Gemini 3.8 Flash** modal inside Showcraft Studio.

### 3. Zero-Framework Baseline Chrome Web Platform Primitives
- **Declarative Top-Layer Dialogs:** `<dialog closedby="any">` paired with `@starting-style` and `transition-behavior: allow-discrete`.
- **Adaptive NLE Color-Scheme Engine:** CSS `color-scheme: light dark` and `light-dark()` tokens with luminance-isolated canvas wells.
- **Native CSS `progress()` Range Sliders:** Zero-JS track fill computation with cross-engine `@supports` fallbacks.
- **Manifest V3 Extension (`./extension`):** Ephemeral-safe `chrome.storage.session` state locking and `requestAnimationFrame`-batched DOM telemetry capture.

---

## Documentation

- **[User Guide (`docs/USER_GUIDE.md`)](./docs/USER_GUIDE.md)** — Complete walkthrough of recording, timeline editing, live screen capture, voiceover synthesis, and exporting.
- **[Changelog (`CHANGELOG.md`)](./CHANGELOG.md)** — Release history.

---

## License

MIT — see [LICENSE](./LICENSE).
