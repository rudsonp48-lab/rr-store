#!/usr/bin/env node
/**
 * Robô de Sincronização Diária - RR Store Brasília
 * Fontes Concorrentes / Fornecedores:
 * 1. Sousa Games & Tecnologia (Kyte): https://sousagamestecnologia.kyte.site/pt-BR
 * 2. GSM Digital Acessórios (WooCommerce): https://gsmdigitalacessorios.com.br/
 *
 * Executa:
 * - Varredura completa de produtos e preços em ambas as fontes
 * - Detecção de produtos novos
 * - Detecção de alterações de preço
 * - Atualização dos arquivos locais data/sousa-live.json e data/gsm-live.json
 * - Geração de relatório data/last-sync-report.json
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const SOUSA_OUT = path.join(DATA_DIR, 'sousa-live.json');
const GSM_OUT = path.join(DATA_DIR, 'gsm-live.json');
const REPORT_OUT = path.join(DATA_DIR, 'last-sync-report.json');

const SOUSA_BASE = 'https://sousagamestecnologia.kyte.site';
const GSM_BASE = 'https://gsmdigitalacessorios.com.br/wp-json/wc/store/v1/products';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const CHROME = CHROME_CANDIDATES.find((p) => p && fs.existsSync(p));

console.log('====================================================');
console.log('🔄 INICIANDO SINCRONIZAÇÃO DIÁRIA RR STORE');
console.log(`⏰ Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (Horário de Brasília)`);
console.log('====================================================\n');

// ----------------------------------------------------
// 1. SINCRONIZAR SOUSA GAMES & TECNOLOGIA (KYTE)
// ----------------------------------------------------
function dumpChrome(url, budget = 25000) {
  if (!CHROME) {
    throw new Error('Chrome/Chromium não encontrado no sistema.');
  }
  return execFileSync(
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
}

const decodeHtml = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

function parsePrice(txt) {
  const m = decodeHtml(txt).replace(/[^\d,.]/g, '');
  if (!m) return 0;
  return Number(m.replace(/\./g, '').replace(',', '.')) || 0;
}

function parseSousaCards(html) {
  const items = [];
  const parts = html.split(/(?=href="\/pt-BR\/p\/)/).slice(1);
  for (const part of parts) {
    const link = part.match(/^href="(\/pt-BR\/p\/[^"]+)"/);
    const name = part.match(/data-testid="name-product-home"[^>]*>([^<]*)</);
    const price = part.match(/data-testid="price-product-home"[^>]*>([^<]*)</);
    const img = part.match(/<img[^>]*alt="(?!blur-)[^"]*"[^>]*src="([^"]+)"/);
    if (!name || !price) continue;
    items.push({
      link: link ? link[1] : '',
      nome: decodeHtml(name[1]).replace(/\s+/g, ' '),
      preco: parsePrice(price[1]),
      imagem: img ? decodeHtml(img[1]).replace('thumb_280_', '') : '',
      esgotado: /esgotado|sem estoque/i.test(part.slice(0, 2500)),
    });
  }
  return items;
}

async function syncSousa() {
  console.log('📦 1/2: Consultando Sousa Games & Tecnologia (kyte.site)...');
  let prevProducts = [];
  try {
    if (fs.existsSync(SOUSA_OUT)) {
      const prevData = JSON.parse(fs.readFileSync(SOUSA_OUT, 'utf8'));
      prevProducts = prevData.products || [];
    }
  } catch {}

  const prevMap = new Map(prevProducts.map((p) => [p.id || p.link || p.nome, p]));

  let home = '';
  try {
    home = dumpChrome(`${SOUSA_BASE}/pt-BR`);
  } catch (err) {
    console.warn('⚠️ Falha ao abrir home da Sousa:', err.message);
    return {
      status: 'error',
      error: err.message,
      total: prevProducts.length,
      newItems: [],
      priceChanges: [],
      products: prevProducts,
    };
  }

  const cats = [
    ...new Map(
      [...home.matchAll(/href="(\/pt-BR\/c\/([^/]+)\/[^"]+)"/g)].map((m) => [m[1], m[2]])
    ).entries(),
  ].map(([href, slug]) => ({ href, slug }));

  console.log(`   Categorias encontradas na Sousa: ${cats.length}`);
  const byId = new Map();

  for (const cat of cats) {
    try {
      const html = dumpChrome(`${SOUSA_BASE}${cat.href}`, 30000);
      const cards = parseSousaCards(html);
      for (const c of cards) {
        const idMatch = c.link.match(/\/([^/]+)$/);
        const key = idMatch ? idMatch[1] : c.nome;
        if (!byId.has(key)) {
          byId.set(key, { ...c, id: `sousa-${key}`, categoriaSousa: cat.slug });
        }
      }
    } catch (err) {
      console.warn(`   ⚠️ Erro na categoria ${cat.slug}: ${err.message}`);
    }
  }

  const currentProducts = [...byId.values()].filter((p) => p.preco > 0 && !p.esgotado);
  console.log(`   Total de produtos lidos da Sousa: ${currentProducts.length}`);

  if (currentProducts.length < 10) {
    console.warn('   ⚠️ Poucos produtos retornados. Mantendo arquivo anterior.');
    return {
      status: 'preserved',
      total: prevProducts.length,
      newItems: [],
      priceChanges: [],
      products: prevProducts,
    };
  }

  const newItems = [];
  const priceChanges = [];

  for (const curr of currentProducts) {
    const prev = prevMap.get(curr.id) || prevMap.get(curr.link) || prevMap.get(curr.nome);
    if (!prev) {
      newItems.push({ id: curr.id, nome: curr.nome, preco: curr.preco });
    } else if (Math.abs(prev.preco - curr.preco) >= 1) {
      priceChanges.push({
        id: curr.id,
        nome: curr.nome,
        precoAnterior: prev.preco,
        precoNovo: curr.preco,
        diferenca: Number((curr.preco - prev.preco).toFixed(2)),
      });
    }
  }

  fs.writeFileSync(
    SOUSA_OUT,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        source: SOUSA_BASE,
        count: currentProducts.length,
        products: currentProducts,
      },
      null,
      2
    )
  );

  console.log(`   ✅ Sousa atualizada: ${currentProducts.length} produtos.`);
  console.log(`   🆕 Novos: ${newItems.length} | 🏷️ Preços alterados: ${priceChanges.length}\n`);

  return {
    status: 'ok',
    total: currentProducts.length,
    newItems,
    priceChanges,
    products: currentProducts,
  };
}

// ----------------------------------------------------
// 2. SINCRONIZAR GSM DIGITAL ACESSÓRIOS (WOOCOMMERCE)
// ----------------------------------------------------
async function fetchGsmPage(page) {
  const url = `${GSM_BASE}?per_page=100&page=${page}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': UA,
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return { products: [], totalPages: 1 };
  const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
  const json = await res.json();
  return { products: Array.isArray(json) ? json : [], totalPages };
}

async function syncGsm() {
  console.log('📦 2/2: Consultando GSM Digital Acessórios (gsmdigitalacessorios.com.br)...');
  let prevProducts = [];
  try {
    if (fs.existsSync(GSM_OUT)) {
      const prevData = JSON.parse(fs.readFileSync(GSM_OUT, 'utf8'));
      prevProducts = prevData.products || [];
    }
  } catch {}

  const prevMap = new Map(prevProducts.map((p) => [String(p.id), p]));

  let allRaw = [];
  let totalPages = 1;

  try {
    const first = await fetchGsmPage(1);
    allRaw.push(...first.products);
    totalPages = Math.min(first.totalPages, 12); // Puxa até 12 páginas (1.200 produtos principais)

    console.log(`   Páginas disponíveis na GSM: ${first.totalPages} (Lendo as primeiras ${totalPages})...`);

    for (let page = 2; page <= totalPages; page++) {
      try {
        const next = await fetchGsmPage(page);
        allRaw.push(...next.products);
      } catch (err) {
        console.warn(`   ⚠️ Erro na página ${page} da GSM: ${err.message}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Falha ao consultar GSM Digital:', err.message);
    return {
      status: 'error',
      error: err.message,
      total: prevProducts.length,
      newItems: [],
      priceChanges: [],
      products: prevProducts,
    };
  }

  const validProducts = [];
  const newItems = [];
  const priceChanges = [];

  for (const it of allRaw) {
    const rawCost = Number(it.prices?.price || 0) / 100;
    const img = it.images?.[0]?.src || '';
    if (rawCost <= 0 || !img || it.is_in_stock === false) continue;

    const itemObj = {
      id: `gsm-${it.id}`,
      originalId: it.id,
      nome: (it.name || '').replace(/\s+/g, ' ').trim(),
      sku: (it.sku || '').trim(),
      precoCusto: rawCost,
      imagem: img.replace(/^http:\/\//i, 'https://'),
      categorias: (it.categories || []).map((c) => c.name || ''),
      estoqueTexto: it.stock_availability?.text || '',
    };

    validProducts.push(itemObj);

    const prev = prevMap.get(itemObj.id);
    if (!prev) {
      newItems.push({ id: itemObj.id, nome: itemObj.nome, precoCusto: itemObj.precoCusto });
    } else if (Math.abs(prev.precoCusto - itemObj.precoCusto) >= 0.5) {
      priceChanges.push({
        id: itemObj.id,
        nome: itemObj.nome,
        precoAnterior: prev.precoCusto,
        precoNovo: itemObj.precoCusto,
        diferenca: Number((itemObj.precoCusto - prev.precoCusto).toFixed(2)),
      });
    }
  }

  fs.writeFileSync(
    GSM_OUT,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        source: GSM_BASE,
        count: validProducts.length,
        products: validProducts,
      },
      null,
      2
    )
  );

  console.log(`   ✅ GSM Digital atualizada: ${validProducts.length} produtos em estoque.`);
  console.log(`   🆕 Novos: ${newItems.length} | 🏷️ Preços alterados: ${priceChanges.length}\n`);

  return {
    status: 'ok',
    total: validProducts.length,
    newItems,
    priceChanges,
    products: validProducts,
  };
}

// ----------------------------------------------------
// EXECUÇÃO PRINCIPAL
// ----------------------------------------------------
async function main() {
  const sousaResult = await syncSousa();
  const gsmResult = await syncGsm();

  const report = {
    executedAt: new Date().toISOString(),
    brasiliaTime: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    summary: {
      sousaTotal: sousaResult.total,
      sousaNovos: sousaResult.newItems.length,
      sousaPrecosAlterados: sousaResult.priceChanges.length,
      gsmTotal: gsmResult.total,
      gsmNovos: gsmResult.newItems.length,
      gsmPrecosAlterados: gsmResult.priceChanges.length,
      totalGeralSincronizado: sousaResult.total + gsmResult.total,
    },
    alteracoesDetectadas: {
      sousa: {
        novos: sousaResult.newItems.slice(0, 30),
        precosAlterados: sousaResult.priceChanges.slice(0, 30),
      },
      gsm: {
        novos: gsmResult.newItems.slice(0, 30),
        precosAlterados: gsmResult.priceChanges.slice(0, 30),
      },
    },
  };

  fs.writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2));

  console.log('====================================================');
  console.log('📊 RESUMO DA SINCRONIZAÇÃO:');
  console.log(`   • Sousa Games (Kyte): ${report.summary.sousaTotal} produtos (${report.summary.sousaNovos} novos, ${report.summary.sousaPrecosAlterados} preços alterados)`);
  console.log(`   • GSM Digital: ${report.summary.gsmTotal} produtos (${report.summary.gsmNovos} novos, ${report.summary.gsmPrecosAlterados} preços alterados)`);
  console.log(`   • Total Geral Ativo: ${report.summary.totalGeralSincronizado} produtos no catálogo`);
  console.log('====================================================');
  console.log('✨ Relatório salvo em: data/last-sync-report.json');
}

main().catch((err) => {
  console.error('❌ Erro fatal na sincronização:', err);
  process.exit(1);
});
