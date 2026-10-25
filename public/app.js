/**
 * Showcraft — Main NLE Studio Controller
 */
import {
  PRESET_FLOWS,
  compressDeadAir,
  evaluateCameraState,
  directWithGemini,
  encodeArtifactState,
  decodeArtifactState,
} from './director-engine.js';
import { StudioCanvasRenderer, exportCanvasToWebM } from './canvas-renderer.js';
import { StudioAudioEngine, synthesizeGeminiTts } from './audio-engine.js';

if (!('switch' in HTMLInputElement.prototype)) {
  import('input-switch-polyfill').catch(() => {});
}

// State
let currentFlow = structuredClone(PRESET_FLOWS['ai-agent']);
let durationMs = 6000;
let currentTimeMs = 0;
let isPlaying = true;
let isRecording = false;
let recordStartPerf = 0;
let recordedClicks = [];
let viewerMode = 'cinema'; // 'cinema' | 'playable'
let playableStepIndex = 0;
let selectedKeyframeIndex = 0;
let sessionGeminiKey = '';
let activeVoiceLabel = 'Kore · Studio SFX Active';
let liveScreenStream = null;
const liveScreenVideo = document.createElement('video');
liveScreenVideo.muted = true;
liveScreenVideo.playsInline = true;
const audioEngine = new StudioAudioEngine();
const AUTOSAVE_STORAGE_KEY = 'showcraft.autosave.v2';
const PRO_LICENSE_STORAGE_KEY = 'showcraft.pro.license';

// DOM Elements
const projectFileName = document.getElementById('projectFileName');
const sandboxViewport = document.getElementById('sandboxViewport');
const sandboxStage = document.getElementById('sandboxStage');
const sandboxUrlBar = document.getElementById('sandboxUrlBar');
const liveRecBadge = document.getElementById('liveRecBadge');
const presetSelector = document.getElementById('presetSelector');
const btnRecordToggle = document.getElementById('btnRecordToggle');
const recordBtnLabel = document.getElementById('recordBtnLabel');
const btnCaptureScreen = document.getElementById('btnCaptureScreen');
const captureScreenLabel = document.getElementById('captureScreenLabel');
const keyframeList = document.getElementById('keyframeList');
const btnRedirectAi = document.getElementById('btnRedirectAi');

const statDeadAir = document.getElementById('statDeadAir');
const statKeyframes = document.getElementById('statKeyframes');
const statDirectorModel = document.getElementById('statDirectorModel');
const hudZoomReadout = document.getElementById('hudZoomReadout');

const cinemaCanvas = document.getElementById('cinemaCanvas');
const playableOverlay = document.getElementById('playableOverlay');
const playableStepCounter = document.getElementById('playableStepCounter');
const hotspotTarget = document.getElementById('hotspotTarget');
const hotspotTooltip = document.getElementById('hotspotTooltip');
const viralBadgeBtn = document.getElementById('viralBadgeBtn');
const viralBadgeText = document.getElementById('viralBadgeText');

const tabCinemaMode = document.getElementById('tabCinemaMode');
const tabPlayableMode = document.getElementById('tabPlayableMode');
const btnPlayPause = document.getElementById('btnPlayPause');
const iconPause = document.getElementById('iconPause');
const iconPlay = document.getElementById('iconPlay');
const playPauseLabel = document.getElementById('playPauseLabel');
const scrubberInput = document.getElementById('scrubberInput');
const timeReadout = document.getElementById('timeReadout');
const hudResolutionText = document.getElementById('hudResolutionText');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');
const backdropSelect = document.getElementById('backdropSelect');
const workspaceSchemeSelect = document.getElementById('workspaceSchemeSelect');
const zoomSelect = document.getElementById('zoomSelect');
const viralHookInput = document.getElementById('viralHookInput');
const directorInsight = document.getElementById('directorInsight');

// Selected Vector Node Inspector Elements
const selectedVecBadge = document.getElementById('selectedVecBadge');
const kfCaptionInput = document.getElementById('kfCaptionInput');
const kfHotspotInput = document.getElementById('kfHotspotInput');
const kfZoomSlider = document.getElementById('kfZoomSlider');
const kfZoomValText = document.getElementById('kfZoomValText');
const btnAddKf = document.getElementById('btnAddKf');
const btnDeleteKf = document.getElementById('btnDeleteKf');

// Timeline Elements
const timelineTracksWrap = document.getElementById('timelineTracksWrap');
const timelinePlayhead = document.getElementById('timelinePlayhead');
const trackZoomLane = document.getElementById('trackZoomLane');
const trackCaptionLane = document.getElementById('trackCaptionLane');
const trackAudioLane = document.getElementById('trackAudioLane');

// Audio & TTS Inspector Elements
const audioSfxSwitch = document.getElementById('audioSfxSwitch');
const whiteLabelSwitch = document.getElementById('whiteLabelSwitch');
const ttsVoiceSelect = document.getElementById('ttsVoiceSelect');
const btnSynthesizeTts = document.getElementById('btnSynthesizeTts');
const ttsBtnLabel = document.getElementById('ttsBtnLabel');
const ttsModelTag = document.getElementById('ttsModelTag');

// Project File & Auto-Save Elements
const btnExportProjectJson = document.getElementById('btnExportProjectJson');
const btnImportProjectJson = document.getElementById('btnImportProjectJson');
const projectFileInput = document.getElementById('projectFileInput');
const btnResetFactory = document.getElementById('btnResetFactory');

// Dialog Elements
const shareDialog = document.getElementById('shareDialog');
const aiConfigDialog = document.getElementById('aiConfigDialog');
const proUpgradeDialog = document.getElementById('proUpgradeDialog');
const btnOpenShareDialog = document.getElementById('btnOpenShareDialog');
const btnOpenAiDialog = document.getElementById('btnOpenAiDialog');
const btnOpenProDialog = document.getElementById('btnOpenProDialog');
const proStatusBadgeText = document.getElementById('proStatusBadgeText');
const btnExportVideo = document.getElementById('btnExportVideo');
const shareUrlInput = document.getElementById('shareUrlInput');
const shortSlugInput = document.getElementById('shortSlugInput');
const btnMintShortLink = document.getElementById('btnMintShortLink');
const embedCodeInput = document.getElementById('embedCodeInput');
const btnCopyShareUrl = document.getElementById('btnCopyShareUrl');
const btnCopyEmbed = document.getElementById('btnCopyEmbed');
const geminiKeyInput = document.getElementById('geminiKeyInput');
const btnSaveAiKey = document.getElementById('btnSaveAiKey');
const proEmailInput = document.getElementById('proEmailInput');
const proPlanSelect = document.getElementById('proPlanSelect');
const btnCheckoutPro = document.getElementById('btnCheckoutPro');
const proLicenseInput = document.getElementById('proLicenseInput');
const btnActivateProLicense = document.getElementById('btnActivateProLicense');
const proModalFeedback = document.getElementById('proModalFeedback');

