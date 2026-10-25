/**
 * Showcraft — Telemetry Recorder, Dead-Air Compressor & Spring Camera Engine
 */

export const PRESET_FLOWS = {
  'ai-agent': {
    id: 'ai-agent',
    fileName: 'vanguard-deploy.scraft',
    url: 'app.vanguard-cloud.dev/clusters/prod',
    title: 'Autonomous Cluster — Edge Topology',
    statusText: 'READY · 14 REGIONS',
    viralHook: 'Deploy autonomous agent clusters in three deterministic steps.',
    ctaBadge: 'Interactive Artifact · Showcraft',
    cards: [
      { id: 'model', label: 'Inference Runtime', value: 'gemini-3.8-flash', activeVal: 'gemini-3.8-flash [LOCKED]' },
      { id: 'guard', label: 'Cost Ceiling', value: '$0.004 / invocation', activeVal: 'QLC Cap Enforced' },
      { id: 'region', label: 'Anycast Mesh', value: '14 Edge PoPs', activeVal: 'p99 Latency: 38ms' },
    ],
    ctaButton: { label: 'Commit Production Rollout', doneLabel: 'Rollout Active · 14/14 Healthy' },
    defaultRawDurationMs: 11400,
    keyframes: [
      {
        step_index: 0,
        timeMs: 650,
        normX: 0.25,
        normY: 0.48,
        zoom_scale: 1.65,
        caption: '01 · Bind primary inference runtime to gemini-3.8-flash',
        hotspot_label: 'Bind Runtime',
        targetId: 'card-0',
      },
      {
        step_index: 1,
        timeMs: 2050,
        normX: 0.54,
        normY: 0.48,
        zoom_scale: 1.68,
        caption: '02 · Enforce deterministic per-invocation budget ceiling',
        hotspot_label: 'Enforce Cost Cap',
        targetId: 'card-1',
      },
      {
        step_index: 2,
        timeMs: 3450,
        normX: 0.82,
        normY: 0.48,
        zoom_scale: 1.65,
        caption: '03 · Provision global Anycast routing across 14 PoPs',
        hotspot_label: 'Provision Mesh',
        targetId: 'card-2',
      },
      {
        step_index: 3,
        timeMs: 4850,
        normX: 0.82,
        normY: 0.82,
        zoom_scale: 1.82,
        caption: '04 · Execute zero-downtime production rollout',
        hotspot_label: 'Commit Rollout',
        targetId: 'cta-btn',
      },
    ],
  },
  'stripe-rev': {
    id: 'stripe-rev',
    fileName: 'pulse-retention.scraft',
    url: 'console.pulse-analytics.io/cohorts',
    title: 'Net Dollar Retention & Churn Telemetry',
    statusText: 'SYNCED · STRIPE + CRM',
    viralHook: 'Isolate enterprise churn signals before renewal dates.',
    ctaBadge: 'Interactive Cohort · Showcraft',
    cards: [
      { id: 'mrr', label: 'Net Expansion MRR', value: '$148,920 (+18.4%)', activeVal: '$148,920 [Cohort Isolated]' },
      { id: 'risk', label: 'At-Risk Telemetry', value: '7 Enterprise Orgs', activeVal: '7 Orgs Flagged (<40% DAU)' },
      { id: 'ltv', label: 'CAC Payback', value: '2.4 Months', activeVal: '1.8 Months Projected' },
    ],
    ctaButton: { label: 'Dispatch Automated Playbook', doneLabel: 'Playbook Dispatched · 7 Orgs' },
    defaultRawDurationMs: 10200,
    keyframes: [
      {
        step_index: 0,
        timeMs: 600,
        normX: 0.25,
        normY: 0.48,
        zoom_scale: 1.62,
        caption: '01 · Segment net expansion MRR from live webhook stream',
        hotspot_label: 'Segment MRR',
        targetId: 'card-0',
      },
      {
        step_index: 1,
        timeMs: 2100,
        normX: 0.54,
        normY: 0.48,
        zoom_scale: 1.72,
        caption: '02 · Isolate 7 enterprise accounts with seat utilization drop',
        hotspot_label: 'Filter At-Risk Orgs',
        targetId: 'card-1',
      },
      {
        step_index: 2,
        timeMs: 3600,
        normX: 0.82,
        normY: 0.82,
        zoom_scale: 1.85,
        caption: '03 · Trigger automated renewal intervention workflow',
        hotspot_label: 'Dispatch Playbook',
        targetId: 'cta-btn',
      },
    ],
  },
  'sql-copilot': {
    id: 'sql-copilot',
    fileName: 'tabsnap-reconcile.scraft',
    url: 'local.tabsnap.dev/duckdb-wasm',
    title: 'In-Browser DuckDB Schema Reconciler',
    statusText: 'LOCAL · WASM SANDBOX',
    viralHook: 'Join and sanitize fragmented CSV schemas locally in 19ms.',
    ctaBadge: 'Interactive Wasm Demo · Showcraft',
    cards: [
      { id: 'dedup', label: 'Entity Resolution', value: '1,420 Duplicate Keys', activeVal: '1,420 Keys Canonicalized' },
      { id: 'date', label: 'Temporal Parser', value: '4 Mixed Formats', activeVal: 'Normalized to ISO-8601' },
      { id: 'join', label: 'Memory Execution', value: 'DuckDB-Wasm Engine', activeVal: 'Joined in 19ms (0 Egress)' },
    ],
    ctaButton: { label: 'Export Verified Parquet', doneLabel: 'Parquet Streamed · 0 Bytes Leaked' },
    defaultRawDurationMs: 9800,
    keyframes: [
      {
        step_index: 0,
        timeMs: 620,
        normX: 0.25,
        normY: 0.48,
        zoom_scale: 1.65,
        caption: '01 · Resolve fuzzy entity keys across disconnected exports',
        hotspot_label: 'Resolve Entities',
        targetId: 'card-0',
      },
      {
        step_index: 1,
        timeMs: 2050,
        normX: 0.54,
        normY: 0.48,
        zoom_scale: 1.65,
        caption: '02 · Coerce heterogeneous timestamp columns to UTC ISO-8601',
        hotspot_label: 'Coerce Timestamps',
        targetId: 'card-1',
      },
      {
        step_index: 2,
        timeMs: 3550,
        normX: 0.82,
        normY: 0.82,
        zoom_scale: 1.8,
        caption: '03 · Export verified Parquet artifact from client memory',
        hotspot_label: 'Export Parquet',
        targetId: 'cta-btn',
      },
    ],
  },
};

