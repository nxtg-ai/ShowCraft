#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3456;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

// In-memory viral conversion funnel ledger (Axiom 1: Traceable telemetry)
const viralTelemetry = {
  impressions: 14,
  hotspot_interactions: 38,
  studio_remixes: 6,
  exports_webm: 4,
  lastUpdated: new Date().toISOString(),
};

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderAnimatedBadgeSvg({ title, url, hook, stepsCount }) {
  const safeTitle = escapeXml((title || 'Autonomous Cluster — Edge Topology').slice(0, 48));
  const safeUrl = escapeXml((url || 'app.vanguard-cloud.dev/clusters/prod').slice(0, 42));
  const safeHook = escapeXml((hook || 'Deploy autonomous agent clusters in three deterministic steps.').slice(0, 64));
  const safeSteps = Number(stepsCount) || 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="360" viewBox="0 0 680 360" fill="none">
  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace; }
    .pulse-ring {
      transform-origin: 495px 248px;
      animation: pulse 1.8s ease-out infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.85); opacity: 0.95; }
      100% { transform: scale(1.75); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .pulse-ring { animation: none; }
    }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="680" y2="360" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#121318"/>
      <stop offset="50%" stop-color="#08080b"/>
      <stop offset="100%" stop-color="#181820"/>
    </linearGradient>
  </defs>

  <!-- Studio Matte Frame -->
  <rect width="680" height="360" rx="12" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="679" height="359" rx="11.5" stroke="rgba(255,255,255,0.14)"/>

  <!-- Top Hook Pill -->
  <rect x="110" y="14" width="460" height="24" rx="4" fill="#09090b" stroke="rgba(255,255,255,0.12)"/>
  <text x="340" y="30" text-anchor="middle" fill="#e4e4e7" font-size="11" font-weight="500" class="font-sans">${safeHook}</text>

  <!-- Floating Desktop Application Window -->
  <rect x="48" y="48" width="584" height="256" rx="8" fill="#0b0c0e" stroke="rgba(255,255,255,0.14)"/>
  <rect x="48" y="48" width="584" height="28" rx="8" fill="#121317"/>
  <line x1="48" y1="76" x2="632" y2="76" stroke="rgba(255,255,255,0.08)"/>
  <circle cx="64" cy="62" r="4" fill="#3f3f46"/>
  <circle cx="76" cy="62" r="4" fill="#3f3f46"/>
  <circle cx="88" cy="62" r="4" fill="#3f3f46"/>

  <!-- URL Bar -->
  <rect x="220" y="53" width="240" height="18" rx="3" fill="#09090b" stroke="rgba(255,255,255,0.07)"/>
  <text x="340" y="65" text-anchor="middle" fill="#a1a1aa" font-size="9.5" class="font-mono">${safeUrl}</text>

  <!-- Interior Title & Status -->
  <text x="76" y="104" fill="#f4f4f6" font-size="14" font-weight="600" class="font-sans">${safeTitle}</text>
  <rect x="486" y="90" width="122" height="18" rx="3" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)"/>
  <text x="547" y="102" text-anchor="middle" fill="#34d399" font-size="8.5" font-weight="600" class="font-mono">${safeSteps} INTERACTIVE STEPS</text>

  <!-- 3 Node Cards -->
  <rect x="76" y="120" width="168" height="92" rx="6" fill="rgba(99,102,241,0.12)" stroke="#6366f1" stroke-width="1.5"/>
  <text x="88" y="140" fill="#a1a1aa" font-size="8.5" class="font-mono">NODE 01 · VERIFIED</text>
  <text x="88" y="164" fill="#f4f4f6" font-size="11" font-weight="600" class="font-mono">gemini-3.8-flash</text>
  <text x="88" y="196" fill="#a5b4fc" font-size="8.5" class="font-mono">STATE: COMMITTED</text>

  <rect x="256" y="120" width="168" height="92" rx="6" fill="#111216" stroke="rgba(255,255,255,0.08)"/>
  <text x="268" y="140" fill="#71717a" font-size="8.5" class="font-mono">NODE 02 · GUARDRAIL</text>
  <text x="268" y="164" fill="#f4f4f6" font-size="11" font-weight="600" class="font-mono">QLC Cap Enforced</text>
  <text x="268" y="196" fill="#52525b" font-size="8.5" class="font-mono">STATE: READY</text>

  <rect x="436" y="120" width="172" height="92" rx="6" fill="#111216" stroke="rgba(255,255,255,0.08)"/>
  <text x="448" y="140" fill="#71717a" font-size="8.5" class="font-mono">NODE 03 · MESH</text>
  <text x="448" y="164" fill="#f4f4f6" font-size="11" font-weight="600" class="font-mono">p99 Latency: 38ms</text>
  <text x="448" y="196" fill="#52525b" font-size="8.5" class="font-mono">STATE: READY</text>

  <!-- Bottom Action Bar & Pulsing Interactive Hotspot -->
  <rect x="76" y="226" width="532" height="44" rx="6" fill="#111216" stroke="rgba(255,255,255,0.08)"/>
  <text x="92" y="252" fill="#a1a1aa" font-size="10" class="font-mono">CLICK TO LAUNCH INTERACTIVE SANDBOX</text>
  <rect x="412" y="234" width="184" height="28" rx="4" fill="#f4f4f6"/>
  <text x="504" y="252" text-anchor="middle" fill="#09090b" font-size="10.5" font-weight="600" class="font-sans">Play Interactive Demo →</text>

  <circle cx="495" cy="248" r="18" stroke="#6366f1" stroke-width="2" class="pulse-ring"/>
  <circle cx="495" cy="248" r="14" fill="rgba(99,102,241,0.28)" stroke="#ffffff" stroke-width="1.5"/>

  <!-- Footer Attribution Pill -->
  <rect x="215" y="318" width="250" height="26" rx="5" fill="rgba(9,9,11,0.9)" stroke="rgba(99,102,241,0.5)"/>
  <text x="340" y="335" text-anchor="middle" fill="#f4f4f6" font-size="10.5" font-weight="500" class="font-mono">60FPS REEL + PLAYABLE SANDBOX · SHOWCRAFT</text>