const renderer = new StudioCanvasRenderer(cinemaCanvas);

/**
 * Feature detection & fallback for discrete `display` transitions and `<dialog closedby="any">`.
 */
let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

async function closeTopLayer(element) {
  if (!supportsTopLayerExit()) {
    element.setAttribute('data-closing', '');
    const animations = element.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    }
    if (!element.hasAttribute('data-closing')) return;
    element.removeAttribute('data-closing');
  }
  element.close();
}

function setupDialogFallbacks() {
  const dialogs = document.querySelectorAll('dialog[closedby="any"]');
  dialogs.forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(dialog);
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        closeTopLayer(dialog);
      });
    }
  });
}

function formatTimecode(ms) {
  const totalSec = Math.max(ms / 1000, 0);
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = (totalSec % 60).toFixed(1).padStart(4, '0');
  return `${mins}:${secs}`;
}

function updateTransportUI() {
  iconPause.hidden = !isPlaying;
  iconPlay.hidden = isPlaying;
  playPauseLabel.textContent = isPlaying ? 'Pause' : 'Play';
}

function syncSliderCssVars(sliderEl) {
  if (!sliderEl) return;
  sliderEl.style.setProperty('--attr-min', sliderEl.min || '0');
  sliderEl.style.setProperty('--attr-max', sliderEl.max || '100');
  sliderEl.style.setProperty('--control-value', sliderEl.value);
}

function selectKeyframeNode(index) {
  if (!currentFlow.keyframes.length) return;
  selectedKeyframeIndex = Math.min(Math.max(index, 0), currentFlow.keyframes.length - 1);
  const kf = currentFlow.keyframes[selectedKeyframeIndex];
  if (!kf) return;

  if (selectedVecBadge) {
    selectedVecBadge.textContent = `VEC 0${selectedKeyframeIndex + 1} · ${formatTimecode(kf.timeMs)}`;
  }
  if (kfCaptionInput && document.activeElement !== kfCaptionInput) {
    kfCaptionInput.value = kf.caption || '';
  }
  if (kfHotspotInput && document.activeElement !== kfHotspotInput) {
    kfHotspotInput.value = kf.hotspot_label || '';
  }
  if (kfZoomSlider) {
    const zVal = Number(kf.zoom_scale || 1.65).toFixed(2);
    kfZoomSlider.value = zVal;
    kfZoomSlider.setAttribute('aria-valuetext', `${zVal}× Zoom`);
    syncSliderCssVars(kfZoomSlider);
  }
  if (kfZoomValText) {
    kfZoomValText.textContent = `${Number(kf.zoom_scale || 1.65).toFixed(2)}×`;
  }

  keyframeList.querySelectorAll('.kf-chip').forEach((chip, idx) => {
    chip.classList.toggle('active', idx === selectedKeyframeIndex);
  });
}

function renderSandboxStage() {
  projectFileName.textContent = currentFlow.fileName || `${currentFlow.id}.scraft`;
  sandboxUrlBar.textContent = currentFlow.url;
  viralHookInput.value = currentFlow.viralHook;
  viralBadgeText.textContent = currentFlow.ctaBadge;

  const cardsHtml = currentFlow.cards
    .map(
      (c, idx) => `
      <button type="button" class="mock-card" data-target-id="card-${idx}" data-label="Configure ${c.label}: ${c.activeVal}">
        <span class="mock-card-lbl">${c.label}</span>
        <span class="mock-card-val">${c.value}</span>
      </button>
    `
    )
    .join('');

  sandboxStage.innerHTML = `
    <div class="mock-app-header">
      <span class="mock-app-title">${currentFlow.title}</span>
      <span class="mock-status-pill">${currentFlow.statusText}</span>
    </div>
    <div class="mock-grid">
      ${cardsHtml}
    </div>
    <div class="mock-action-bar">
      <button type="button" class="mock-cta-btn" data-target-id="cta-btn" data-label="${currentFlow.ctaButton.doneLabel}">
        ${currentFlow.ctaButton.label}
      </button>
    </div>
  `;

  const interactiveTargets = sandboxStage.querySelectorAll('[data-target-id]');
  interactiveTargets.forEach((el) => {
    el.addEventListener('click', (ev) => {
      el.classList.toggle('active');
      const rect = sandboxViewport.getBoundingClientRect();
      const normX = (ev.clientX - rect.left) / rect.width;
      const normY = (ev.clientY - rect.top) / rect.height;
      const targetId = el.getAttribute('data-target-id');
      const label = el.getAttribute('data-label');

      if (isRecording) {
        recordedClicks.push({
          rawTimeMs: performance.now() - recordStartPerf,
          normX,
          normY,
          targetId,
          label,
          hotspotLabel: `Trigger ${targetId.toUpperCase()}`,
        });
        recordBtnLabel.textContent = `Stop Capture (${recordedClicks.length} events)`;
      } else {
        const match = currentFlow.keyframes.find((k) => k.targetId === targetId);
        if (match) {
          currentTimeMs = match.timeMs;
        }
      }
    });
  });

  renderKeyframeChips();
  renderNleTimelineClips();
  updatePlayableHotspot();
}

function renderKeyframeChips() {
  statKeyframes.textContent = `${currentFlow.keyframes.length} NODES`;
  keyframeList.innerHTML = currentFlow.keyframes
    .map(
      (kf, idx) => `
      <div class="kf-chip ${idx === selectedKeyframeIndex ? 'active' : ''}" role="listitem" data-time="${kf.timeMs}" data-step="${idx}">
        <div class="kf-chip-top">
          <span>VEC 0${idx + 1}</span>
          <span>${formatTimecode(kf.timeMs)} · ${kf.zoom_scale.toFixed(2)}×</span>
        </div>
        <div class="kf-chip-caption" title="${kf.caption}">${kf.caption}</div>
      </div>
    `
    )
    .join('');

  keyframeList.querySelectorAll('.kf-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const idx = Number(chip.getAttribute('data-step')) || 0;
      currentTimeMs = Number(chip.getAttribute('data-time'));
      isPlaying = false;
      updateTransportUI();
      selectKeyframeNode(idx);
    });
  });

  selectKeyframeNode(selectedKeyframeIndex);
}

