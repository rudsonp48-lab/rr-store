import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h === '0.0.0.0' ||
    h.startsWith('[')
  );
}

/**
 * Proxy de imagens de produto (mesma origem) para permitir o recorte do fundo
 * branco via <canvas> no navegador, sem bloqueio de CORS dos CDNs externos.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) return new Response('missing url', { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response('invalid url', { status: 400 });
  }
  if (!['http:', 'https:'].includes(target.protocol) || isBlockedHost(target.hostname)) {
    return new Response('forbidden', { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (RR Store Image Proxy)', Accept: 'image/*' },
      redirect: 'follow',
    });
    if (!upstream.ok) return new Response('upstream error', { status: 502 });

    const type = upstream.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return new Response('not an image', { status: 415 });

    const buf = await upstream.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return new Response('too large', { status: 413 });

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response('fetch failed', { status: 502 });
  }
}
