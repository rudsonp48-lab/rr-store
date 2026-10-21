'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  ArrowRight,
  ArrowUpRight,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Sparkles,
  Settings,
  MapPin,
  Eye,
} from 'lucide-react';
import { DFRegion, HeroBanner, Product } from '../types/store';
import { formatBRL, PRODUCTS } from '../data/mockData';
import CutoutImage, { prefetchCutouts } from './CutoutImage';

interface HeroSectionProps {
  selectedRegion: DFRegion;
  onExploreClick: () => void;
  onAddToCart?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  products?: Product[];
  /** Banners publicados pelo painel externo (rr-store-admin). Vazio = usa os produtos em destaque. */
  banners?: HeroBanner[];
}

interface HeroSlide {
  key: string;
  imagem: string;
  titulo?: string;
  product?: Product;
}

const CURATED_FLAGSHIP_IDS = [
  'rr-apple-ip18pm-256-bordo',
  'rr-apple-ip17pm-512-silver',
  'rr-apple-ip17pm-256-laranja',
  'rr-apple-watch-s12-42-dourado-bordo',
  'rr-apple-watch-ultra3-49-black',
  'rr-apple-macbook-air-m5-512-midnight',
  'rr-apple-macbook-neo-256-citrus',
  'rr-apple-ipadpro-m5-13-256-preto',
  'rr-apple-airpods-max2-azul',
  'rr-apple-airpods-pro-3',
];

/**
 * Divide o nome do produto/banner em 3 linhas monumentais em caixa alta
 * no estilo editorial "DESIGN / YOUR OWN / COGNITION" da referência.
 */