function renderNleTimelineClips() {
  trackZoomLane.innerHTML = currentFlow.keyframes
    .map((kf, idx) => {
      const leftPct = Math.min(Math.max((kf.timeMs / durationMs) * 100 - 4, 1), 86);
      return `
        <div class="clip-zoom-node" style="left: ${leftPct}%; width: 12%;" data-time="${kf.timeMs}" data-step="${idx}" title="Jump to ${formatTimecode(kf.timeMs)}">
          <span>${kf.zoom_scale.toFixed(2)}× Spring</span>
        </div>
      `;
    })
    .join('');

  trackCaptionLane.innerHTML = currentFlow.keyframes
    .map((kf, idx) => {
      const leftPct = Math.min(Math.max((kf.timeMs / durationMs) * 100 - 4, 1), 82);
      return `
        <div class="clip-caption-node" style="left: ${leftPct}%; width: 15%;" data-time="${kf.timeMs}" data-step="${idx}" title="${kf.caption}">
          <span>${kf.hotspot_label}</span>
        </div>
      `;
    })
    .join('');

  document.querySelectorAll('.clip-zoom-node, .clip-caption-node').forEach((node) => {
    node.addEventListener('pointerdown', (ev) => {
      const idx = Number(node.getAttribute('data-step')) || 0;
      const kf = currentFlow.keyframes[idx];
      if (!kf) return;

      isPlaying = false;
      updateTransportUI();
      selectKeyframeNode(idx);
      currentTimeMs = kf.timeMs;

      node.classList.add('dragging');
      node.setPointerCapture(ev.pointerId);
      const laneEl = node.parentElement;

      const onPointerMove = (moveEv) => {
        if (!laneEl) return;
        const rect = laneEl.getBoundingClientRect();
        const ratio = Math.min(Math.max((moveEv.clientX - rect.left) / Math.max(rect.width, 1), 0.03), 0.94);
        const newTimeMs = Math.round(ratio * durationMs);
        kf.timeMs = newTimeMs;
        currentTimeMs = newTimeMs;
        const leftPct = Math.min(Math.max((newTimeMs / durationMs) * 100 - 4, 1), 84);
        node.style.left = `${leftPct}%`;
        node.setAttribute('data-time', String(newTimeMs));
        if (selectedVecBadge) {
          selectedVecBadge.textContent = `VEC 0${idx + 1} · ${formatTimecode(newTimeMs)}`;
        }
      };

      const onPointerUp = (upEv) => {
        node.classList.remove('dragging');
        node.releasePointerCapture(upEv.pointerId);
        node.removeEventListener('pointermove', onPointerMove);
        node.removeEventListener('pointerup', onPointerUp);
        renderKeyframeChips();
        renderNleTimelineClips();
        updatePlayableHotspot();
      };

      node.addEventListener('pointermove', onPointerMove);
      node.addEventListener('pointerup', onPointerUp);
    });
  });

  renderAudioTimelineTrack();
}

function renderAudioTimelineTrack() {
  if (!trackAudioLane) return;
  const barsHtml = audioEngine.waveformPeaks
    .map((p) => `<span class="wave-bar" style="height: ${Math.max(Math.round(p * 100), 18)}%;"></span>`)
    .join('');

  trackAudioLane.innerHTML = `
    <div class="clip-audio-wave">
      <div class="wave-bars">${barsHtml}</div>
      <span class="wave-label">${activeVoiceLabel}</span>
    </div>
  `;
}

function toggleRecording() {
  if (!isRecording) {
    isRecording = true;
    recordedClicks = [];
    recordStartPerf = performance.now();
    btnRecordToggle.classList.add('recording');
    recordBtnLabel.textContent = 'Stop Capture (Click Target)';
    liveRecBadge.hidden = false;
  } else {
    isRecording = false;
    btnRecordToggle.classList.remove('recording');
    recordBtnLabel.textContent = 'Record Telemetry';
    liveRecBadge.hidden = true;

    const rawElapsed = performance.now() - recordStartPerf;
    if (recordedClicks.length > 0) {
      const compressed = compressDeadAir(recordedClicks, rawElapsed);
      currentFlow.keyframes = compressed.keyframes;
      durationMs = compressed.compressedDurationMs;
      statDeadAir.textContent = `IDLE -${compressed.savedPercent}% (${(compressed.savedMs / 1000).toFixed(1)}s CUT)`;
      directorInsight.textContent = `Excised ${(compressed.savedMs / 1000).toFixed(1)}s dead air; synthesized ${compressed.keyframes.length} spring keyframes.`;
      currentTimeMs = 0;
      isPlaying = true;
      updateTransportUI();
      renderKeyframeChips();
      renderNleTimelineClips();
      updatePlayableHotspot();
      saveDraftToLocalStorage();

      if (sessionGeminiKey) {
        triggerGeminiDirector();
      }
    }
  }
}

async function triggerGeminiDirector() {
  if (!sessionGeminiKey) {
    aiConfigDialog.showModal();
    return;
  }
  statDirectorModel.textContent = 'Synthesizing...';
  btnRedirectAi.textContent = 'Running...';

  try {
    const result = await directWithGemini(sessionGeminiKey, currentFlow);
    const { directed } = result;
    if (directed) {
      currentFlow.viralHook = directed.viral_hook || currentFlow.viralHook;
      currentFlow.ctaBadge = directed.cta_badge || currentFlow.ctaBadge;
      viralHookInput.value = currentFlow.viralHook;
      viralBadgeText.textContent = currentFlow.ctaBadge;
      directorInsight.textContent = directed.summary_insight || 'Directed by Gemini 3.8 Flash.';

      if (Array.isArray(directed.keyframes)) {
        currentFlow.keyframes = currentFlow.keyframes.map((kf, idx) => {
          const aiKf = directed.keyframes[idx];
          if (!aiKf) return kf;
          return {
            ...kf,
            zoom_scale: aiKf.zoom_scale || kf.zoom_scale,
            caption: aiKf.caption || kf.caption,
            hotspot_label: aiKf.hotspot_label || kf.hotspot_label,
          };
        });
      }
      statDirectorModel.textContent = 'Gemini 3.8 Active';
      renderKeyframeChips();
      renderNleTimelineClips();
      updatePlayableHotspot();
      saveDraftToLocalStorage();
    }
  } catch (err) {
    statDirectorModel.textContent = 'Local Solver';
    directorInsight.textContent = `Fallback active: ${err.message}`;
  } finally {
    btnRedirectAi.textContent = 'Re-Synthesize';
  }
}

