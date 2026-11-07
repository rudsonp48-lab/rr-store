import { NextResponse } from 'next/server';
import sousaLiveData from '../../../data/sousa-live.json';
import gsmLiveData from '../../../data/gsm-live.json';
import { CategoryId, Product } from '../../../types/store';
import { applySupplierMarkup, calculatePixPrice, formatInstallment } from '../../../data/mockData';

interface WooCategory {
  id: number;
  name: string;
  slug: string;
}

interface WooImage {
  id: number;
  src: string;
}

interface WooProduct {
  id: number;
  name: string;
  sku?: string;
  is_in_stock?: boolean;
  prices?: {
    price?: string;
  };
  images?: WooImage[];
  categories?: WooCategory[];
  stock_availability?: {
    text?: string;
  };
}

const KNOWN_BRANDS = new Set([
  'KIMASTER',
  'FAM',
  'BMAX',
  'PEINING',
  'LEHMOX',
  'SUMEXR',
  'KNUP',
  'KINGO',
  'KAPBOM',
  '1HORA',
  'STARMEGA',
  'LECOVER',
  'B-TEK',
  'IMENSO',
  'MAXPRINT',
  'CIS',
  'BAZZE',
  'BOMVINK',
]);

const TAGS: Product['tag'][] = [
  'Mais Vendido',
  'Entrega Hoje DF',
  'Novidade',
  'Oferta Flash',
  'Favorito no DF',
];

function mapCategory(name: string, cats: string[]): Exclude<CategoryId, 'Todos'> {
  const joined = `${name} ${cats.join(' ')}`.toUpperCase();
  if (
    ['PAPELARIA', 'CANETA', 'CADERNO', 'MARCA', 'CIS', 'MAXPRINT', 'BAZZE', 'CALCULADORA'].some(
      (k) => joined.includes(k)
    )
  ) {
    return 'Papelaria Criativa & Concursos';
  }
  if (
    [
      'ILUMINA',
      'LANTERNA',
      'LAMPADA',
      'LÂMPADA',
      'RING LIGHT',
      'LED',
      'CAMERA',
      'CÂMERA',
      'PROJETOR',
      'REPETIDOR',
      'UMIDIFICADOR',
      'SOLAR',
    ].some((k) => joined.includes(k))
  ) {
    return 'Smart Home & Iluminação';
  }
  if (
    ['DEPILADOR', 'APARADOR', 'BARBEADOR', 'MASSAGEADOR', 'NECESSAIRE', 'ESCOVA', 'SECADOR'].some(
      (k) => joined.includes(k)
    )
  ) {
    return 'Skincare & Autocuidado';
  }
  if (
    ['GARRAFA', 'COPO TERMICO', 'COPO TÉRMICO', 'BOLA', 'BICICLETA', 'SCOOTER', 'MOTO'].some((k) =>
      joined.includes(k)
    )
  ) {
    return 'Moda Fitness & Athleisure';
  }
  if (['INFANTIL', 'BRINQUEDO', 'BONECA', 'CARRINHO'].some((k) => joined.includes(k))) {
    return 'Moda Infantil & Enxoval';
  }
  if (['PET', 'CÃES', 'GATOS'].some((k) => joined.includes(k))) {
    return 'Pet Shop';
  }
  if (['SMARTWATCH', 'RELOGIO', 'RELÓGIO', 'SUPORTE', 'PULSEIRA'].some((k) => joined.includes(k))) {
    return 'Acessórios & Semijoias';
  }
  if (
    [
      'CASA',
      'COZINHA',
      'CHURRASQUEIRA',
      'BOMBA',
      'ARVORE',
      'ÁRVORE',
      'NATAL',
      'FACA',
      'FERRAMENTA',
      'FIXADOR',
      'EMBARALHADOR',
      'UTENSILIO',
      'UTENSÍLIO',
    ].some((k) => joined.includes(k))
  ) {
    return 'Casa & Organização';
  }
  return 'Eletrônicos & Smartphones';
}