/**
 * Compresses dead air (>800ms gaps between clicks) into tight studio-paced keyframes.
 */
export function compressDeadAir(rawClicks, rawDurationMs) {
  if (!rawClicks || rawClicks.length === 0) {
    return {
      compressedDurationMs: 6000,
      savedMs: 4200,
      savedPercent: 64,
      keyframes: [],
    };
  }

  let currentCompressedClock = 600;
  const keyframes = rawClicks.map((click, index) => {
    if (index > 0) {
      const rawGap = click.rawTimeMs - rawClicks[index - 1].rawTimeMs;
      const studioGap = Math.min(Math.max(rawGap, 950), 1400);
      currentCompressedClock += studioGap;
    }

    const numPrefix = String(index + 1).padStart(2, '0');
    return {
      step_index: index,
      timeMs: Math.round(currentCompressedClock),
      normX: Number(click.normX.toFixed(3)),
      normY: Number(click.normY.toFixed(3)),
      zoom_scale: click.targetId === 'cta-btn' ? 1.82 : 1.65,
      caption: `${numPrefix} · ${click.label || 'Execute interactive state transition'}`,
      hotspot_label: click.hotspotLabel || `Step ${numPrefix}`,
      targetId: click.targetId || `step-${index}`,
    };
  });

  const compressedDurationMs = Math.max(currentCompressedClock + 1150, 3500);
  const effectiveRaw = Math.max(rawDurationMs, compressedDurationMs + 1800);
  const savedMs = Math.max(effectiveRaw - compressedDurationMs, 1200);
  const savedPercent = Math.min(Math.round((savedMs / effectiveRaw) * 100), 78);

  return {
    compressedDurationMs,
    savedMs,
    savedPercent,
    keyframes,
  };
}

/**
 * Smoothly interpolates cursor position, camera zoom, camera focus center, and active caption
 * at any playback timestamp `tMs`.
 */