function setViewerMode(mode) {
  viewerMode = mode;
  const isPlayable = mode === 'playable';
  tabCinemaMode.classList.toggle('active', !isPlayable);
  tabCinemaMode.setAttribute('aria-selected', String(!isPlayable));
  tabPlayableMode.classList.toggle('active', isPlayable);
  tabPlayableMode.setAttribute('aria-selected', String(isPlayable));
  playableOverlay.hidden = !isPlayable;

  if (isPlayable) {
    isPlaying = false;
    playableStepIndex = 0;
    updatePlayableHotspot();
  } else {
    isPlaying = true;
  }
  updateTransportUI();
}

function updatePlayableHotspot() {
  const kfs = currentFlow.keyframes;
  if (!kfs || kfs.length === 0) return;

  const kf = kfs[playableStepIndex % kfs.length];
  currentTimeMs = kf.timeMs;

  const W = cinemaCanvas.width || 960;
  const H = cinemaCanvas.height || 580;
  const winX = W < 720 ? 34 : 76;
  const winLeftPct = winX / W;
  const winTopPct = 64 / H;
  const winWidthPct = (W - winX * 2) / W;
  const winHeightPct = (H - 128) / H;

  const stageX = (winLeftPct + kf.normX * winWidthPct) * 100;
  const stageY = (winTopPct + kf.normY * winHeightPct) * 100;

  hotspotTarget.style.left = `${stageX}%`;
  hotspotTarget.style.top = `${stageY}%`;
  hotspotTooltip.textContent = kf.hotspot_label;
  const stepNum = String((playableStepIndex % kfs.length) + 1).padStart(2, '0');
  const totalNum = String(kfs.length).padStart(2, '0');
  playableStepCounter.textContent = `${stepNum} / ${totalNum}`;
}

hotspotTarget.addEventListener('click', () => {
  playableStepIndex = (playableStepIndex + 1) % currentFlow.keyframes.length;
  updatePlayableHotspot();
  recordViralEvent('hotspot_interactions');
});

function recordViralEvent(event) {
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  }).catch(() => {});
}

async function refreshViralMetricsUI() {
  try {
    const res = await fetch('/api/telemetry');
    if (!res.ok) return;
    const data = await res.json();
    const elK = document.getElementById('metricKFactor');
    const elFunnel = document.getElementById('metricFunnelStats');
    if (elK) elK.textContent = `${data.kFactor.toFixed(2)}×`;
    if (elFunnel) elFunnel.textContent = `${data.hotspot_interactions} / ${data.studio_remixes}`;
  } catch {}
}

// 60fps Compositor Loop
let lastFramePerf = performance.now();
function tick(now) {
  const dt = now - lastFramePerf;
  lastFramePerf = now;

  if (isPlaying && viewerMode === 'cinema') {
    currentTimeMs += dt;
    if (currentTimeMs > durationMs) {
      currentTimeMs = 0;
    }
  }

  const maxZoom = parseFloat(zoomSelect.value) || 1.65;
  const camState = evaluateCameraState(
    currentFlow.keyframes,
    currentTimeMs,
    viewerMode === 'playable' ? 1.0 : maxZoom
  );

  const activeSelectedNode = currentFlow.keyframes[selectedKeyframeIndex];
  renderer.renderFrame(currentFlow, camState, {
    backdrop: backdropSelect.value,
    viralHook: viralHookInput.value,
    liveVideoElement: liveScreenStream ? liveScreenVideo : null,
    selectedNode:
      activeSelectedNode && !isPlaying && viewerMode === 'cinema'
        ? {
            normX: activeSelectedNode.normX,
            normY: activeSelectedNode.normY,
            index: selectedKeyframeIndex,
            showReticle: true,
          }
        : null,
  });

  if (isPlaying && viewerMode === 'cinema') {
    audioEngine.syncFrameStep(camState.activeStepIndex, camState.scale);
  }

  // Update telemetry HUD & timeline playhead
  hudZoomReadout.textContent = `CAM ${camState.scale.toFixed(2)}× · X ${camState.camX.toFixed(2)} Y ${camState.camY.toFixed(2)}`;
  const progressRatio = Math.min(Math.max(currentTimeMs / durationMs, 0), 1);
  scrubberInput.value = String(Math.round(progressRatio * 1000));
  syncSliderCssVars(scrubberInput);
  timeReadout.textContent = `${formatTimecode(currentTimeMs)} / ${formatTimecode(durationMs)}`;

  const trackWidth = timelineTracksWrap.clientWidth - 140;
  if (trackWidth > 0) {
    timelinePlayhead.style.left = `${140 + progressRatio * trackWidth}px`;
  }

  requestAnimationFrame(tick);
}

// Event Listeners & Keyboard Shortcuts
presetSelector.addEventListener('change', () => {
  const key = presetSelector.value;
  currentFlow = structuredClone(PRESET_FLOWS[key]);
  currentTimeMs = 0;
  durationMs = 6000;
  renderSandboxStage();
});

btnRecordToggle.addEventListener('click', toggleRecording);
btnRedirectAi.addEventListener('click', triggerGeminiDirector);

tabCinemaMode.addEventListener('click', () => setViewerMode('cinema'));
tabPlayableMode.addEventListener('click', () => setViewerMode('playable'));
viralBadgeBtn.addEventListener('click', () => {
  setViewerMode(viewerMode === 'cinema' ? 'playable' : 'cinema');
});

btnPlayPause.addEventListener('click', () => {
  if (viewerMode === 'playable') {
    setViewerMode('cinema');
    return;
  }
  isPlaying = !isPlaying;
  updateTransportUI();
});

scrubberInput.addEventListener('input', () => {
  isPlaying = false;
  updateTransportUI();
  syncSliderCssVars(scrubberInput);
  currentTimeMs = (Number(scrubberInput.value) / 1000) * durationMs;
});