export const maxDuration = 60;
export const revalidate = 300;

// Cache em memória para resposta instantânea (< 5ms)
let memoryCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutos

const GSM_BASE = 'https://gsmdigitalacessorios.com.br/wp-json/wc/store/v1/products';

/** Lê páginas essenciais do catálogo da GSM com timeout rápido para não travar a vitrine. */
async function fetchAllGsm(): Promise<WooProduct[]> {
  const headers = { Accept: 'application/json', 'User-Agent': 'RRStore-Brasilia-Sync/1.0' };
  try {
    const first = await fetch(`${GSM_BASE}?per_page=100&page=1`, {
      next: { revalidate: 300 },
      headers,
      signal: AbortSignal.timeout(6000),
    });
    if (!first.ok) return [];
    const totalPages = Math.min(Number(first.headers.get('x-wp-totalpages') || 1), 6);
    const all: WooProduct[] = [...((await first.json()) as WooProduct[])];

    const rest = Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i + 2);
    const CONCURRENCY = 3;
    for (let i = 0; i < rest.length; i += CONCURRENCY) {
      const chunk = rest.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        chunk.map((page) =>
          fetch(`${GSM_BASE}?per_page=100&page=${page}`, {
            next: { revalidate: 300 },
            headers,
            signal: AbortSignal.timeout(4000),
          })
            .then((r) => (r.ok ? (r.json() as Promise<WooProduct[]>) : []))
            .catch(() => [] as WooProduct[])
        )
      );
      results.forEach((r) => all.push(...r));
    }
    return all;
  } catch {
    return [];
  }
}

interface SousaLiveItem {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  categoriaSousa: string;
}

/** Catálogo da Sousa (Kyte) lido pelo robô `scripts/sync-sousa.mjs` -> data/sousa-live.json */
async function loadSousaLive(): Promise<Product[]> {
  try {
    const raw = sousaLiveData as unknown as { products: SousaLiveItem[] };
    return (raw.products || []).map((it, idx) => {
      const nome = it.nome.replace(/\s+/g, ' ').trim();
      const { precoPor, precoDe } = applySupplierMarkup(it.preco);
      const maxParcelasSemJuros = precoPor >= 200 ? 12 : precoPor >= 80 ? 6 : 3;
      return {
        id: it.id,
        nome,
        categoria: mapCategory(nome, [it.categoriaSousa]),
        precoCusto: Number(it.preco.toFixed(2)),
        precoDe,
        precoPor,
        precoPix: calculatePixPrice(precoPor),
        parcelamento: formatInstallment(precoPor, maxParcelasSemJuros),
        maxParcelasSemJuros,
        avaliacao: idx % 2 === 0 ? 4.9 : 5.0,
        avaliacoesCount: 18 + ((idx * 9) % 64),
        tag: TAGS[idx % TAGS.length],
        imagem: it.imagem,
        descricao: `${nome} — produto Sousa Games & Tecnologia disponível em Brasília-DF com entrega rápida via Motoboy Express.`,
        estoque: 10,
      } satisfies Product;
    });
  } catch {
    return [];
  }
}

interface GsmLiveItem {
  id: string;
  originalId: number;
  nome: string;
  sku: string;
  precoCusto: number;
  imagem: string;
  categorias: string[];
  estoqueTexto?: string;
}

