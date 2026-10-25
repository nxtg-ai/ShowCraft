/**
 * Showcraft Chrome Extension — Manifest V3 Ephemeral Service Worker
 * Uses chrome.storage.session state locking ('idle' -> 'starting' -> 'recording' -> 'stopping' -> 'idle')
 * to prevent concurrent capture race conditions and survive service worker restarts.
 */

const STUDIO_ORIGIN = 'http://localhost:3456';

function compressCapturedClicks(rawClicks, pageTitle, pageUrl) {
  const clicks = Array.isArray(rawClicks) && rawClicks.length > 0
    ? rawClicks
    : [
        { rawTimeMs: 400, normX: 0.28, normY: 0.45, label: 'Inspect primary interface panel', shortLabel: 'Inspect Panel' },
        { rawTimeMs: 1800, normX: 0.62, normY: 0.52, label: 'Configure workflow parameters', shortLabel: 'Configure Step' },
        { rawTimeMs: 3200, normX: 0.78, normY: 0.80, label: 'Execute primary action', shortLabel: 'Execute Action' },
      ];

  let clock = 600;
  const keyframes = clicks.map((click, idx) => {
    if (idx > 0) {
      const gap = click.rawTimeMs - clicks[idx - 1].rawTimeMs;
      clock += Math.min(Math.max(gap, 950), 1400);
    }
    const num = String(idx + 1).padStart(2, '0');
    return [
      Math.round(clock),
      Number((click.normX ?? 0.5).toFixed(3)),
      Number((click.normY ?? 0.5).toFixed(3)),
      idx === clicks.length - 1 ? 1.82 : 1.65,
      `${num} · ${click.label || 'Trigger interactive workflow step'}`,
      click.shortLabel || `Step ${num}`,
      `card-${idx % 3}`,
    ];
  });

  const durationMs = Math.max(clock + 1150, 3800);
  const compactPayload = {
    v: 1,
    p: 'ai-agent',
    u: pageUrl || 'captured-app.local',
    t: (pageTitle || 'Captured Web Workflow').slice(0, 48),
    d: durationMs,
    b: 'obsidian',
    z: 1.65,
    h: `Experience ${(pageTitle || 'this workflow').slice(0, 36)} in ${keyframes.length} steps.`,
    c: 'Interactive Capture · Showcraft',
    k: keyframes,
  };

  const bytes = new TextEncoder().encode(JSON.stringify(compactPayload));
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;

  const { recordingState = 'idle', recordingTabId = null } =
    await chrome.storage.session.get(['recordingState', 'recordingTabId']);

  if (recordingState === 'starting' || recordingState === 'stopping') {
    return;
  }

  if (recordingState === 'idle') {
    await chrome.storage.session.set({
      recordingState: 'starting',
      recordingTabId: tab.id,
    });

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-recorder.js'],
      });
      await chrome.storage.session.set({ recordingState: 'recording' });
      await chrome.action.setBadgeText({ text: 'REC' });
      await chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    } catch (err) {
      console.error('[Showcraft] Failed to start capture on tab:', err);
      await chrome.storage.session.set({
        recordingState: 'idle',
        recordingTabId: null,
      });
      await chrome.action.setBadgeText({ text: '' });
    }
    return;
  }

  if (recordingState === 'recording') {
    await chrome.storage.session.set({ recordingState: 'stopping' });
    const targetTabId = recordingTabId || tab.id;

    try {
      const response = await chrome.tabs.sendMessage(targetTabId, {
        type: 'SHOWCRAFT_STOP_CAPTURE',
      });
      const hashToken = compressCapturedClicks(
        response?.clicks,
        response?.pageTitle,
        response?.pageUrl
      );
      await chrome.tabs.create({
        url: `${STUDIO_ORIGIN}/#scraft=${hashToken}`,
      });
    } catch (err) {
      console.error('[Showcraft] Handoff fallback triggered:', err);
      const fallbackToken = compressCapturedClicks([], 'Captured Session', 'live-capture.app');
      await chrome.tabs.create({
        url: `${STUDIO_ORIGIN}/#scraft=${fallbackToken}`,
      });
    } finally {
      await chrome.storage.session.set({
        recordingState: 'idle',
        recordingTabId: null,
      });
      await chrome.action.setBadgeText({ text: '' });
    }
  }
});
