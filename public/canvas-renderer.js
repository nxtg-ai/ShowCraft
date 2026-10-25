/**
 * Showcraft — 60fps Hardware Canvas Compositor & WebM Video Exporter
 * Engineered with precision dark-mode UI geometry (Linear / Screen Studio aesthetic).
 */

const BACKDROPS = {
  obsidian: { stops: ['#121318', '#08080b', '#181820'], isLight: false },
  hyperion: { stops: ['#171c2e', '#090b12', '#1e1b38'], isLight: false },
  emerald: { stops: ['#0e1f1c', '#070a09', '#112220'], isLight: false },
  sunset: { stops: ['#241918', '#0c090a', '#261720'], isLight: false },
  alabaster: { stops: ['#f8fafc', '#eef2f6', '#e2e8f0'], isLight: true },
  limestone: { stops: ['#faf8f5', '#f2ece1', '#e6dec8'], isLight: true },
};

export class StudioCanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  renderFrame(flow, camState, options = {}) {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const backdropKey = options.backdrop || 'obsidian';
    const viralHook = options.viralHook || flow.viralHook;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // 1. Studio Matte Backdrop (Supports both Dark Cinema & High-Key Daylight Mattes)
    const preset = BACKDROPS[backdropKey] || BACKDROPS.obsidian;
    const { stops: colors, isLight } = preset;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Precision Dot Matrix Grid (adapts contrast to matte luminance)
    ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    for (let x = 24; x < W; x += 28) {
      for (let y = 24; y < H; y += 28) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // 2. Critically-Damped Spring Camera Transform
    const focusX = camState.camX * W;
    const focusY = camState.camY * H;
    ctx.translate(W / 2, H / 2);
    ctx.scale(camState.scale, camState.scale);
    ctx.translate(-focusX, -focusY);

    // 3. Desktop Application Frame (Responsive to 16:10, 16:9, 4:5, and 1:1 Stage Ratios)
    const isCompact = W < 720;
    const winX = isCompact ? 34 : 76;
    const winY = 64;
    const winW = W - winX * 2;
    const winH = H - 128;

    ctx.save();
    ctx.shadowColor = isLight ? 'rgba(15, 23, 42, 0.24)' : 'rgba(0, 0, 0, 0.78)';
    ctx.shadowBlur = isLight ? 40 : 48;
    ctx.shadowOffsetY = isLight ? 18 : 24;
    this.roundRect(ctx, winX, winY, winW, winH, 10);
    ctx.fillStyle = '#0b0c0e';
    ctx.fill();
    ctx.restore();

    // Hairline Outer Bezel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, winX, winY, winW, winH, 10);
    ctx.stroke();

    // Window Titlebar
    ctx.save();
    this.roundRect(ctx, winX, winY, winW, 34, { tl: 10, tr: 10, br: 0, bl: 0 });
    ctx.fillStyle = '#121317';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(winX, winY + 34);
    ctx.lineTo(winX + winW, winY + 34);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.stroke();

    // Muted Traffic Dots
    const dotColors = ['#3f3f46', '#3f3f46', '#3f3f46'];
    dotColors.forEach((col, idx) => {
      ctx.beginPath();
      ctx.arc(winX + 18 + idx * 14, winY + 17, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // URL Address Bar
    this.roundRect(ctx, winX + winW / 2 - 135, winY + 6, 270, 22, 4);
    ctx.fillStyle = '#09090b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.stroke();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '500 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(flow.url, winX + winW / 2, winY + 20.5);

    const hasLiveVideo =
      options.liveVideoElement &&
      options.liveVideoElement.readyState >= 2 &&
      options.liveVideoElement.videoWidth > 0;

    if (hasLiveVideo) {
      // 4A. Live 60fps Screen/Tab Video Stream Composited Inside Window Frame
      ctx.save();
      this.roundRect(ctx, winX, winY + 34, winW, winH - 34, { tl: 0, tr: 0, br: 10, bl: 10 });
      ctx.clip();
      ctx.drawImage(options.liveVideoElement, winX, winY + 34, winW, winH - 34);
      ctx.restore();
    } else {
      // 4B. Left Sidebar Rail inside Simulated App (Linear / Vercel style)
      const railW = isCompact ? 38 : 52;
      ctx.beginPath();
      ctx.moveTo(winX + railW, winY + 34);
      ctx.lineTo(winX + railW, winY + winH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        this.roundRect(ctx, winX + (isCompact ? 9 : 16), winY + 52 + i * 32, 20, 20, 4);
        ctx.fillStyle = i === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)';
        ctx.fill();
      }

      // 5. Interior Workspace Content
      const padX = isCompact ? 16 : 28;
      const contentX = winX + railW + padX;
      const contentW = winW - railW - padX * 2;
      const headerY = winY + 66;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#f4f4f6';
      ctx.font = isCompact ? '600 13.5px Inter, sans-serif' : '600 16px Inter, sans-serif';
      ctx.fillText(flow.title, contentX, headerY);

      // Status Tag
      const statusW = isCompact ? 124 : 148;
      this.roundRect(ctx, contentX + contentW - statusW, headerY - 14, statusW, 20, 4);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(flow.statusText, contentX + contentW - statusW / 2, headerY - 1);

      // 3 Telemetry Node Cards
      const cardGap = isCompact ? 8 : 12;
      const cardW = (contentW - cardGap * 2) / 3;
      const cardH = isCompact ? 142 : 132;
      const cardY = headerY + 24;

      flow.cards.forEach((card, idx) => {
        const cx = contentX + idx * (cardW + cardGap);
        const isTriggered = camState.activeStepIndex >= idx;

        this.roundRect(ctx, cx, cardY, cardW, cardH, 6);
        ctx.fillStyle = isTriggered ? 'rgba(99, 102, 241, 0.1)' : '#111216';
        ctx.fill();
        ctx.lineWidth = isTriggered ? 1.5 : 1;
        ctx.strokeStyle = isTriggered ? '#6366f1' : 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();

        // Card Index & Label
        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = '500 9.5px "JetBrains Mono", monospace';
        ctx.fillText(`0${idx + 1} · ${card.label.toUpperCase()}`, cx + 10, cardY + 26, cardW - 20);

        // Primary Value
        ctx.fillStyle = '#f4f4f6';
        ctx.font = isCompact ? '600 11px "JetBrains Mono", monospace' : '600 13px "JetBrains Mono", monospace';
        ctx.fillText(isTriggered ? card.activeVal : card.value, cx + 10, cardY + 56, cardW - 20);

        // Subtle Sparkline Geometry inside Card
        ctx.beginPath();
        const sparkY = cardY + 86;
        ctx.moveTo(cx + 10, sparkY);
        ctx.lineTo(cx + cardW * 0.3, sparkY - (isTriggered ? 8 : 3));
        ctx.lineTo(cx + cardW * 0.55, sparkY - (isTriggered ? 4 : 1));
        ctx.lineTo(cx + cardW * 0.78, sparkY - (isTriggered ? 14 : 5));
        ctx.lineTo(cx + cardW - 10, sparkY - (isTriggered ? 18 : 6));
        ctx.strokeStyle = isTriggered ? '#818cf8' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // State Footer
        ctx.fillStyle = isTriggered ? '#a5b4fc' : '#52525b';
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillText(isTriggered ? 'STATE: COMMITTED' : 'STATE: PENDING', cx + 10, cardY + 114, cardW - 20);
      });

      // Bottom Execution Bar
      const barY = cardY + cardH + 28;
      const barH = 62;
      this.roundRect(ctx, contentX, barY, contentW, barH, 6);
      ctx.fillStyle = '#111216';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const ctaTriggered = camState.activeStepIndex >= flow.keyframes.length - 1;
      const btnW = isCompact ? 188 : 228;
      ctx.fillStyle = '#a1a1aa';
      ctx.font = isCompact ? '500 10px "JetBrains Mono", monospace' : '500 11.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        ctaTriggered ? 'STATUS: PIPELINE VERIFIED' : 'STATUS: AWAITING COMMIT',
        contentX + 14,
        barY + 35,
        contentW - btnW - 34
      );

      const btnH = 36;
      const btnX = contentX + contentW - btnW - 12;
      const btnY = barY + 13;
      this.roundRect(ctx, btnX, btnY, btnW, btnH, 5);
      ctx.fillStyle = ctaTriggered ? '#10b981' : '#f4f4f6';
      ctx.fill();

      ctx.fillStyle = '#09090b';
      ctx.font = '600 11.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        ctaTriggered ? flow.ctaButton.doneLabel : flow.ctaButton.label,
        btnX + btnW / 2,
        btnY + 22
      );
    }

    // 6. Precision Vector Cursor & Click Ripple
    const curPxX = winX + camState.cursorX * winW;
    const curPxY = winY + camState.cursorY * winH;

    if (options.selectedNode && options.selectedNode.showReticle) {
      const nodePxX = winX + options.selectedNode.normX * winW;
      const nodePxY = winY + options.selectedNode.normY * winH;
      ctx.save();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.9)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(nodePxX, nodePxY, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(nodePxX - 22, nodePxY);
      ctx.lineTo(nodePxX + 22, nodePxY);
      ctx.moveTo(nodePxX, nodePxY - 22);
      ctx.lineTo(nodePxX, nodePxY + 22);
      ctx.stroke();

      this.roundRect(ctx, nodePxX + 12, nodePxY - 24, 94, 16, 3);
      ctx.fillStyle = 'rgba(9, 9, 11, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '600 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`VEC 0${options.selectedNode.index + 1} ANCHOR`, nodePxX + 17, nodePxY - 13);
      ctx.restore();
    }