/** Lê o catálogo pré-sincronizado da GSM Digital (`data/gsm-live.json`) com resposta instantânea em ~0ms */
function loadGsmLive(): Product[] {
  try {
    const raw = gsmLiveData as unknown as { products: GsmLiveItem[] };
    if (!raw.products || raw.products.length === 0) return [];

    return raw.products.map((it, idx) => {
      const cleanName = it.nome.replace(/\s+/g, ' ').trim();
      const catNames = it.categorias || [];
      const categoria = mapCategory(cleanName, catNames);
      const { precoPor, precoDe } = applySupplierMarkup(it.precoCusto);
      const precoPix = calculatePixPrice(precoPor);
      const maxParcelasSemJuros = precoPor >= 200 ? 12 : precoPor >= 80 ? 6 : 3;
      const parcelamento = formatInstallment(precoPor, maxParcelasSemJuros);

      const stockMatch = (it.estoqueTexto || '').match(/(\d+)/);
      const estoque = stockMatch ? Math.max(1, Math.min(Number(stockMatch[1]), 200)) : 25;
      const sku = (it.sku || '').trim();
      const brand = catNames.find((c) => KNOWN_BRANDS.has(c.toUpperCase())) || 'GSM Digital';

      return {
        id: it.id,
        nome: cleanName,
        categoria,
        precoCusto: Number(it.precoCusto.toFixed(2)),
        precoDe,
        precoPor,
        precoPix,
        parcelamento,
        maxParcelasSemJuros,
        avaliacao: idx % 2 === 0 ? 4.9 : 5.0,
        avaliacoesCount: 24 + ((idx * 7) % 180),
        tag: TAGS[idx % TAGS.length],
        imagem: it.imagem,
        descricao: `Produto ${brand}${sku ? ` (Ref: ${sku})` : ''} sincronizado com a GSM Digital Brasília-DF.`,
        estoque,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(memoryCache.data);
  }

  try {
    // 1. Tenta carregar do cache local pré-sincronizado (0ms)
    let syncedProducts = loadGsmLive();

    // 2. Fallback sob demanda se o arquivo ainda estiver vazio
    if (syncedProducts.length === 0) {
      const rawItems = await fetchAllGsm();
      const seen = new Set<string>();

      rawItems.forEach((it, idx) => {
        const pid = `gsm-${it.id}`;
        if (seen.has(pid)) return;

        const src = (it.images?.[0]?.src || '').replace(/^http:\/\//i, 'https://');
        const rawCost = Number(it.prices?.price || 0) / 100;

        if (!src || rawCost <= 0 || it.is_in_stock === false) return;
        seen.add(pid);

        const cleanName = (it.name || '').replace(/\s+/g, ' ').trim();
        const catNames = (it.categories || []).map((c) => c.name || '');
        const categoria = mapCategory(cleanName, catNames);
        const { precoPor, precoDe } = applySupplierMarkup(rawCost);
        const precoPix = calculatePixPrice(precoPor);
        const maxParcelasSemJuros = precoPor >= 200 ? 12 : precoPor >= 80 ? 6 : 3;
        const parcelamento = formatInstallment(precoPor, maxParcelasSemJuros);

        const stockMatch = (it.stock_availability?.text || '').match(/(\d+)/);
        const estoque = stockMatch ? Math.max(1, Math.min(Number(stockMatch[1]), 200)) : 25;
        const sku = (it.sku || '').trim();
        const brand = catNames.find((c) => KNOWN_BRANDS.has(c.toUpperCase())) || 'GSM Digital';

        syncedProducts.push({
          id: pid,
          nome: cleanName,
          categoria,
          precoCusto: Number(rawCost.toFixed(2)),
          precoDe,
          precoPor,
          precoPix,
          parcelamento,
          maxParcelasSemJuros,
          avaliacao: idx % 2 === 0 ? 4.9 : 5.0,
          avaliacoesCount: 24 + ((idx * 7) % 180),
          tag: TAGS[idx % TAGS.length],
          imagem: src,
          descricao: `Produto ${brand}${sku ? ` (Ref: ${sku})` : ''} sincronizado em tempo real com o estoque do fornecedor em Brasília-DF.`,
          estoque,
        });
      });
    }

    const sousa = await loadSousaLive();
    const all = [...syncedProducts, ...sousa];

    const payload = {
      ok: true,
      syncedAt: new Date().toISOString(),
      count: all.length,
      gsm: syncedProducts.length,
      sousa: sousa.length,
      products: all,
    };
    memoryCache = { data: payload, timestamp: Date.now() };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Erro ao sincronizar com fornecedor',
        products: [],
      },
      { status: 200 }
    );
  }
}
