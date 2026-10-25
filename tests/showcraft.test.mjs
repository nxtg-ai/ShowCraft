/**
 * Showcraft Live (v1.6.0) — Automated Verification Suite
 * Verifies:
 *  1. Dead-air telemetry compression (`compressDeadAir`)
 *  2. Critically-damped spring camera solver & per-node zoom (`evaluateCameraState`)
 *  3. Stateless `#scraft=` Base64URL codec & < 2KB size budget (`encodeArtifactState` / `decodeArtifactState`)
 *  4. Live HTTP server endpoints (`/`, `/api/badge.svg`, `/api/telemetry`, `/embed-sdk.js`)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_FLOWS,
  compressDeadAir,
  evaluateCameraState,
  encodeArtifactState,
  decodeArtifactState,
} from '../public/director-engine.js';

const BASE_URL = 'http://localhost:3456';

test('1. compressDeadAir excises idle pauses > 1150ms into crisp 450ms beats', () => {
  const rawEvents = [
    { rawTimeMs: 400, normX: 0.25, normY: 0.4, targetId: 'card-0', label: 'Step 1', hotspotLabel: 'Click 1' },
    { rawTimeMs: 4900, normX: 0.55, normY: 0.4, targetId: 'card-1', label: 'Step 2', hotspotLabel: 'Click 2' },
    { rawTimeMs: 9800, normX: 0.78, normY: 0.75, targetId: 'cta-btn', label: 'Step 3', hotspotLabel: 'Click 3' },
  ];
  const result = compressDeadAir(rawEvents, 11000);
  assert.equal(result.keyframes.length, 3);
  assert.ok(result.savedMs > 5000, `Expected >5000ms saved, got ${result.savedMs}ms`);
  assert.ok(result.savedPercent >= 45, `Expected >=45% saved, got ${result.savedPercent}%`);
  assert.ok(result.compressedDurationMs < 5000);
});

test('2. evaluateCameraState respects per-keyframe zoom_scale and spring physics', () => {
  const kfs = structuredClone(PRESET_FLOWS['ai-agent'].keyframes);
  kfs[0].zoom_scale = 2.05; // Custom per-keyframe zoom override
  const stateAtPeak = evaluateCameraState(kfs, kfs[0].timeMs + 100, 1.65);

  assert.equal(stateAtPeak.activeStepIndex, 0);
  assert.ok(stateAtPeak.scale > 1.95, `Expected zoomed scale > 1.95, got ${stateAtPeak.scale}`);
  const expectedCamX = 0.5 + (kfs[0].normX - 0.5) * 0.65;
  const expectedCamY = 0.5 + (kfs[0].normY - 0.5) * 0.65;
  assert.ok(Math.abs(stateAtPeak.camX - expectedCamX) < 0.01);
  assert.ok(Math.abs(stateAtPeak.camY - expectedCamY) < 0.01);
});

test('3. encodeArtifactState / decodeArtifactState roundtrips 10-step flow under 2048 bytes', () => {
  const baseFlow = structuredClone(PRESET_FLOWS['ai-agent']);
  while (baseFlow.keyframes.length < 10) {
    const idx = baseFlow.keyframes.length;
    baseFlow.keyframes.push({
      step_index: idx,
      timeMs: 900 + idx * 500,
      normX: 0.25 + (idx % 3) * 0.25,
      normY: 0.44 + (idx % 2) * 0.3,
      targetId: `card-${idx % 3}`,
      zoom_scale: 1.72,
      caption: `${idx + 1} · Step telemetry verification node`,
      hotspot_label: `Step ${idx + 1} Action`,
    });
  }

  const encoded = encodeArtifactState(baseFlow, {
    durationMs: 6500,
    backdrop: 'alabaster',
    maxZoom: 1.85,
  });

  assert.ok(encoded.byteLength < 2048, `Expected payload < 2048 bytes, got ${encoded.byteLength}`);

  const decoded = decodeArtifactState(encoded.hashToken);
  assert.ok(decoded, 'Expected non-null decoded state');
  assert.equal(decoded.backdrop, 'alabaster');
  assert.equal(decoded.maxZoom, 1.85);
  assert.equal(decoded.flow.keyframes.length, 10);
  assert.equal(decoded.flow.keyframes[9].zoom_scale, 1.72);
});

test('4. HTTP Server routes (/api/badge.svg, /api/telemetry, /embed-sdk.js) respond cleanly', async () => {
  const badgeRes = await fetch(
    `${BASE_URL}/api/badge.svg?title=VerifySuite&url=app.showcraft.dev&hook=TestHook&steps=4`
  );
  assert.equal(badgeRes.status, 200);
  assert.match(badgeRes.headers.get('content-type') || '', /image\/svg\+xml/);
  const svgBody = await badgeRes.text();
  assert.ok(svgBody.includes('VerifySuite'));
  assert.ok(svgBody.includes('4 INTERACTIVE STEPS'));

  const postTel = await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'hotspot_interactions' }),
  });
  assert.equal(postTel.status, 200);
  const telJson = await postTel.json();
  assert.ok(telJson.hotspot_interactions >= 1);
  assert.ok(typeof telJson.kFactor === 'number');

  const sdkRes = await fetch(`${BASE_URL}/embed-sdk.js`);
  assert.equal(sdkRes.status, 200);
  const sdkText = await sdkRes.text();
  assert.ok(sdkText.includes('mountShowcraftEmbeds'));
});