// Direct Canvas Focal Anchor Repositioning (when paused or Shift+Click in Cinema mode)
let isDraggingCanvasFocal = false;
function updateFocalPointFromCanvasEvent(ev) {
  const kf = currentFlow.keyframes[selectedKeyframeIndex];
  if (!kf) return;
  const rect = cinemaCanvas.getBoundingClientRect();
  const W = cinemaCanvas.width || 960;
  const H = cinemaCanvas.height || 580;
  const canvasX = ((ev.clientX - rect.left) / Math.max(rect.width, 1)) * W;
  const canvasY = ((ev.clientY - rect.top) / Math.max(rect.height, 1)) * H;

  const maxZoom = parseFloat(zoomSelect.value) || 1.65;
  const camState = evaluateCameraState(currentFlow.keyframes, currentTimeMs, maxZoom);
  const focusX = camState.camX * W;
  const focusY = camState.camY * H;
  const worldX = (canvasX - W / 2) / camState.scale + focusX;
  const worldY = (canvasY - H / 2) / camState.scale + focusY;

  const winX = W < 720 ? 34 : 76;
  const winY = 64;
  const winW = W - winX * 2;
  const winH = H - 128;

  kf.normX = Number(Math.min(Math.max((worldX - winX) / winW, 0.08), 0.92).toFixed(3));
  kf.normY = Number(Math.min(Math.max((worldY - winY) / winH, 0.12), 0.88).toFixed(3));
  updatePlayableHotspot();
}

cinemaCanvas.addEventListener('pointerdown', (ev) => {
  if (viewerMode !== 'cinema') return;
  if (isPlaying && !ev.shiftKey) return;
  isPlaying = false;
  updateTransportUI();
  isDraggingCanvasFocal = true;
  cinemaCanvas.setPointerCapture(ev.pointerId);
  updateFocalPointFromCanvasEvent(ev);
});

cinemaCanvas.addEventListener('pointermove', (ev) => {
  if (!isDraggingCanvasFocal) return;
  updateFocalPointFromCanvasEvent(ev);
});

cinemaCanvas.addEventListener('pointerup', (ev) => {
  if (!isDraggingCanvasFocal) return;
  isDraggingCanvasFocal = false;
  cinemaCanvas.releasePointerCapture(ev.pointerId);
});

if (aspectRatioSelect) {
  aspectRatioSelect.addEventListener('change', () => {
    const [wStr, hStr] = aspectRatioSelect.value.split('x');
    const w = parseInt(wStr, 10) || 960;
    const h = parseInt(hStr, 10) || 580;
    cinemaCanvas.width = w;
    cinemaCanvas.height = h;
    const stageWrap = document.querySelector('.player-stage-wrap');
    if (stageWrap) {
      stageWrap.style.aspectRatio = `${w} / ${h}`;
      stageWrap.style.maxWidth = w < 720 ? `${w}px` : '860px';
    }
    if (hudResolutionText) {
      hudResolutionText.textContent = `${w}×${h} · 60FPS · SPRING SOLVER`;
    }
    updatePlayableHotspot();
  });
}

if (kfCaptionInput) {
  kfCaptionInput.addEventListener('input', () => {
    const kf = currentFlow.keyframes[selectedKeyframeIndex];
    if (!kf) return;
    kf.caption = kfCaptionInput.value;
    renderKeyframeChips();
    renderNleTimelineClips();
  });
}

if (kfHotspotInput) {
  kfHotspotInput.addEventListener('input', () => {
    const kf = currentFlow.keyframes[selectedKeyframeIndex];
    if (!kf) return;
    kf.hotspot_label = kfHotspotInput.value;
    renderNleTimelineClips();
    updatePlayableHotspot();
  });
}

if (kfZoomSlider) {
  kfZoomSlider.addEventListener('input', () => {
    const kf = currentFlow.keyframes[selectedKeyframeIndex];
    if (!kf) return;
    const val = parseFloat(kfZoomSlider.value) || 1.65;
    kf.zoom_scale = val;
    kfZoomSlider.setAttribute('aria-valuetext', `${val.toFixed(2)}× Zoom`);
    syncSliderCssVars(kfZoomSlider);
    if (kfZoomValText) kfZoomValText.textContent = `${val.toFixed(2)}×`;
    renderKeyframeChips();
    renderNleTimelineClips();
  });
}

if (btnAddKf) {
  btnAddKf.addEventListener('click', () => {
    const baseKf = currentFlow.keyframes[selectedKeyframeIndex] || {
      normX: 0.5,
      normY: 0.5,
      zoom_scale: 1.65,
      targetId: 'cta-btn',
    };
    const newStepIdx = currentFlow.keyframes.length;
    const newTimeMs = Math.min(Math.round(currentTimeMs), durationMs - 200);
    currentFlow.keyframes.push({
      step_index: newStepIdx,
      timeMs: newTimeMs,
      normX: baseKf.normX,
      normY: baseKf.normY,
      targetId: baseKf.targetId,
      zoom_scale: baseKf.zoom_scale || 1.65,
      caption: `${newStepIdx + 1} · Custom telemetry node @ ${formatTimecode(newTimeMs)}`,
      hotspot_label: `Step ${newStepIdx + 1} Action`,
    });
    currentFlow.keyframes.sort((a, b) => a.timeMs - b.timeMs);
    currentFlow.keyframes.forEach((k, i) => {
      k.step_index = i;
    });
    selectedKeyframeIndex = currentFlow.keyframes.findIndex((k) => k.timeMs === newTimeMs);
    if (selectedKeyframeIndex < 0) selectedKeyframeIndex = currentFlow.keyframes.length - 1;
    renderKeyframeChips();
    renderNleTimelineClips();
    updatePlayableHotspot();
  });
}

if (btnDeleteKf) {
  btnDeleteKf.addEventListener('click', () => {
    if (currentFlow.keyframes.length <= 1) return;
    currentFlow.keyframes.splice(selectedKeyframeIndex, 1);
    currentFlow.keyframes.forEach((k, i) => {
      k.step_index = i;
    });
    selectedKeyframeIndex = Math.min(selectedKeyframeIndex, currentFlow.keyframes.length - 1);
    renderKeyframeChips();
    renderNleTimelineClips();
    updatePlayableHotspot();
  });
}

window.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (shareDialog.open || aiConfigDialog.open) return;

  if (e.code === 'Space') {
    e.preventDefault();
    isPlaying = !isPlaying;
    updateTransportUI();
  } else if (e.key === '1') {
    setViewerMode('cinema');
  } else if (e.key === '2') {
    setViewerMode('playable');
  } else if (e.key.toLowerCase() === 'r') {
    toggleRecording();
  }
});