    if (camState.clickPulse > 0) {
      const radius = 10 + (1 - camState.clickPulse) * 32;
      ctx.beginPath();
      ctx.arc(curPxX, curPxY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(99, 102, 241, ${camState.clickPulse * 0.85})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(curPxX, curPxY);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 19);
    ctx.lineTo(5.2, 14.8);
    ctx.lineTo(9.2, 22);
    ctx.lineTo(12.2, 20.5);
    ctx.lineTo(8.2, 13.2);
    ctx.lineTo(15, 13.2);
    ctx.closePath();
    ctx.fillStyle = '#f4f4f6';
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // End Camera Transform

    // 7. Studio HUD Overlays (Top Hook Header & Lower-Third Timecoded Caption)
    if (viralHook) {
      ctx.save();
      ctx.font = '500 12px Inter, sans-serif';
      const hookW = Math.min(ctx.measureText(viralHook).width + 36, W - 40);
      this.roundRect(ctx, (W - hookW) / 2, 14, hookW, 28, 4);
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(9, 9, 11, 0.82)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isLight ? '#0f172a' : '#e4e4e7';
      ctx.textAlign = 'center';
      ctx.fillText(viralHook, W / 2, 32);
      ctx.restore();
    }

    if (camState.caption) {
      ctx.save();
      ctx.font = '500 12.5px "JetBrains Mono", monospace';
      const capW = Math.min(ctx.measureText(camState.caption).width + 44, W - 60);
      const capY = H - 54;
      this.roundRect(ctx, (W - capW) / 2, capY, capW, 32, 5);
      ctx.fillStyle = 'rgba(9, 9, 11, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f4f4f6';
      ctx.textAlign = 'center';
      ctx.fillText(camState.caption, W / 2, capY + 20.5);
      ctx.restore();
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    const radii = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r;
    ctx.beginPath();
    ctx.moveTo(x + radii.tl, y);
    ctx.lineTo(x + w - radii.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radii.tr);
    ctx.lineTo(x + w, y + h - radii.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radii.br, y + h);
    ctx.lineTo(x + radii.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radii.bl);
    ctx.lineTo(x, y + radii.tl);
    ctx.quadraticCurveTo(x, y, x + radii.tl, y);
    ctx.closePath();
  }
}

/**
 * Exports a 60fps .webm video directly from the studio canvas stream,
 * optionally muxing a synchronized Web Audio API / Gemini 3.8 TTS audio track.
 */
export async function exportCanvasToWebM(canvas, durationMs, onProgress, audioTrack = null) {
  const canvasStream = canvas.captureStream(60);
  const tracks = [...canvasStream.getVideoTracks()];
  if (audioTrack) {
    tracks.push(audioTrack);
  }
  const combinedStream = new MediaStream(tracks);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = (err) => reject(err);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.start(100);
    const start = performance.now();
    const timer = setInterval(() => {
      const elapsed = performance.now() - start;
      if (onProgress) onProgress(Math.min(elapsed / durationMs, 1));
      if (elapsed >= durationMs) {
        clearInterval(timer);
        recorder.stop();
      }
    }, 80);
  });
}