function buildMonumentalHeadline(rawTitle: string): [string, string, string] {
  const clean = rawTitle
    .replace(/\(Americano\s*🇺🇸\)/gi, '')
    .replace(/\(Zerou no Estoque\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  if (clean.includes('IPHONE')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'PRO SERIES';
    if (clean.includes('PRO MAX')) {
      const modelMatch = clean.match(/IPHONE\s+\d+/);
      const storageMatch = clean.match(/\d+GB/);
      return [
        modelMatch ? modelMatch[0] : 'IPHONE PRO',
        `PRO MAX ${storageMatch ? storageMatch[0] : ''}`.trim(),
        color,
      ];
    }
    const modelMatch = clean.match(/IPHONE\s+\d+\s*PRO?/);
    const storageMatch = clean.match(/\d+GB/);
    return [
      modelMatch ? modelMatch[0] : 'IPHONE',
      storageMatch ? `${storageMatch[0]} AMERICANO` : 'APPLE OFICIAL',
      color,
    ];
  }

  if (clean.includes('APPLE WATCH')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'EDITION';
    const series = clean.replace('APPLE WATCH', '').split(' - ')[0].trim();
    return ['APPLE WATCH', series || 'SERIES PRO', color];
  }

  if (clean.includes('MACBOOK')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'APPLE SILICON';
    if (clean.includes('MACBOOK AIR')) {
      return ['MACBOOK AIR', 'CHIP M5 16GB', color];
    }
    return ['MACBOOK NEO', 'CHIP A18 PRO', color];
  }

  if (clean.includes('IPAD')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'WI-FI';
    if (clean.includes('IPAD PRO')) {
      return ['IPAD PRO M5', clean.includes('13"') ? 'TELA 13" OLED' : 'TELA 11" OLED', color];
    }
    if (clean.includes('IPAD AIR')) {
      return ['IPAD AIR M4', 'WI-FI OFICIAL', color];
    }
    return ['APPLE IPAD', '11ª GERAÇÃO', color];
  }

  if (clean.includes('AIRPODS')) {
    if (clean.includes('MAX')) {
      const parts = clean.split(' - ');
      return ['AIRPODS MAX', 'CHIP H2 USB-C', parts[1] || 'OVER-EAR'];
    }
    if (clean.includes('PRO 3')) {
      return ['AIRPODS PRO', '3ª GERAÇÃO', 'MAGSAFE USB-C'];
    }
    return ['APPLE AIRPODS', clean.includes('5') ? '5ª GERAÇÃO' : '4ª GERAÇÃO', 'ÁUDIO ESPACIAL'];
  }

  const words = clean.split(' ').filter(Boolean);
  if (words.length <= 3) {
    return [words[0] || 'DESTAQUE', words[1] || 'OFICIAL', words[2] || 'RR MOBILE'];
  }
  const third = Math.ceil(words.length / 3);
  return [
    words.slice(0, third).join(' '),
    words.slice(third, third * 2).join(' '),
    words.slice(third * 2, third * 3).join(' '),
  ];
}

export default function HeroSection({
  selectedRegion,
  onExploreClick,
  onAddToCart,
  onSelectProduct,
  products = PRODUCTS,
  banners = [],
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState<'in' | 'out'>('in');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // Slides: banners ativos do painel ou seleção curada de flagships
  const slides = useMemo<HeroSlide[]>(() => {
    const source = products.length > 0 ? products : PRODUCTS;
    const activeBanners = banners.filter((b) => b.ativo && b.imagem);
    if (activeBanners.length > 0) {
      return activeBanners.map((b) => ({
        key: b.id,
        imagem: b.imagem,
        titulo: b.titulo,
        product: b.produtoId ? source.find((p) => p.id === b.produtoId) : undefined,
      }));
    }

    const curated: Product[] = [];
    for (const id of CURATED_FLAGSHIP_IDS) {
      const found = source.find((p) => p.id === id && p.estoque > 0);
      if (found) curated.push(found);
    }
    if (curated.length < 8) {
      for (const p of source) {
        if (curated.length >= 10) break;
        if (!curated.some((c) => c.id === p.id) && p.estoque > 0) {
          curated.push(p);
        }
      }
    }

    return curated.slice(0, 10).map((p) => ({
      key: p.id,
      imagem: p.imagem,
      product: p,
    }));
  }, [products, banners]);

  const safeIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const currentSlide = slides[safeIndex];
  const currentProduct = currentSlide?.product;

  const triggerSlideChange = (nextIndex: number) => {
    setAnimPhase('out');
    setTimeout(() => {
      setActiveIndex(nextIndex);
      setAnimPhase('in');
    }, 180);
  };

  // Auto-play fluido a cada 4.5 segundos
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setAnimPhase('out');
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
        setAnimPhase('in');
      }, 180);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Efeito Action suave no Scroll (sem balão flutuante)
  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setScrollProgress(Math.min(1, Math.max(0, y / 520)));
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Pré-recorta o fundo das imagens de todos os slides (troca instantânea)
  useEffect(() => {
    const t = setTimeout(() => prefetchCutouts(slides.map((s) => s.imagem)), 600);
    return () => clearTimeout(t);
  }, [slides]);

  if (!currentSlide) return null;

  const discountPercent = currentProduct
    ? Math.max(
        5,
        Math.round(
          ((currentProduct.precoDe - currentProduct.precoPix) / currentProduct.precoDe) * 100
        )
      )
    : 18;

  const savingsAmount = currentProduct
    ? Math.max(0, currentProduct.precoDe - currentProduct.precoPix)
    : 0;

  const headlineLines = buildMonumentalHeadline(
    currentSlide.titulo || currentProduct?.nome || 'RR MOBILE JOIAS APPLE'
  );

  const cleanDescription = currentProduct
    ? currentProduct.descricao.split(' | Pagamento:')[0]
    : 'Produtos originais selecionados com retirada na Feira dos Importados do SIA (Loja D439) ou entrega expressa via Motoboy em todo o Distrito Federal.';

  const handlePrev = () => {
    triggerSlideChange(safeIndex === 0 ? slides.length - 1 : safeIndex - 1);
  };

  const handleNext = () => {
    triggerSlideChange((safeIndex + 1) % slides.length);
  };

  const handleHeroAdd = (product: Product) => {
    onAddToCart?.(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1300);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: relX * 12, y: -relY * 12 });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative bg-[#050506] text-white overflow-hidden border-b border-white/[0.08]"
    >
      {/* AMBIENT GLOW CINEMATOGRÁFICO (Estilo Editorial da 2ª Foto: Âmbar/Fogo + Esmeralda Profundo) */}
      <div
        className="pointer-events-none absolute top-[-10%] left-[20%] w-[520px] h-[520px] rounded-full blur-[135px] opacity-65 transition-transform duration-300"
        style={{
          background:
            'radial-gradient(circle, rgba(249,115,22,0.42) 0%, rgba(234,88,12,0.18) 45%, transparent 75%)',
          transform: `translate3d(${mouseTilt.x * 1.6}px, ${scrollProgress * 35}px, 0) scale(${
            1 + scrollProgress * 0.15
          })`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-15%] right-[12%] w-[560px] h-[560px] rounded-full blur-[150px] opacity-50 transition-transform duration-300"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.28) 0%, rgba(217,119,6,0.14) 50%, transparent 75%)',
          transform: `translate3d(${-mouseTilt.x * 1.4}px, ${-scrollProgress * 25}px, 0)`,
        }}
      />

      {/* Partículas / Bolhas de Luz Líquida sutis ao redor do centro */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[18%] left-[38%] w-24 h-24 rounded-full border border-orange-400/25 bg-gradient-to-br from-orange-500/20 to-transparent blur-[1px]"
          style={{
            transform: `translate3d(${mouseTilt.x * -1.2}px, ${scrollProgress * -28}px, 0)`,
          }}
        />
        <div
          className="absolute bottom-[26%] left-[31%] w-16 h-16 rounded-full border border-amber-300/20 bg-gradient-to-tr from-amber-500/20 to-transparent"
          style={{
            transform: `translate3d(${mouseTilt.x * 1.1}px, ${scrollProgress * -18}px, 0)`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:py-8">
        {/* Sub-Header Editorial Discreto (Localização Loja Física SIA D439 + Região de Entrega + Navegação Rápida) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-zinc-200 font-bold bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Feira dos Importados do SIA — Loja D439</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-300">
              <Truck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>
                Entrega em <strong className="text-white">{selectedRegion.nome.split('(')[0].trim()}</strong>:{' '}
                {selectedRegion.tempoEstimado}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold hidden sm:inline">
              Destaque {safeIndex + 1}/{slides.length}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-8 h-8 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
              aria-label="Próximo banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STAGE PRINCIPAL NO LAYOUT EXATO DA 2ª FOTO (3 ZONAS: ESQUERDA EDITORIAL + CARDS, CENTRO VISUAL, DIREITA TIPOGRAFIA MONUMENTAL) */}
        <div
          className={`relative min-h-[540px] lg:min-h-[600px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-between transition-all duration-300 ${
            animPhase === 'in'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-[0.99]'
          }`}
        >
          {/* COLUNA ESQUERDA (5 Colunas): "SOURCE OF INNER LOGIC /" + Os 2 Cards Inferiores (Branco Sólido & Glassmorphism) */}
          <div className="lg:col-span-3 flex flex-col justify-between z-20 space-y-8 lg:space-y-0">
            {/* Bloco Superior Esquerdo */}
            <div className="space-y-4 max-w-xs">
              <div className="w-10 h-[1.5px] bg-white/40" />

              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-normal tracking-wide text-white uppercase leading-snug">
                  RR MOBILE &amp;
                  <br />
                  JOIAS APPLE{' '}
                  <span className="text-orange-500 font-light tracking-tighter">{'</'}</span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Onde a tecnologia original Apple encontra pronta-entrega imediata na{' '}
                <strong className="text-zinc-200">Feira dos Importados do SIA (Loja D439)</strong> e
                envio expresso em Brasília.
              </p>
            </div>

            {/* Bloco Inferior Esquerdo: Os 2 Cards (empilhados no desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-4">
              {/* CARD 1: Card Branco Sólido ("85% Flow state retention" -> Preço PIX & Desconto) */}
              <div
                onClick={() => currentProduct && onSelectProduct?.(currentProduct)}
                className="bg-[#F3F4F6] text-[#0A0A0A] rounded-[26px] p-5 flex flex-col justify-between min-h-[175px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-4 h-4 text-zinc-700" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    {currentProduct ? `PIX -${discountPercent}% OFF` : 'PRONTA ENTREGA'}
                  </span>
                </div>

                <div className="mt-6">
                  {currentProduct ? (
                    <>
                      <span className="text-[11px] text-zinc-500 line-through block mb-0.5">
                        De {formatBRL(currentProduct.precoDe)}
                      </span>
                      <p className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[#0A0A0A] leading-none">
                        {formatBRL(currentProduct.precoPix)}
                      </p>
                      <p className="text-[11px] font-medium text-zinc-600 mt-2">
                        À vista no PIX ou Dinheiro
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-semibold tracking-tight text-[#0A0A0A]">100%</p>
                      <p className="text-xs text-zinc-600 mt-1">Original Apple &amp; Garantia</p>
                    </>
                  )}
                </div>
              </div>

              {/* CARD 2: Card Dark Glassmorphism ("Reload your process" -> Ação Rápida & Parcelamento) */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/15 rounded-[26px] p-5 flex flex-col justify-between min-h-[175px] text-white hover:border-white/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-white leading-snug">
                      {currentProduct ? 'Garanta o seu' : 'Visite nossa loja'}
                      <br />
                      <span className="text-zinc-300">hoje mesmo</span>
                    </p>
                  </div>
                  <Settings className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5 animate-spin [animation-duration:14s]" />
                </div>

                <div className="space-y-3 mt-4">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {currentProduct
                      ? `${currentProduct.parcelamento}. Economia real de ${formatBRL(savingsAmount)} no PIX.`
                      : 'Atendimento especializado Apple e acessórios no SIA Loja D439.'}
                  </p>

                  {currentProduct ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleHeroAdd(currentProduct)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          addedId === currentProduct.id
                            ? 'bg-white text-black'
                            : 'bg-orange-500 hover:bg-orange-400 text-black shadow-lg shadow-orange-500/25'
                        }`}
                      >
                        {addedId === currentProduct.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Na Sacola</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Comprar</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectProduct?.(currentProduct)}
                        className="py-2 px-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
                        title="Ver Ficha Técnica e SEO"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onExploreClick}
                      className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Explorar Catálogo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CENTRO VISUAL — PRODUTO PROTAGONISTA (Proporção da referência, sem deformação) */}
          <div
            onClick={() => currentProduct && onSelectProduct?.(currentProduct)}
            className="order-first lg:order-none lg:col-span-6 relative flex items-center justify-center py-4 sm:py-6 lg:py-0 z-10 cursor-pointer group"
          >
            {/* Halo luminoso difuso atrás da moldura */}
            <div
              className="pointer-events-none absolute w-[360px] sm:w-[460px] lg:w-[500px] aspect-square rounded-full blur-[100px] opacity-75 transition-transform duration-500"
              style={{
                background:
                  'radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(16,185,129,0.18) 50%, transparent 72%)',
                transform: `scale(${1 + scrollProgress * 0.12})`,
              }}
            />

            {/* Moldura Dark Glass com cantos arredondados suaves idêntica à referência dos prints */}
            <div
              className="relative w-[310px] h-[310px] sm:w-[400px] sm:h-[400px] lg:w-[460px] lg:h-[460px] rounded-[48px] sm:rounded-[56px] border border-white/[0.12] bg-gradient-to-b from-white/[0.05] via-[#121214]/60 to-[#0A0A0C]/90 backdrop-blur-md p-6 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex items-center justify-center transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${mouseTilt.y * 0.4}deg) rotateY(${
                  mouseTilt.x * 0.4
                }deg) translateY(${scrollProgress * -16}px) scale(${1 + scrollProgress * 0.04})`,
              }}
            >
              {/* Sombra de chão sob o produto */}
              <div className="pointer-events-none absolute bottom-[10%] w-[60%] h-8 rounded-[50%] bg-black/80 blur-xl" />

              {/* Imagem do produto em proporção real perfeita (object-contain, sem corte e sem esticar) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <CutoutImage
                  key={currentSlide.imagem}
                  src={currentSlide.imagem}
                  alt={currentProduct?.nome || currentSlide.titulo || 'Destaque RR Store'}
                  className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-[1.03] transition-transform duration-500 ease-out drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
                />
              </div>

              {/* Badge de Avaliação fixada no topo da moldura */}
              {currentProduct && (
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-[#0A0A0A]/95 text-orange-400 border border-orange-500/50 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-20">
                  <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                  <span>{currentProduct.avaliacao.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Pill inferior de Ficha Técnica */}
            <span className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0A0A0A]/95 text-white border border-white/20 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-2xl z-20 transition-transform group-hover:scale-105">
              Clique para ver Ficha Técnica
            </span>
          </div>

          {/* COLUNA DIREITA (3 Colunas): Tipografia Monumental em 3 Linhas + Botão Circular c/ Seta Diagonal + Texto Editorial */}
          <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end text-left lg:text-right z-20 space-y-6 lg:space-y-0">
            <div className="hidden lg:block h-4" />

            {/* Tipografia Monumental empilhada + Círculo com Seta Diagonal (↗) */}
            <div className="relative w-full">
              <div
                onClick={() =>
                  currentProduct ? onSelectProduct?.(currentProduct) : onExploreClick()
                }
                className="cursor-pointer select-none space-y-0.5"
              >
                {headlineLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="text-4xl sm:text-5xl lg:text-[34px] xl:text-[42px] font-normal tracking-[-0.03em] leading-[0.98] text-zinc-100/95 uppercase break-words"
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Botão Redondo com Borda Fina e Seta Diagonal (Exatamente como na 2ª foto) */}
              <div className="mt-5 flex lg:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    currentProduct ? onSelectProduct?.(currentProduct) : onExploreClick()
                  }
                  aria-label="Abrir detalhes do produto em destaque"
                  className="group w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/35 hover:border-white bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl"
                >
                  <ArrowUpRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

            {/* Parágrafo Editorial Inferior Direito */}
            <div className="max-w-xs lg:ml-auto space-y-2">
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                {cleanDescription}
              </p>
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
              >
                <span>Ver todos os produtos da loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Seletor Horizontal de Destaques na Base do Banner */}
        <div className="mt-8 pt-5 border-t border-white/10 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {slides.map((item, idx) => {
            const isCurrent = idx === safeIndex;
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => triggerSlideChange(idx)}
                className={`group flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl border transition-all duration-200 shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-white/[0.1] border-orange-400/80 text-white scale-[1.02] shadow-lg'
                    : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/25 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={item.imagem}
                  alt={item.product?.nome || item.titulo || 'Banner'}
                  className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0"
                />
                <div className="text-left max-w-[135px]">
                  <p className="text-[11px] font-bold text-white truncate">
                    {item.titulo || item.product?.nome || 'Destaque'}
                  </p>
                  {item.product && (
                    <p className="text-[11px] font-black text-orange-400">
                      {formatBRL(item.product.precoPix)} PIX
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