btnOpenShareDialog.addEventListener('click', () => {
  currentFlow.viralHook = viralHookInput.value;
  const { hashToken, byteLength } = encodeArtifactState(currentFlow, {
    durationMs,
    backdrop: backdropSelect.value,
    maxZoom: parseFloat(zoomSelect.value) || 1.65,
  });

  const metricPayloadBytes = document.getElementById('metricPayloadBytes');
  if (metricPayloadBytes) {
    metricPayloadBytes.textContent = `${byteLength} B`;
  }

  window.history.replaceState(null, '', `#scraft=${hashToken}`);
  const basePath =
    window.location.origin +
    window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  const shareUrl = `${basePath}/?embed=1&mode=playable#scraft=${hashToken}`;
  shareUrlInput.value = shareUrl;

  const badgeParams = new URLSearchParams({
    title: currentFlow.title,
    url: currentFlow.url,
    hook: currentFlow.viralHook,
    steps: String(currentFlow.keyframes.length),
  });
  const badgeSvgUrl = `${basePath}/api/badge.svg?${badgeParams.toString()}`;
  const markdownBadgeInput = document.getElementById('markdownBadgeInput');
  if (markdownBadgeInput) {
    markdownBadgeInput.value = `[![Interactive Demo](${badgeSvgUrl})](${shareUrl})`;
  }

  embedCodeInput.value = `<div data-showcraft="${shareUrl}"></div><script src="${basePath}/embed-sdk.js" async></script>`;
  refreshViralMetricsUI();
  shareDialog.showModal();
});

const btnCopyMarkdown = document.getElementById('btnCopyMarkdown');
if (btnCopyMarkdown) {
  btnCopyMarkdown.addEventListener('click', () => {
    const markdownBadgeInput = document.getElementById('markdownBadgeInput');
    if (markdownBadgeInput) {
      navigator.clipboard.writeText(markdownBadgeInput.value);
      btnCopyMarkdown.textContent = 'Copied';
      setTimeout(() => (btnCopyMarkdown.textContent = 'Copy Markdown'), 1500);
    }
  });
}

const btnPreviewEmbed = document.getElementById('btnPreviewEmbed');
const btnRemixInStudio = document.getElementById('btnRemixInStudio');

if (btnPreviewEmbed) {
  btnPreviewEmbed.addEventListener('click', () => {
    closeTopLayer(shareDialog);
    document.body.classList.add('is-embed');
    if (btnRemixInStudio) btnRemixInStudio.hidden = false;
    setViewerMode('playable');
    recordViralEvent('impressions');
  });
}

if (btnRemixInStudio) {
  btnRemixInStudio.addEventListener('click', () => {
    recordViralEvent('studio_remixes');
    document.body.classList.remove('is-embed');
    btnRemixInStudio.hidden = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('embed');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    setViewerMode('cinema');
  });
}

btnCopyShareUrl.addEventListener('click', () => {
  navigator.clipboard.writeText(shareUrlInput.value);
  btnCopyShareUrl.textContent = 'Copied';
  setTimeout(() => (btnCopyShareUrl.textContent = 'Copy URL'), 1500);
});

btnCopyEmbed.addEventListener('click', () => {
  navigator.clipboard.writeText(embedCodeInput.value);
  btnCopyEmbed.textContent = 'Copied';
  setTimeout(() => (btnCopyEmbed.textContent = 'Copy Iframe'), 1500);
});

btnOpenAiDialog.addEventListener('click', () => {
  aiConfigDialog.showModal();
});

if (workspaceSchemeSelect) {
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  const currentMeta = metaScheme?.content || 'dark';
  workspaceSchemeSelect.value = currentMeta;

  workspaceSchemeSelect.addEventListener('change', () => {
    const val = workspaceSchemeSelect.value;
    if (metaScheme) metaScheme.content = val;
    try {
      if (val === 'light dark') {
        localStorage.removeItem('color-scheme');
      } else {
        localStorage.setItem('color-scheme', val);
      }
    } catch {}
  });

  window.addEventListener('storage', (ev) => {
    if (ev.key === 'color-scheme') {
      const next = ev.newValue ?? 'light dark';
      if (metaScheme) metaScheme.content = next;
      workspaceSchemeSelect.value = next;
    }
  });
}

if (audioSfxSwitch) {
  audioSfxSwitch.addEventListener('change', () => {
    audioEngine.setEnabled(audioSfxSwitch.checked);
    activeVoiceLabel = audioSfxSwitch.checked
      ? `${ttsVoiceSelect?.value || 'Kore'} · Studio SFX Active`
      : 'Audio Muted';
    renderAudioTimelineTrack();
  });
}

function isProUnlocked() {
  try {
    const key = localStorage.getItem(PRO_LICENSE_STORAGE_KEY) || '';
    return key.startsWith('SCRAFT-PRO-');
  } catch {
    return false;
  }
}

function updateProBadgeUI() {
  const unlocked = isProUnlocked();
  if (proStatusBadgeText) {
    proStatusBadgeText.textContent = unlocked ? 'Cloud Pro Active' : 'Cloud Pro';
  }
  if (proLicenseInput && unlocked) {
    try {
      proLicenseInput.value = localStorage.getItem(PRO_LICENSE_STORAGE_KEY) || '';
    } catch {}
  }
}

if (btnOpenProDialog && proUpgradeDialog) {
  btnOpenProDialog.addEventListener('click', () => {
    updateProBadgeUI();
    proUpgradeDialog.showModal();
  });
}

if (whiteLabelSwitch) {
  whiteLabelSwitch.addEventListener('change', () => {
    if (whiteLabelSwitch.checked && !isProUnlocked()) {
      whiteLabelSwitch.checked = false;
      if (viralBadgeBtn) viralBadgeBtn.hidden = false;
      if (proUpgradeDialog) {
        if (proModalFeedback) {
          proModalFeedback.textContent = 'White-label watermark removal requires Showcraft Cloud Pro.';
        }
        proUpgradeDialog.showModal();
      }
      return;
    }
    if (viralBadgeBtn) {
      viralBadgeBtn.hidden = whiteLabelSwitch.checked;
    }
    saveDraftToLocalStorage();
  });
}

