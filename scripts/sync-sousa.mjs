#!/usr/bin/env node
/**
 * Sincroniza o catálogo da Sousa Games & Tecnologia (Kyte) -> data/sousa-live.json
 *
 * O site da Kyte fica atrás da proteção da Cloudflare, então usamos o Chrome em modo headless
 * (o mesmo que roda no GitHub Actions) para renderizar cada categoria e ler produtos e preços.
 *
 * Uso:  node scripts/sync-sousa.mjs
 * Env:  CHROME_BIN (opcional) caminho do Chrome/Chromium
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'sousa-live.json');
const BASE = 'https://sousagamestecnologia.kyte.site';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error('Chrome não encontrado. Defina CHROME_BIN.');
  process.exit(1);
}

function dump(url, budget = 25000) {
  const out = execFileSync(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--log-level=3',
      `--virtual-time-budget=${budget}`,
      `--user-agent=${UA}`,
      '--dump-dom',
      url,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
  );
  return out;
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

function parsePrice(txt) {
  const m = decode(txt).replace(/[^\d,.]/g, '');
  if (!m) return 0;
  return Number(m.replace(/\./g, '').replace(',', '.')) || 0;
}

function parseCards(html) {
  const items = [];
  // cada card de produto é um <a href="/pt-BR/p/<slug>/<id>">...</a>
  const parts = html.split(/(?=href="\/pt-BR\/p\/)/).slice(1);
  for (const part of parts) {
    const link = part.match(/^href="(\/pt-BR\/p\/[^"]+)"/);
    const name = part.match(/data-testid="name-product-home"[^>]*>([^<]*)</);
    const price = part.match(/data-testid="price-product-home"[^>]*>([^<]*)</);
    const img = part.match(/<img[^>]*alt="(?!blur-)[^"]*"[^>]*src="([^"]+)"/);
    if (!name || !price) continue;
    items.push({
      link: link ? link[1] : '',
      nome: decode(name[1]).replace(/\s+/g, ' '),
      preco: parsePrice(price[1]),
      imagem: img ? decode(img[1]).replace('thumb_280_', '') : '',
      esgotado: /esgotado|sem estoque/i.test(part.slice(0, 2500)),
    });
  }
  return items;
}

const home = dump(`${BASE}/pt-BR`);
const cats = [
  ...new Map(
    [...home.matchAll(/href="(\/pt-BR\/c\/([^/]+)\/[^"]+)"/g)].map((m) => [m[1], m[2]])
  ).entries(),
].map(([href, slug]) => ({ href, slug }));

console.log(`Categorias encontradas: ${cats.length}`);
const byId = new Map();
for (const cat of cats) {
  let html = '';
  try {
    html = dump(`${BASE}${cat.href}`, 30000);
  } catch (e) {
    console.warn(`Falha na categoria ${cat.slug}:`, e.message);
    continue;
  }
  const cards = parseCards(html);
  console.log(` - ${cat.slug}: ${cards.length} produtos`);
  for (const c of cards) {
    const idMatch = c.link.match(/\/([^/]+)$/);
    const key = idMatch ? idMatch[1] : c.nome;
    if (!byId.has(key)) byId.set(key, { ...c, id: `sousa-${key}`, categoriaSousa: cat.slug });
  }
}

const products = [...byId.values()].filter((p) => p.preco > 0 && !p.esgotado);
if (products.length < 10) {
  console.error('Poucos produtos lidos; mantendo arquivo anterior para não apagar a loja.');
  process.exit(2);
}
try {
  const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  if (JSON.stringify(prev.products) === JSON.stringify(products)) {
    console.log('Sem mudanças no catálogo da Sousa.');
    process.exit(0);
  }
} catch {
  // primeiro sync
}
fs.writeFileSync(
  OUT,
  JSON.stringify({ syncedAt: new Date().toISOString(), count: products.length, products }, null, 2)
);
console.log(`OK: ${products.length} produtos gravados em data/sousa-live.json`);
