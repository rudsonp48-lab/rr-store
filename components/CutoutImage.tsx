'use client';

import React, { useEffect, useState } from 'react';

/**
 * Remove automaticamente o fundo branco/claro das fotos de produto
 * (flood-fill a partir das bordas), preservando partes brancas do próprio
 * produto que não tocam a borda (ex.: AirPods, iPhone prata) e realizando
 * auto-crop inteligente da área útil para manter proporção uniforme no banner.
 * Resultado é cacheado em memória por URL.
 */

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

const MAX_SIDE = 1200;
// Tolerâncias calibradas para fundo de estúdio branco/claro (250-255):
// Evita "vazar" para dentro de corpos brancos ou reflexos prateados (AirPods, relógio, etc.)
const TOL_HARD = 4;
const TOL_SOFT = 12;
const MAX_EXPAND = 5;

function proxied(src: string): string {
  if (src.startsWith('data:') || src.startsWith('/')) return src;
  return `/api/img?url=${encodeURIComponent(src)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function cropToBoundingBox(
  sourceCanvas: HTMLCanvasElement,
  d: Uint8ClampedArray,
  w: number,
  h: number
): string {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    for (let x = 0; x < w; x++) {
      const alpha = d[(rowOffset + x) * 4 + 3];
      if (alpha > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas.toDataURL('image/png');
  }

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const pad = Math.round(Math.max(contentW, contentH) * 0.03);

  const outW = contentW + pad * 2;
  const outH = contentH + pad * 2;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return sourceCanvas.toDataURL('image/png');

  outCtx.drawImage(
    sourceCanvas,
    minX,
    minY,
    contentW,
    contentH,
    pad,
    pad,
    contentW,
    contentH
  );

  return outCanvas.toDataURL('image/png');
}

async function processCutout(src: string): Promise<string | null> {
  const img = await loadImage(proxied(src));
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  // 1) Analisa a borda: já é transparente? é fundo claro uniforme?
  let transparent = 0;
  let light = 0;
  let total = 0;
  let sr = 0;
  let sg = 0;
  let sb = 0;
  const sampleBorder = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    total++;
    if (d[i + 3] < 24) {
      transparent++;
      return;
    }
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (Math.min(r, g, b) > 230 && Math.max(r, g, b) - Math.min(r, g, b) < 16) {
      light++;
      sr += r;
      sg += g;
      sb += b;
    }
  };
  for (let x = 0; x < w; x++) {
    sampleBorder(x, 0);
    sampleBorder(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    sampleBorder(0, y);
    sampleBorder(w - 1, y);
  }

  // PNG já recortado: aplica apenas o auto-crop da área útil para preencher o palco
  if (transparent / total > 0.6) {
    return cropToBoundingBox(canvas, d, w, h);
  }
  // Foto sem borda predominantemente de estúdio claro: não arrisca recortar
  if (light / total < 0.6) return null;

  const bgR = sr / light;
  const bgG = sg / light;
  const bgB = sb / light;

  const dist = (i: number) =>
    Math.max(Math.abs(d[i] - bgR), Math.abs(d[i + 1] - bgG), Math.abs(d[i + 2] - bgB));

  // 2) Flood-fill a partir das bordas com continuidade entre vizinhos
  // Remove fundos de estúdio brancos/off-white (#FFFFFF até #F2F0F7) sem invadir produtos claros
  const visited = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;

  const isStudioBgPixel = (i: number) => {
    if (d[i + 3] < 24) return true;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= 238 && maxC - minC <= 14;
  };

  const pushInitial = (p: number) => {
    if (visited[p]) return;
    const i = p * 4;
    if (isStudioBgPixel(i) || dist(i) <= TOL_SOFT) {
      visited[p] = 1;
      stack[sp++] = p;
    }
  };

  for (let x = 0; x < w; x++) {
    pushInitial(x);
    pushInitial((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    pushInitial(y * w);
    pushInitial(y * w + w - 1);
  }

  const tryNeighbor = (currIdx: number, nextPos: number) => {
    if (visited[nextPos]) return;
    const ni = nextPos * 4;
    if (d[ni + 3] < 24) {
      visited[nextPos] = 1;
      stack[sp++] = nextPos;
      return;
    }
    if (!isStudioBgPixel(ni)) return;
    const step = Math.max(
      Math.abs(d[ni] - d[currIdx]),
      Math.abs(d[ni + 1] - d[currIdx + 1]),
      Math.abs(d[ni + 2] - d[currIdx + 2])
    );
    if (step <= 6 || dist(ni) <= MAX_EXPAND) {
      visited[nextPos] = 1;
      stack[sp++] = nextPos;
    }
  };

  while (sp > 0) {
    const p = stack[--sp];
    const ci = p * 4;
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) tryNeighbor(ci, p - 1);
    if (x < w - 1) tryNeighbor(ci, p + 1);
    if (y > 0) tryNeighbor(ci, p - w);
    if (y < h - 1) tryNeighbor(ci, p + w);
  }

  // 3) Aplica transparência preservando 100% da integridade do produto
  for (let p = 0; p < w * h; p++) {
    if (!visited[p]) continue;
    const i = p * 4;
    d[i + 3] = 0;
  }

  ctx.putImageData(imageData, 0, 0);
  return cropToBoundingBox(canvas, d, w, h);
}

export function getCutout(src: string): Promise<string | null> {
  if (src.startsWith('/apple-cutouts/')) {
    cache.set(src, src);
    return Promise.resolve(src);
  }
  if (cache.has(src)) return Promise.resolve(cache.get(src) ?? null);
  const existing = pending.get(src);
  if (existing) return existing;
  const job = processCutout(src)
    .catch(() => null)
    .then((res) => {
      cache.set(src, res);
      pending.delete(src);
      return res;
    });
  pending.set(src, job);
  return job;
}

/** Pré-processa imagens em segundo plano (ex.: próximos slides do banner). */
export function prefetchCutouts(srcs: string[]) {
  srcs.forEach((s) => {
    if (s) void getCutout(s);
  });
}

interface CutoutImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CutoutImage({ src, alt, className = '', style }: CutoutImageProps) {
  const isStaticCutout = src.startsWith('/apple-cutouts/');
  const [state, setState] = useState<{ src: string; url: string | null; done: boolean }>(() => ({
    src,
    url: isStaticCutout ? src : cache.get(src) ?? null,
    done: isStaticCutout || cache.has(src),
  }));

  useEffect(() => {
    let alive = true;
    if (src.startsWith('/apple-cutouts/')) {
      cache.set(src, src);
      setState({ src, url: src, done: true });
      return;
    }
    if (cache.has(src)) {
      setState({ src, url: cache.get(src) ?? null, done: true });
      return;
    }
    setState({ src, url: null, done: false });
    getCutout(src).then((url) => {
      if (alive) setState({ src, url, done: true });
    });
    return () => {
      alive = false;
    };
  }, [src]);

  const ready = state.src === src && state.done;

  if (ready && state.url) {
    return <img src={state.url} alt={alt} className={className} style={style} draggable={false} />;
  }

  if (ready && !state.url) {
    // Foto com cenário: mostra original com cantos arredondados
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} rounded-[32px]`}
        style={style}
        draggable={false}
      />
    );
  }

  // Carregando: placeholder invisível mantendo o espaço
  return <div aria-label={alt} className={className} style={{ ...style, opacity: 0 }} />;
}