if (btnMintShortLink) {
  btnMintShortLink.addEventListener('click', async () => {
    if (!isProUnlocked()) {
      closeTopLayer(shareDialog);
      if (proUpgradeDialog) {
        if (proModalFeedback) {
          proModalFeedback.textContent = 'Custom /d/:slug short permalinks require Showcraft Cloud Pro.';
        }
        proUpgradeDialog.showModal();
      }
      return;
    }
    const { hashToken } = encodeArtifactState(currentFlow, {
      durationMs,
      backdrop: backdropSelect.value,
      maxZoom: parseFloat(zoomSelect.value) || 1.65,
    });
    const desiredSlug = (shortSlugInput?.value || currentFlow.id || 'demo').trim();
    btnMintShortLink.textContent = 'Minting...';
    try {
      const res = await fetch('/api/shortlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: desiredSlug,
          scraftToken: hashToken,
          title: currentFlow.title,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const shortUrl = `${window.location.origin}${data.shortPath}`;
        shareUrlInput.value = shortUrl;
        if (shortSlugInput) shortSlugInput.value = data.slug;
        btnMintShortLink.textContent = 'Minted!';
      } else {
        throw new Error('Static host fallback');
      }
    } catch {
      const cleanSlug = desiredSlug.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'launch';
      const basePath =
        window.location.origin +
        window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
      shareUrlInput.value = `${basePath}/?d=${cleanSlug}&embed=1&mode=playable#scraft=${hashToken}`;
      btnMintShortLink.textContent = 'Minted!';
    } finally {
      setTimeout(() => {
        btnMintShortLink.textContent = 'Mint Short Link';
      }, 1800);
    }
  });
}

if (btnCheckoutPro) {
  btnCheckoutPro.addEventListener('click', async () => {
    const email = (proEmailInput?.value || '').trim();
    if (!email || !email.includes('@')) {
      if (proModalFeedback) {
        proModalFeedback.textContent = 'Please enter a valid work email to generate your Pro key.';
      }
      proEmailInput?.focus();
      return;
    }
    const plan = proPlanSelect?.value || 'pro_19';
    btnCheckoutPro.textContent = 'Provisioning...';
    let generatedKey = `SCRAFT-PRO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    let checkoutUrl = null;
    try {
      const res = await fetch('/api/pro-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.trialLicenseKey) generatedKey = data.trialLicenseKey;
        if (data.checkoutUrl) checkoutUrl = data.checkoutUrl;
      }
    } catch {}

    try {
      localStorage.setItem(PRO_LICENSE_STORAGE_KEY, generatedKey);
    } catch {}
    if (proLicenseInput) proLicenseInput.value = generatedKey;
    if (whiteLabelSwitch) {
      whiteLabelSwitch.checked = true;
      if (viralBadgeBtn) viralBadgeBtn.hidden = true;
    }
    updateProBadgeUI();
    saveDraftToLocalStorage();
    if (proModalFeedback) {
      proModalFeedback.textContent = `Activated ${generatedKey} for ${email}. White-label & short links unlocked!`;
    }
    btnCheckoutPro.textContent = 'Pro Unlocked';
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener');
    }
  });
}

if (btnActivateProLicense) {
  btnActivateProLicense.addEventListener('click', () => {
    const candidate = (proLicenseInput?.value || '').trim().toUpperCase();
    if (!candidate.startsWith('SCRAFT-PRO-') || candidate.length < 14) {
      if (proModalFeedback) {
        proModalFeedback.textContent = 'Invalid key format. Expected SCRAFT-PRO-XXXXXX.';
      }
      return;
    }
    try {
      localStorage.setItem(PRO_LICENSE_STORAGE_KEY, candidate);
    } catch {}
    if (whiteLabelSwitch) {
      whiteLabelSwitch.checked = true;
      if (viralBadgeBtn) viralBadgeBtn.hidden = true;
    }
    updateProBadgeUI();
    saveDraftToLocalStorage();
    if (proModalFeedback) {
      proModalFeedback.textContent = `License ${candidate} verified! Pro features unlocked.`;
    }
    setTimeout(() => closeTopLayer(proUpgradeDialog), 900);
  });
}

if (btnCaptureScreen) {
  btnCaptureScreen.addEventListener('click', async () => {
    if (liveScreenStream) {
      liveScreenStream.getTracks().forEach((t) => t.stop());
      liveScreenStream = null;
      liveScreenVideo.srcObject = null;
      if (captureScreenLabel) captureScreenLabel.textContent = 'Capture Live Screen / Tab';
      directorInsight.textContent = 'Stopped live screen stream; restored DOM vector stage.';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60, max: 60 } },
        audio: false,
      });
      liveScreenStream = stream;
      liveScreenVideo.srcObject = stream;
      await liveScreenVideo.play();
      const trackLabel = stream.getVideoTracks()[0]?.label || 'Live Display Surface';
      currentFlow.title = trackLabel.slice(0, 42);
      currentFlow.url = 'live://display-capture/60fps';
      sandboxUrlBar.textContent = currentFlow.url;
      if (captureScreenLabel) captureScreenLabel.textContent = 'Stop Screen Stream (Live)';
      directorInsight.textContent = `Compositing live 60fps display stream (${trackLabel}) inside spring camera stage.`;

      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        liveScreenStream = null;
        liveScreenVideo.srcObject = null;
        if (captureScreenLabel) captureScreenLabel.textContent = 'Capture Live Screen / Tab';
      });
    } catch (err) {
      directorInsight.textContent = 'Screen capture cancelled; continuing with interactive DOM stage.';
    }
  });
}

function saveDraftToLocalStorage() {
  try {
    const payload = {
      version: '2.2.0',
      savedAt: new Date().toISOString(),
      flow: currentFlow,
      durationMs,
      backdrop: backdropSelect.value,
      maxZoom: parseFloat(zoomSelect.value) || 1.65,
      aspectRatio: aspectRatioSelect?.value || '960x580',
      whiteLabel: Boolean(whiteLabelSwitch?.checked),
    };
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadDraftFromLocalStorage() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !data.flow || !Array.isArray(data.flow.keyframes)) return false;
    currentFlow = data.flow;
    durationMs = Number(data.durationMs) || 6000;
    if (data.backdrop) backdropSelect.value = data.backdrop;
    if (data.maxZoom) zoomSelect.value = String(data.maxZoom);
    if (data.aspectRatio && aspectRatioSelect) {
      aspectRatioSelect.value = data.aspectRatio;
      aspectRatioSelect.dispatchEvent(new Event('change'));
    }
    if (whiteLabelSwitch) {
      const canHideWatermark = Boolean(data.whiteLabel) && isProUnlocked();
      whiteLabelSwitch.checked = canHideWatermark;
      if (viralBadgeBtn) viralBadgeBtn.hidden = canHideWatermark;
    }
    directorInsight.textContent = `Restored local studio draft (${currentFlow.keyframes.length} vectors).`;
    return true;
  } catch {
    return false;
  }
}

if (btnExportProjectJson) {
  btnExportProjectJson.addEventListener('click', () => {
    currentFlow.viralHook = viralHookInput.value;
    const projectBundle = {
      schema: 'showcraft.project.v2',
      exportedAt: new Date().toISOString(),
      durationMs,
      backdrop: backdropSelect.value,
      maxZoom: parseFloat(zoomSelect.value) || 1.65,
      aspectRatio: aspectRatioSelect?.value || '960x580',
      flow: currentFlow,
    };
    const blob = new Blob([JSON.stringify(projectBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFlow.id || 'project'}.scraft.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (btnImportProjectJson && projectFileInput) {
  btnImportProjectJson.addEventListener('click', () => {
    projectFileInput.click();
  });
  projectFileInput.addEventListener('change', async () => {
    const file = projectFileInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && parsed.flow && Array.isArray(parsed.flow.keyframes)) {
        currentFlow = parsed.flow;
        durationMs = Number(parsed.durationMs) || 6000;
        if (parsed.backdrop) backdropSelect.value = parsed.backdrop;
        if (parsed.maxZoom) zoomSelect.value = String(parsed.maxZoom);
        if (parsed.aspectRatio && aspectRatioSelect) {
          aspectRatioSelect.value = parsed.aspectRatio;
          aspectRatioSelect.dispatchEvent(new Event('change'));
        }
        renderSandboxStage();
        saveDraftToLocalStorage();
        directorInsight.textContent = `Imported ${file.name} (${currentFlow.keyframes.length} vectors).`;
      }
    } catch {}
  });
}

if (btnResetFactory) {
  btnResetFactory.addEventListener('click', () => {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch {}
    window.history.replaceState(null, '', window.location.pathname);
    currentFlow = structuredClone(PRESET_FLOWS[presetSelector.value || 'ai-agent']);
    durationMs = 6000;
    currentTimeMs = 0;
    renderSandboxStage();
    closeTopLayer(shareDialog);
    directorInsight.textContent = 'Cleared local draft and restored factory preset.';
  });
}

if (btnSynthesizeTts) {
  btnSynthesizeTts.addEventListener('click', async () => {
    const voice = ttsVoiceSelect?.value || 'Kore';
    const fullNarration = [
      viralHookInput.value,
      ...currentFlow.keyframes.map((k) => k.caption.replace(/^\d+\s*·\s*/, '')),
    ].join('. <short pause> ');

    if (ttsBtnLabel) ttsBtnLabel.textContent = 'Synthesizing 3.8 TTS...';
    try {
      if (sessionGeminiKey) {
        const res = await synthesizeGeminiTts(sessionGeminiKey, fullNarration, voice);
        await audioEngine.loadBase64Audio(res.audioBase64);
        activeVoiceLabel = `${voice} · gemini-3.8-flash-tts WAV`;
        if (ttsModelTag) ttsModelTag.textContent = '3.8 TTS READY';
      } else {
        audioEngine.synthesizeProceduralVoiceBuffer(durationMs, currentFlow.keyframes);
        activeVoiceLabel = `${voice} · WebAudio Procedural Bus`;
        if (ttsModelTag) ttsModelTag.textContent = 'LOCAL BUS';
      }
      renderAudioTimelineTrack();
      currentTimeMs = 0;
      isPlaying = true;
      updateTransportUI();
      audioEngine.playVoiceoverFrom(0);
    } catch (err) {
      audioEngine.synthesizeProceduralVoiceBuffer(durationMs, currentFlow.keyframes);
      activeVoiceLabel = `${voice} · Local Bus Fallback`;
      renderAudioTimelineTrack();
    } finally {
      if (ttsBtnLabel) ttsBtnLabel.textContent = 'Synthesize Voiceover Track';
    }
  });
}

btnSaveAiKey.addEventListener('click', () => {
  sessionGeminiKey = geminiKeyInput.value.trim();
  closeTopLayer(aiConfigDialog);
  if (sessionGeminiKey) {
    triggerGeminiDirector();
  }
});

btnExportVideo.addEventListener('click', async () => {
  isPlaying = true;
  viewerMode = 'cinema';
  currentTimeMs = 0;
  updateTransportUI();

  if (audioEngine.enabled) {
    if (!audioEngine.voiceoverBuffer) {
      audioEngine.synthesizeProceduralVoiceBuffer(durationMs, currentFlow.keyframes);
    }
    audioEngine.playVoiceoverFrom(0);
  }
  const muxAudioTrack = audioEngine.enabled ? audioEngine.getMuxStreamTrack() : null;

  try {
    const blob = await exportCanvasToWebM(
      cinemaCanvas,
      durationMs,
      (prog) => {
        btnExportVideo.querySelector('span').textContent = `Encoding ${Math.round(prog * 100)}%`;
      },
      muxAudioTrack
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFlow.id}-studio.webm`;
    a.click();
    URL.revokeObjectURL(url);
    btnExportVideo.querySelector('span').textContent = 'Exported WebM';
  } catch (err) {
    btnExportVideo.querySelector('span').textContent = 'Export Error';
  } finally {
    setTimeout(() => {
      btnExportVideo.querySelector('span').textContent = 'Export WebM';
    }, 2200);
  }
});