</svg>`;
}

const DIRECTOR_SCHEMA = {
  type: 'object',
  properties: {
    viral_hook: {
      type: 'string',
      description: 'Punchy 5-8 word opening hook for X/Product Hunt launch reel',
    },
    cta_badge: {
      type: 'string',
      description: 'Short interactive call-to-action badge text',
    },
    summary_insight: {
      type: 'string',
      description: '1-sentence explanation of why this flow converts viewers',
    },
    keyframes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step_index: { type: 'integer' },
          zoom_scale: { type: 'number' },
          caption: { type: 'string' },
          hotspot_label: { type: 'string' },
        },
        required: ['step_index', 'zoom_scale', 'caption', 'hotspot_label'],
      },
    },
  },
  required: ['viral_hook', 'cta_badge', 'summary_insight', 'keyframes'],
};

async function runGeminiDirector(apiKey, telemetrySummary) {
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });

  const prompt = `You are Showcraft Live's AI Launch Director.
Given the following user interaction telemetry from a product demo recording, generate a high-converting viral launch script, camera zoom scales (between 1.35 and 1.85), kinetic captions (max 9 words each), and playable hotspot labels.

Telemetry JSON:
${JSON.stringify(telemetrySummary, null, 2)}`;

  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash',
    input: prompt,
    response_format: [
      {
        type: 'text',
        mime_type: 'application/json',
        schema: DIRECTOR_SCHEMA,
      },
    ],
  });

  return JSON.parse(interaction.output_text);
}

async function runGeminiTts(apiKey, scriptText, voiceName = 'Kore', stylePrompt = 'crisp, confident studio product launch narrator') {
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });

  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash-tts',
    input: [
      {
        type: 'user_input',
        content: [
          {
            type: 'text',
            text: scriptText,
            annotations: [
              {
                type: 'speech_metadata',
                speaker: 'Narrator',
                style: stylePrompt,
              },
            ],
          },
        ],
      },
    ],
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: {
        speakers: [{ speaker: 'Narrator', voice: voiceName }],
      },
    },
  });

  if (!interaction.output_audio?.data) {
    throw new Error('No audio data returned from gemini-3.8-flash-tts');
  }

  return {
    audioBase64: interaction.output_audio.data,
    mimeType: interaction.output_audio.mime_type || 'audio/wav',
    model: 'gemini-3.8-flash-tts',
    voice: voiceName,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/badge.svg') {
      viralTelemetry.impressions += 1;
      viralTelemetry.lastUpdated = new Date().toISOString();
      const svg = renderAnimatedBadgeSvg({
        title: url.searchParams.get('title'),
        url: url.searchParams.get('url'),
        hook: url.searchParams.get('hook'),
        stepsCount: url.searchParams.get('steps'),
      });
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(svg);
      return;
    }

    if (url.pathname === '/api/telemetry') {
      if (req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const { event } = JSON.parse(body || '{}');
        if (event && typeof viralTelemetry[event] === 'number') {
          viralTelemetry[event] += 1;
          viralTelemetry.lastUpdated = new Date().toISOString();
        }
      }
      const kFactor = Number(
        (
          ((viralTelemetry.studio_remixes + viralTelemetry.exports_webm) /
            Math.max(viralTelemetry.impressions, 1)) *
          2.1
        ).toFixed(2)
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...viralTelemetry, kFactor }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/direct') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const payload = JSON.parse(body || '{}');
      const apiKey = payload.apiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'MISSING_API_KEY',
            message: 'No GEMINI_API_KEY configured; using local deterministic director.',
          })
        );
        return;
      }

      const directed = await runGeminiDirector(apiKey, payload.telemetry);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          directed,
          model: 'gemini-3.8-flash',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/tts') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const payload = JSON.parse(body || '{}');
      const apiKey = payload.apiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'MISSING_API_KEY',
            message: 'No GEMINI_API_KEY provided; using local Web Audio procedural synthesis.',
          })
        );
        return;
      }

      const ttsResult = await runGeminiTts(
        apiKey,
        payload.text || 'Deploy autonomous agent clusters in three deterministic steps.',
        payload.voice || 'Kore',
        payload.style || 'crisp, confident studio product launch narrator'
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ...ttsResult,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    const fullPath = path.join(PUBLIC_DIR, safePath);

    const data = await fs.readFile(fullPath);
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[Showcraft Live] Studio running at http://localhost:${PORT}`);
});
