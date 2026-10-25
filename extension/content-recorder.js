/**
 * Showcraft Chrome Extension — Content Script DOM & Cursor Vector Recorder
 * Batches visual DOM highlights inside requestAnimationFrame to avoid blocking the main thread.
 */

(() => {
  if (globalThis.__showcraftRecorderActive) {
    return;
  }
  globalThis.__showcraftRecorderActive = true;

  const startPerf = performance.now();
  const capturedClicks = [];

  // Create floating studio HUD pill
  const hud = document.createElement('div');
  hud.id = '__showcraft-hud';
  hud.style.cssText = [
    'position: fixed',
    'bottom: 16px',
    'right: 16px',
    'z-index: 2147483647',
    'background: rgba(9, 9, 11, 0.92)',
    'color: #f4f4f6',
    'border: 1px solid rgba(255, 255, 255, 0.16)',
    'border-radius: 6px',
    'padding: 7px 12px',
    'font: 600 11.5px/1.3 "JetBrains Mono", monospace',
    'box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5)',
    'pointer-events: none',
    'display: flex',
    'align-items: center',
    'gap: 8px',
  ].join(';');

  const dot = document.createElement('span');
  dot.style.cssText =
    'width: 7px; height: 7px; border-radius: 50%; background: #ef4444; display: inline-block;';
  const labelSpan = document.createElement('span');
  labelSpan.textContent = 'SHOWCRAFT REC 60Hz · 0 vectors (Click extension icon to finish)';

  hud.appendChild(dot);
  hud.appendChild(labelSpan);
  document.documentElement.appendChild(hud);

  function extractReadableLabel(el) {
    if (!el || el === document.body || el === document.documentElement) {
      return 'Interact with viewport surface';
    }
    const aria = el.getAttribute?.('aria-label') || el.getAttribute?.('title');
    const text = (el.innerText || el.value || '').trim().replace(/\s+/g, ' ');
    const tag = (el.tagName || 'ELEMENT').toLowerCase();
    const raw = aria || text || `${tag} control`;
    return raw.slice(0, 46);
  }

  function flashClickRing(clientX, clientY) {
    requestAnimationFrame(() => {
      const ring = document.createElement('div');
      ring.style.cssText = [
        'position: fixed',
        `left: ${clientX}px`,
        `top: ${clientY}px`,
        'width: 28px',
        'height: 28px',
        'transform: translate(-50%, -50%)',
        'border: 2px solid #6366f1',
        'border-radius: 50%',
        'pointer-events: none',
        'z-index: 2147483646',
        'transition: transform 0.28s ease-out, opacity 0.28s ease-out',
      ].join(';');
      document.documentElement.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transform = 'translate(-50%, -50%) scale(1.75)';
        ring.style.opacity = '0';
      });
      setTimeout(() => ring.remove(), 300);
    });
  }

  function onClickCapture(event) {
    const vw = Math.max(window.innerWidth, 1);
    const vh = Math.max(window.innerHeight, 1);
    const normX = Math.min(Math.max(event.clientX / vw, 0.08), 0.92);
    const normY = Math.min(Math.max(event.clientY / vh, 0.12), 0.88);
    const readable = extractReadableLabel(event.target);

    capturedClicks.push({
      rawTimeMs: Math.round(performance.now() - startPerf),
      normX,
      normY,
      label: `Click ${readable}`,
      shortLabel: readable.slice(0, 22),
    });

    requestAnimationFrame(() => {
      labelSpan.textContent = `SHOWCRAFT REC 60Hz · ${capturedClicks.length} vectors captured`;
    });
    flashClickRing(event.clientX, event.clientY);
  }

  window.addEventListener('click', onClickCapture, true);

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'SHOWCRAFT_STOP_CAPTURE') {
      window.removeEventListener('click', onClickCapture, true);
      globalThis.__showcraftRecorderActive = false;
      requestAnimationFrame(() => hud.remove());

      const cleanUrl = `${window.location.hostname}${window.location.pathname}`.slice(0, 42);
      sendResponse({
        clicks: capturedClicks,
        pageTitle: document.title || window.location.hostname,
        pageUrl: cleanUrl,
      });
    }
    return true;
  });
})();
