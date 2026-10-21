'use client';

import React, { useEffect, useState } from 'react';

/**
 * Remove automaticamente o fundo branco/claro das fotos de produto
 * (flood-fill a partir das bordas), preservando partes brancas do próprio
 * produto que não tocam a borda (ex.: AirPods, iPhone prata).
 * Resultado é cacheado em memória por URL.
 */

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

const MAX_SIDE = 1000;
const TOL_HARD = 14; // até aqui: 100% transparente
const TOL_SOFT = 34; // entre HARD e SOFT: borda suave (anti-alias)

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
    if (Math.min(r, g, b) > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 24) {
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

  // PNG já recortado: usa como está
  if (transparent / total > 0.6) return canvas.toDataURL('image/png');
  // Foto com cenário (não é fundo de estúdio claro): não recorta
  if (light / total < 0.55) return null;

  const bgR = sr / light;
  const bgG = sg / light;
  const bgB = sb / light;

  const dist = (i: number) =>
    Math.max(Math.abs(d[i] - bgR), Math.abs(d[i + 1] - bgG), Math.abs(d[i + 2] - bgB));

  // 2) Flood-fill a partir das bordas
  const visited = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;
  const push = (p: number) => {
    if (visited[p]) return;
    const i = p * 4;
    if (d[i + 3] < 24 || dist(i) <= TOL_SOFT) {
      visited[p] = 1;
      stack[sp++] = p;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (sp > 0) {
    const p = stack[--sp];
    const i = p * 4;
    // só continua expandindo a partir de pixels "duros" (fundo de verdade)
    if (d[i + 3] >= 24 && dist(i) > TOL_HARD + 6) continue;
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }

  // 3) Aplica transparência com borda suave e remove o "halo" branco
  for (let p = 0; p < w * h; p++) {
    if (!visited[p]) continue;
    const i = p * 4;
    const dd = dist(i);
    if (dd <= TOL_HARD) {
      d[i + 3] = 0;
      continue;
    }
    const a = Math.min(1, (dd - TOL_HARD) / (TOL_SOFT - TOL_HARD));
    // descontamina a cor (remove a mistura com o fundo branco)
    d[i] = Math.max(0, Math.min(255, (d[i] - bgR * (1 - a)) / a));
    d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bgG * (1 - a)) / a));
    d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bgB * (1 - a)) / a));
    d[i + 3] = Math.round(d[i + 3] * a);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function getCutout(src: string): Promise<string | null> {
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
  const [state, setState] = useState<{ src: string; url: string | null; done: boolean }>(() => ({
    src,
    url: cache.get(src) ?? null,
    done: cache.has(src),
  }));

  useEffect(() => {
    let alive = true;
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