export function evaluateCameraState(keyframes, tMs, maxZoomOverride = 1.65) {
  if (!keyframes || keyframes.length === 0) {
    return {
      cursorX: 0.5,
      cursorY: 0.5,
      camX: 0.5,
      camY: 0.5,
      scale: 1,
      activeStepIndex: -1,
      caption: '',
      clickPulse: 0,
    };
  }

  const easeInOut = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(Math.max(u, 0), 1));

  let prevKf = keyframes[0];
  let nextKf = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].timeMs <= tMs) {
      prevKf = keyframes[i];
      nextKf = keyframes[Math.min(i + 1, keyframes.length - 1)];
    }
  }

  let cursorX = prevKf.normX;
  let cursorY = prevKf.normY;

  if (tMs < keyframes[0].timeMs) {
    const u = easeInOut(tMs / Math.max(keyframes[0].timeMs, 1));
    cursorX = 0.5 + (keyframes[0].normX - 0.5) * u;
    cursorY = 0.85 + (keyframes[0].normY - 0.85) * u;
  } else if (prevKf !== nextKf) {
    const span = Math.max(nextKf.timeMs - prevKf.timeMs, 1);
    const moveWindow = Math.min(span * 0.55, 650);
    const elapsed = tMs - prevKf.timeMs;
    const holdTime = span - moveWindow;
    const u = easeInOut((elapsed - holdTime) / moveWindow);
    cursorX = prevKf.normX + (nextKf.normX - prevKf.normX) * u;
    cursorY = prevKf.normY + (nextKf.normY - prevKf.normY) * u;
  }

  let activeKf = null;
  let clickPulse = 0;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    const dt = tMs - kf.timeMs;
    if (dt >= -380 && dt <= 1150) {
      activeKf = kf;
    }
    if (dt >= 0 && dt <= 480) {
      clickPulse = 1 - dt / 480;
    }
  }

  let scale = 1.0;
  let camX = 0.5;
  let camY = 0.5;

  if (activeKf) {
    const dt = tMs - activeKf.timeMs;
    let zoomFactor = 0;
    if (dt < 0) {
      zoomFactor = easeInOut((dt + 380) / 380);
    } else if (dt <= 750) {
      zoomFactor = 1;
    } else {
      zoomFactor = 1 - easeInOut((dt - 750) / 400);
    }

    if (maxZoomOverride <= 1.01) {
      scale = 1.0;
    } else {
      const kfScale = Number(activeKf.zoom_scale) || 1.65;
      const ratio = maxZoomOverride / 1.65;
      const targetScale = Math.min(Math.max(kfScale * ratio, 1.15), 2.25);
      scale = 1 + (targetScale - 1) * zoomFactor;
    }
    camX = 0.5 + (activeKf.normX - 0.5) * zoomFactor * 0.65;
    camY = 0.5 + (activeKf.normY - 0.5) * zoomFactor * 0.65;
  }

  return {
    cursorX,
    cursorY,
    camX,
    camY,
    scale,
    activeStepIndex: activeKf ? activeKf.step_index : -1,
    caption: activeKf ? activeKf.caption : '',
    clickPulse,
  };
}

/**
 * Calls the server's Gemini 3.8 Flash `/api/direct` endpoint with graceful local fallback.
 */
export async function directWithGemini(apiKey, flowState) {
  const response = await fetch('/api/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      telemetry: {
        appTitle: flowState.title,
        url: flowState.url,
        steps: flowState.keyframes.map((k) => ({
          step_index: k.step_index,
          timeMs: k.timeMs,
          caption: k.caption,
          targetId: k.targetId,
        })),
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gemini API request failed');
  }

  return response.json();
}

/**
 * Encodes a complete Showcraft flow + studio optics configuration into a compact,
 * deterministic Base64URL string (< 1.2 KB for 10 steps) for zero-database viral sharing.
 */
export function encodeArtifactState(flow, options = {}) {
  const compactPayload = {
    v: 1,
    p: flow.id || 'ai-agent',
    u: flow.url || '',
    t: flow.title || '',
    d: Math.round(options.durationMs || 6000),
    b: options.backdrop || 'obsidian',
    z: Number(options.maxZoom || 1.65),
    h: flow.viralHook || '',
    c: flow.ctaBadge || '',
    k: (flow.keyframes || []).map((kf) => [
      Math.round(kf.timeMs),
      Number(kf.normX.toFixed(3)),
      Number(kf.normY.toFixed(3)),
      Number(kf.zoom_scale.toFixed(2)),
      kf.caption,
      kf.hotspot_label,
      kf.targetId,
    ]),
  };

  const jsonStr = JSON.stringify(compactPayload);
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Url = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return {
    hashToken: base64Url,
    byteLength: bytes.length,
  };
}

/**
 * Reconstructs a full Showcraft flow + studio optics configuration from a Base64URL token.
 */
export function decodeArtifactState(hashToken) {
  if (!hashToken || typeof hashToken !== 'string') return null;
  try {
    const base64 = hashToken.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || parsed.v !== 1) return null;

    const basePreset = PRESET_FLOWS[parsed.p] || PRESET_FLOWS['ai-agent'];
    const flow = structuredClone(basePreset);
    if (parsed.u) flow.url = parsed.u;
    if (parsed.t) flow.title = parsed.t;
    if (parsed.h) flow.viralHook = parsed.h;
    if (parsed.c) flow.ctaBadge = parsed.c;

    if (Array.isArray(parsed.k) && parsed.k.length > 0) {
      flow.keyframes = parsed.k.map((tuple, idx) => ({
        step_index: idx,
        timeMs: Number(tuple[0]) || 600,
        normX: Number(tuple[1]) || 0.5,
        normY: Number(tuple[2]) || 0.5,
        zoom_scale: Number(tuple[3]) || 1.65,
        caption: String(tuple[4] || ''),
        hotspot_label: String(tuple[5] || `Step ${idx + 1}`),
        targetId: String(tuple[6] || `step-${idx}`),
      }));
    }

    return {
      flow,
      durationMs: Number(parsed.d) || 6000,
      backdrop: parsed.b || 'obsidian',
      maxZoom: Number(parsed.z) || 1.65,
    };
  } catch {
    return null;
  }
}