function hydrateFromHashAndQuery() {
  const params = new URLSearchParams(window.location.search);
  const presetParam = params.get('preset');
  if (presetParam && PRESET_FLOWS[presetParam]) {
    presetSelector.value = presetParam;
    currentFlow = structuredClone(PRESET_FLOWS[presetParam]);
  }

  const rawHash = window.location.hash || '';
  if (rawHash.startsWith('#scraft=')) {
    const token = rawHash.slice('#scraft='.length);
    const decoded = decodeArtifactState(token);
    if (decoded) {
      currentFlow = decoded.flow;
      durationMs = decoded.durationMs;
      presetSelector.value = currentFlow.id;
      backdropSelect.value = decoded.backdrop;
      zoomSelect.value = String(decoded.maxZoom);
      directorInsight.textContent = `Hydrated self-contained #scraft artifact (${currentFlow.keyframes.length} vectors).`;
    }
  } else if (!presetParam) {
    loadDraftFromLocalStorage();
  }

  if (params.get('embed') === '1') {
    document.body.classList.add('is-embed');
    if (btnRemixInStudio) btnRemixInStudio.hidden = false;
  }

  renderSandboxStage();
  if (params.get('mode') === 'playable' || params.get('embed') === '1') {
    setViewerMode('playable');
  }
}

function init() {
  setupDialogFallbacks();
  updateProBadgeUI();
  hydrateFromHashAndQuery();
  window.addEventListener('hashchange', hydrateFromHashAndQuery);
  requestAnimationFrame(tick);
}

init();
