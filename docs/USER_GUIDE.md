# Showcraft — User Guide

**Version:** `v2.0.0` (Phase 2)  
**Last Updated:** `2026-10-25T15:28:45-05:00`

Welcome to **Showcraft**, the motion and interactive product demo studio. Showcraft turns a raw 15-second walkthrough of your software into two synchronized assets at once:
1. **A 60fps Auto-Zoomed Launch Video (`.webm`)** with dead air automatically stripped and smooth spring-physics camera zooms centered on every click.
2. **An Interactive Playable Sandbox** where viewers on X, Product Hunt, LinkedIn, or your landing page can click directly inside the demo to try your workflow firsthand.

---

## 1. Navigating the 4-Zone NLE Workbench

When you open Showcraft (`http://localhost:3456`), the interface is organized into four precision zones:

| Zone | Location | What It Does |
| :--- | :--- | :--- |
| **Top Utility Bar** | Top (`44px`) | Displays project name, idle time excised (`IDLE -64%`), viewport mode switcher (`Cinema Compositor` vs `Interactive Sandbox`), Gemini 3.8 Flash configuration, `.WebM` export, and **Publish Artifact**. |
| **Source & Vectors Dock** | Left (`290px`) | Houses the live interactive **DOM Instrumentation** target and the chronological list of captured click vectors (`VEC 01`, `VEC 02`, etc.). |
| **Center Compositor Stage** | Center | Renders the real-time 60fps canvas preview, live camera magnification telemetry (`CAM 1.65×`), interactive hotspot overlay, and playback transport bar. |
| **Optics & AI Inspector** | Right (`290px`) | Controls **Stage Aspect Ratio** (`16:10`, `16:9`, `4:5`, `1:1`), **Focal Magnification**, **Canvas Matte** backdrop themes, **Selected Vector Node** editor, **Gemini 3.8 Flash** hook synthesis, and **Studio Audio & TTS**. |
| **Multi-Track Timeline** | Bottom (`172px`) | Displays the sweeping playhead across four synchronized tracks: `DOM SURFACE`, `CAM OPTICS` spring zoom blocks, `HOTSPOTS`, and `VOICEOVER & SFX` waveform envelopes. |

---

## 2. Recording Your Own 15-Second Demo

You don't need to worry about moving your mouse smoothly or speaking without pauses—Showcraft cleans up your recording automatically.

1. **Select a Target Preset:** In the top-left **Source Target** dropdown, pick a workspace template (`vanguard-cloud.dev`, `pulse-analytics.io`, or `tabsnap-local.dev`).
2. **Start Capture:** Click **Record Telemetry** (or press <kbd>R</kbd> on your keyboard). The red `REC 60Hz` indicator will light up.
3. **Click Through the App:** Click on 2 to 5 cards or action buttons inside the left **DOM Instrumentation** mini-window. Take your time—even if you pause for several seconds between clicks.
4. **Stop Capture:** Click **Stop Capture** (or press <kbd>R</kbd> again).
5. **Instant Auto-Direction:**
   - **Dead-Air Compression:** Any pause longer than `800ms` is automatically excised and tightened into a crisp studio beat.
   - **Spring Camera Keyframes:** Showcraft places critically-damped camera zoom blocks on the `CAM OPTICS` timeline track centered on the exact coordinates you clicked.

---

## 3. Switching Between Cinema Reel & Interactive Sandbox

Use the segmented switcher in the center of the Top Utility Bar (or press <kbd>1</kbd> and <kbd>2</kbd>):

- **Cinema Compositor (<kbd>1</kbd>):** Plays back a continuous 60fps launch video with smooth telephoto zooms, click shockwaves, and timecoded lower-third captions.
- **Interactive Sandbox (<kbd>2</kbd>):** Pauses passive video playback and projects a pulsing target reticle over each step. Viewers must click the highlighted element to advance the product state—giving them a hands-on "magic moment" with zero installation.

---

## 4. Directing with Gemini 3.8 Flash

Showcraft includes a deterministic local camera solver that works offline out of the box. To upgrade your script, viral hook headline, and focal zoom choreography using **Gemini 3.8 Flash**:

1. Click **Gemini 3.8 Flash** in the top-right utility bar.
2. Paste your `GEMINI_API_KEY` (stored strictly in volatile browser session memory—never written to disk).
3. Click **Apply & Direct** (or click **Re-Synthesize** in the Right Inspector at any time).
4. Gemini analyzes your captured DOM telemetry and updates:
   - The top **Overlay Hook Copy**
   - Each step's **Lower-Third Subtitle**
   - Adaptive **Zoom Magnification Scales** (`1.35×`–`1.85×`)
   - Interactive **Hotspot Labels**

---

## 5. Exporting Video & Publishing Interactive Links

### Export a 60fps `.WebM` Video
- Click **Export WebM** in the top-right bar.
- Showcraft captures the hardware-accelerated canvas at 60 frames per second (`VP9` codec at `5 Mbps`) and downloads a ready-to-post `.webm` file directly to your machine.

### Publish a Dual-Mode Shareable Artifact (`#scraft` Hash)
- Click **Publish Artifact** in the top-right bar.
- Showcraft compresses your entire custom recording, camera zoom settings, matte theme, and hook copy into a self-contained `#scraft=...` URL hash (`< 1.2 KB`—zero database required).
- Copy either:
  - **Self-Contained Interactive Player URL:** Opens straight into the distraction-free **Standalone Player Mode** (`/?embed=1&mode=playable#scraft=...`) with a **"Remix in Showcraft Studio"** button in the header.
  - **Iframe Embed Code:** Drop into any documentation page, Notion doc, or landing page.
- Click **Preview Standalone Player** inside the modal to test the exact recipient experience immediately.

---

## 6. Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause the 60fps compositor timeline |
| <kbd>1</kbd> | Switch to **Cinema Compositor** mode |
| <kbd>2</kbd> | Switch to **Interactive Sandbox** mode |
| <kbd>R</kbd> | Start / Stop 60Hz telemetry recording |
| <kbd>Shift</kbd> + Canvas Drag | Reposition the active node's `(normX, normY)` focal anchor directly on the canvas |
| Timeline Clip Drag | Drag any `CAM OPTICS` or `HOTSPOTS` block horizontally to re-time that step |
| <kbd>Esc</kbd> | Dismiss any open modal dialog |

---

## 7. Recording External Websites with the Chrome Extension (`./extension`)

To capture clicks on **any live website** and import them directly into Showcraft Studio:

1. Open `chrome://extensions` in Google Chrome and enable **Developer mode** (top right).
2. Click **Load unpacked** and select the [`extension`](../extension) folder inside this repository.
3. Navigate to any `http://` or `https://` webpage you want to demo and click the **Showcraft** icon in your Chrome toolbar:
   - The toolbar badge changes to red `REC` and a floating `SHOWCRAFT REC 60Hz` indicator appears in the bottom-right corner of the page.
4. Click through 2 to 8 actions on the webpage at your normal pace.
5. Click the **Showcraft** toolbar icon a second time to finish:
   - Showcraft automatically strips dead air, packages your clicks into a `#scraft=...` payload, and opens `http://localhost:3456` in a new tab with your captured webpage workflow loaded on the 4-track NLE timeline.
