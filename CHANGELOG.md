# Changelog

All notable changes to **Showcraft** are documented in this file.

---

## [2.3.0] — 2026-10-25
### Added
- **Direct-Manipulation Timeline & Canvas Focal Editing:** Drag keyframe clips horizontally across the `CAM OPTICS` and `HOTSPOTS` tracks to re-time beats at 60fps, or click/drag on the canvas while paused to reposition the active step's `(normX, normY)` focal anchor.
- **Live 60fps Screen & Tab Capture (`getDisplayMedia`):** Stream any live browser tab or application window directly into the studio compositor frame.
- **Project File Portability (`.scraft.json`) & Auto-Save:** Save and load `.scraft.json` project bundles and automatically recover drafts from `localStorage`.
- **Multi-Format Stage Aspect Ratios:** Switch between `16:10` (`960×580`), `16:9` (`960×540`), `4:5` (`540×675`), and `1:1` (`640×640`).
- **Selected Vector Node Inspector:** Edit individual keyframe subtitles, playable hotspot labels, and per-node focal zoom scales (`1.20×`–`2.10×`).

---

## [1.5.0] — 2026-10-25
### Added
- **Animated SVG Badge Generator (`/api/badge.svg`):** Generate 680×360 animated SVG preview cards (`prefers-reduced-motion` compliant) for GitHub READMEs and documentation pages.
- **Lightweight Embed SDK (`/embed-sdk.js`):** Zero-CLS `<div data-showcraft="..."></div>` auto-mounting script.
- **Manifest V3 Chrome Extension (`./extension`):** Record DOM interaction vectors on external websites and open them directly in Showcraft Studio.

---

## [1.3.0] — 2026-10-25
### Added
- **Studio Audio Engine & `gemini-3.8-flash-tts` Voiceover:** Procedural Web Audio API UI click/whoosh synthesis, voiceover waveform track, and `VP9/Opus` `.webm` audio+video muxing.
- **High-Key Daylight Canvas Mattes & Theme Switcher:** Added `Alabaster Daylight` and `Editorial Warm Paper` canvas mattes alongside 3-state `color-scheme` workbench preferences.
- **Stateless `#scraft=` URL Sharing:** Compress recorded flows into `< 2 KB` Base64URL hashes for serverless sharing and remixing.

---

## [1.0.0] — 2026-10-25
### Added
- Initial 4-zone 60fps NLE studio workbench, Dead-Air Time-Warp compressor, critically-damped spring camera solver, and `gemini-3.8-flash` AI Director integration.
