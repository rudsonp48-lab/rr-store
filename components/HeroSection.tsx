'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  Sparkles,
  MapPin,
  Eye,
  ShieldCheck,
  Store,
  Heart,
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
  'rr-apple-ip17pm-512-silver',
  'rr-apple-ip17pm-256-laranja',
  'rr-apple-ip18pm-256-bordo',
  'rr-apple-watch-s12-42-dourado-bordo',
  'rr-apple-watch-ultra3-49-black',
  'rr-apple-macbook-air-m5-512-midnight',
  'rr-apple-macbook-neo-256-citrus',
  'rr-apple-ipadpro-m5-13-256-preto',
  'rr-apple-airpods-max2-azul',
  'rr-apple-airpods-pro-3',
];

/**
 * Gera os títulos divididos no topo (Esquerda e Direita) e a frase de impacto
 * exatamente no formato editorial da imagem de referência ("Define Your STYLE / Own Your WORLD").
 */
function buildHeroCopy(rawTitle: string): {
  leftTop: string;
  leftBig: string;
  rightTop: string;
  rightBig: string;
  cardHeadline1: string;
  cardHeadline2: string;
  shortName: string;
  shortSub: string;
} {
  const clean = rawTitle
    .replace(/\(Americano\s*🇺🇸\)/gi, '')
    .replace(/\(Lacrado\)/gi, '')
    .replace(/\(Zerou no Estoque\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const upper = clean.toUpperCase();

  if (upper.includes('IPHONE')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'Titânio Pro';
    const modelMatch = upper.match(/IPHONE\s+\d+/);
    const storageMatch = upper.match(/\d+GB/);
    const isProMax = upper.includes('PRO MAX');
    return {
      leftTop: 'Escolha Seu',
      leftBig: modelMatch ? modelMatch[0] : 'IPHONE',
      rightTop: 'Domine Seu',
      rightBig: isProMax ? 'PRO MAX' : 'PRO SERIES',
      cardHeadline1: 'Onde a Potência',
      cardHeadline2: 'Encontra a Perfeição',
      shortName: `${modelMatch ? modelMatch[0] : 'iPhone'} ${isProMax ? 'Pro Max' : 'Pro'}`,
      shortSub: `${storageMatch ? storageMatch[0] : '256GB'} • ${color}`,
    };
  }

  if (upper.includes('APPLE WATCH')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'Edição Especial';
    const isUltra = upper.includes('ULTRA');
    const seriesMatch = upper.match(/SERIES\s+\d+|ULTRA\s+\d+|SE\s+\d+/);
    return {
      leftTop: 'Eleve Seu',
      leftBig: 'WATCH',
      rightTop: 'Supere Seu',
      rightBig: seriesMatch ? seriesMatch[0] : isUltra ? 'ULTRA 3' : 'SERIES 12',
      cardHeadline1: 'Onde o Estilo',
      cardHeadline2: 'Encontra a Saúde',
      shortName: parts[0] || 'Apple Watch',
      shortSub: color,
    };
  }

  if (upper.includes('MACBOOK')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'Apple Silicon';
    const isAir = upper.includes('AIR');
    return {
      leftTop: 'Crie Seu',
      leftBig: 'MACBOOK',
      rightTop: 'Acelere Seu',
      rightBig: isAir ? 'CHIP M5' : 'NEO 13"',
      cardHeadline1: 'Onde a Leveza',
      cardHeadline2: 'Encontra a Performance',
      shortName: isAir ? 'MacBook Air M5 13"' : 'MacBook Neo 13"',
      shortSub: `SSD Rápido • ${color}`,
    };
  }

  if (upper.includes('IPAD')) {
    const parts = clean.split(' - ');
    const color = parts[1] || 'Wi-Fi Oficial';
    return {
      leftTop: 'Expanda Sua',
      leftBig: 'IPAD PRO',
      rightTop: 'Domine Seu',
      rightBig: upper.includes('M5') ? 'OLED M5' : 'CHIP M4',
      cardHeadline1: 'Onde a Criação',
      cardHeadline2: 'Encontra a Nitidez',
      shortName: parts[0] || 'iPad Pro M5',
      shortSub: color,
    };
  }

  if (upper.includes('AIRPODS')) {
    const isMax = upper.includes('MAX');
    const parts = clean.split(' - ');
    return {
      leftTop: 'Sinta Seu',
      leftBig: 'AIRPODS',
      rightTop: 'Viva Seu',
      rightBig: isMax ? 'MAX H2' : 'PRO 3',
      cardHeadline1: 'Onde o Silêncio',
      cardHeadline2: 'Encontra a Imersão',
      shortName: isMax ? 'AirPods Max 2 USB-C' : 'AirPods Pro 3 MagSafe',
      shortSub: parts[1] || 'Cancelamento Ativo ANC',
    };
  }

  return {
    leftTop: 'Defina Seu',
    leftBig: 'ESTILO',
    rightTop: 'Domine Seu',
    rightBig: 'MUNDO',
    cardHeadline1: 'Onde a Tecnologia',
    cardHeadline2: 'Encontra a Confiança',
    shortName: clean.slice(0, 28),
    shortSub: 'Pronta Entrega • SIA Loja D439',
  };
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
      return activeBanners.map((b) => {
        const linkedProduct = b.produtoId ? source.find((p) => p.id === b.produtoId) : undefined;
        const useProductImg =
          linkedProduct &&
          (b.imagem.includes('iphone-16-pro') ||
            b.imagem.includes('watch-compare') ||
            b.imagem.includes('mba13-midnight-select'));
        return {
          key: b.id,
          imagem: useProductImg ? linkedProduct.imagem : b.imagem,
          titulo: b.titulo,
          product: linkedProduct,
        };
      });
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
  // Card lateral direito pode destacar o produto atual ou permitir compra rápida
  const nextIndex = slides.length > 1 ? (safeIndex + 1) % slides.length : safeIndex;
  const nextSlide = slides[nextIndex];

  const triggerSlideChange = (idx: number) => {
    setAnimPhase('out');
    setTimeout(() => {
      setActiveIndex(idx);
      setAnimPhase('in');
    }, 180);
  };

  // Auto-play fluido a cada 5 segundos
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setAnimPhase('out');
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
        setAnimPhase('in');
      }, 180);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Efeito Action de esmaecer/parallax suave no Scroll da página
  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setScrollProgress(Math.min(1, Math.max(0, y / 560)));
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Pré-recorta o fundo das imagens de todos os slides
  useEffect(() => {
    const t = setTimeout(() => prefetchCutouts(slides.map((s) => s.imagem)), 400);
    return () => clearTimeout(t);
  }, [slides]);

  if (!currentSlide) return null;

  const copy = buildHeroCopy(
    currentSlide.titulo || currentProduct?.nome || 'iPhone 17 Pro Max 512GB - Silver'
  );

  const discountPercent = currentProduct
    ? Math.max(
        5,
        Math.round(
          ((currentProduct.precoDe - currentProduct.precoPix) / currentProduct.precoDe) * 100
        )
      )
    : 18;

  const handlePrev = () => {
    triggerSlideChange(safeIndex === 0 ? slides.length - 1 : safeIndex - 1);
  };

  const handleNext = () => {
    triggerSlideChange((safeIndex + 1) % slides.length);
  };

  const handleHeroAdd = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onAddToCart?.(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1300);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: relX * 10, y: -relY * 10 });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  const fadeFactor = Math.max(0, scrollProgress - 0.08);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative bg-[#F7F6FC] text-[#111115] overflow-hidden border-b border-zinc-200/80"
    >
      {/* Brilho suave de fundo no estilo do mockup de referência */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[780px] h-[340px] rounded-full blur-[120px] opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(131,103,232,0.28) 0%, rgba(167,139,250,0.12) 55%, transparent 75%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-7 sm:pt-6 sm:pb-10">
        {/* Sub-barra superior: Localização Feira dos Importados SIA Loja D439 + Controles de Slide */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-2 sm:mb-4 border-b border-zinc-200/80">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 text-zinc-800 font-bold bg-white border border-zinc-200/90 px-3 py-1.5 rounded-full shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#7C63E6] shrink-0" />
              <span>Feira dos Importados do SIA — Loja D439</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-600 font-medium">
              <Truck className="w-3.5 h-3.5 text-[#059669]" />
              <span>
                Entrega em{' '}
                <strong className="text-zinc-900">
                  {selectedRegion.nome.split('(')[0].trim()}
                </strong>
                : {selectedRegion.tempoEstimado}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 font-bold hidden sm:inline">
              Destaque {safeIndex + 1}/{slides.length}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 rounded-full border border-zinc-300 bg-white hover:bg-[#7C63E6] hover:border-[#7C63E6] hover:text-white text-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Produto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-8 h-8 rounded-full border border-zinc-300 bg-white hover:bg-[#7C63E6] hover:border-[#7C63E6] hover:text-white text-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Próximo produto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTAINER PRINCIPAL DO BANNER — LAYOUT FIEL À IMAGEM DE REFERÊNCIA */}
        <div
          className={`relative transition-all duration-300 ${
            animPhase === 'in'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-1.5 scale-[0.99]'
          }`}
        >
          {/* 1. FAIXA SUPERIOR BRANCA COM OS 2 TÍTULOS MONUMENTAIS ("Define Your STYLE" / "Own Your WORLD") */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-12 items-end gap-2 sm:gap-4 pt-1 pb-4 sm:pb-6 lg:pb-8 px-1 sm:px-2">
            {/* Esquerda: "Define Your / STYLE" */}
            <div className="col-span-1 lg:col-span-5 text-left">
              <p className="text-base sm:text-2xl lg:text-[32px] font-bold italic text-[#141418] tracking-tight leading-tight">
                {copy.leftTop}
              </p>
              <h1 className="text-3xl sm:text-6xl lg:text-[72px] xl:text-[80px] font-black uppercase tracking-[-0.04em] text-[#7B61E4] leading-[0.92] mt-0.5">
                {copy.leftBig}
              </h1>
            </div>

            {/* Espaço central reservado para o topo do produto que invade a faixa branca */}
            <div className="hidden lg:block lg:col-span-2" />

            {/* Direita: "Own Your ✸ / WORLD" */}
            <div className="col-span-1 lg:col-span-5 text-right lg:pl-4">
              <div className="inline-flex items-center justify-end gap-2 sm:gap-4 w-full">
                <p className="text-base sm:text-2xl lg:text-[32px] font-bold italic text-[#141418] tracking-tight leading-tight">
                  {copy.rightTop}
                </p>
                {/* Estrela de 8 pontas idêntica à referência */}
                <svg
                  viewBox="0 0 36 36"
                  className="w-5 h-5 sm:w-8 sm:h-8 text-[#8C74EC] shrink-0 fill-current"
                  aria-hidden="true"
                >
                  <path d="M18 0L21.2 12.2L30.7 5.3L23.8 14.8L36 18L23.8 21.2L30.7 30.7L21.2 23.8L18 36L14.8 23.8L5.3 30.7L12.2 21.2L0 18L12.2 14.8L5.3 5.3L14.8 12.2L18 0Z" />
                </svg>
              </div>
              <div className="text-3xl sm:text-6xl lg:text-[72px] xl:text-[80px] font-black uppercase tracking-[-0.04em] text-[#7B61E4] leading-[0.92] mt-0.5">
                {copy.rightBig}
              </div>
            </div>
          </div>

          {/* 2. CARD PRINCIPAL ROXO/LAVANDA ARREDONDADO + PRODUTO GIGANTE SOBREPOSTO NO CENTRO */}
          <div className="relative">
            {/* PRODUTO CENTRAL RECORTADO (DESBORDA PARA CIMA ENTRE OS TÍTULOS NO DESKTOP, EXATAMENTE COMO A MODELO NA FOTO) */}
            <div
              onClick={() => currentProduct && onSelectProduct?.(currentProduct)}
              className="relative lg:absolute lg:inset-x-0 lg:-top-[115px] lg:bottom-0 z-20 pointer-events-none flex flex-col items-center justify-center mb-4 lg:mb-0"
            >
              {/* Anéis orbitais sutis atrás do topo do produto (igual ao detalhe atrás da touca na referência) */}
              <div className="hidden lg:block absolute top-[28px] w-[290px] h-[76px] rounded-[50%] border border-[#7B61E4]/35 -rotate-6 pointer-events-none" />
              <div className="hidden lg:block absolute top-[38px] w-[320px] h-[82px] rounded-[50%] border border-[#7B61E4]/25 rotate-6 pointer-events-none" />

              {/* Container clicável da Imagem Recortada sem fundo com efeito esmaecer no scroll */}
              <div
                onClick={() => currentProduct && onSelectProduct?.(currentProduct)}
                className="pointer-events-auto cursor-pointer group relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[440px] lg:h-[490px] flex items-center justify-center transition-all duration-300 ease-out"
                style={{
                  opacity: Math.max(0.2, 1 - fadeFactor * 0.95),
                  filter: `blur(${Math.max(0, scrollProgress - 0.14) * 3.8}px)`,
                  transform: `perspective(1000px) rotateX(${mouseTilt.y * 0.35}deg) rotateY(${
                    mouseTilt.x * 0.35
                  }deg) translateY(${scrollProgress * -30}px) scale(${Math.max(
                    0.9,
                    1 - fadeFactor * 0.08
                  )})`,
                }}
              >
                <CutoutImage
                  key={currentSlide.imagem}
                  src={currentSlide.imagem}
                  alt={currentProduct?.nome || currentSlide.titulo || 'Destaque RR Store'}
                  className="max-w-[92%] max-h-[92%] w-auto h-auto object-contain group-hover:scale-[1.04] transition-transform duration-500 ease-out drop-shadow-[0_28px_45px_rgba(17,12,46,0.45)]"
                />

                {/* Selo discreto de Ficha Técnica ao passar o mouse */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#111115]/90 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Clique para ver Ficha Técnica</span>
                </span>
              </div>
            </div>

            {/* BLOCO ROXO ARREDONDADO (3 COLUNAS: TEXTO + BOTÃO PRETO + SOCIAL PROOF À ESQUERDA | CENTRO | 3 ÍCONES + CARD FEATURED À DIREITA) */}
            <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#8B72EE] via-[#7E64E6] to-[#6D52D8] text-white p-5 sm:p-8 lg:px-10 lg:py-9 shadow-[0_25px_70px_rgba(109,82,216,0.28)]">
              {/* Formas ovais diagonais decorativas ao centro do card roxo (idênticas à referência) */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[14%] left-[33%] w-[360px] h-[78px] rounded-[50%] bg-white/[0.13] -rotate-12" />
                <div className="absolute top-[42%] left-[29%] w-[420px] h-[86px] rounded-[50%] bg-white/[0.11] -rotate-12" />
                <div className="absolute bottom-[12%] left-[32%] w-[380px] h-[80px] rounded-[50%] bg-white/[0.12] -rotate-12" />
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
                {/* COLUNA ESQUERDA (4 Colunas): Tag + Título 2 Linhas + Subtítulo + Botão Pill Preto + Card Social Proof */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-5 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/95">
                      <Sparkles className="w-4 h-4 fill-white text-white" />
                      <span>
                        {currentProduct
                          ? `${currentProduct.tag} • PIX -${discountPercent}% OFF`
                          : 'Coleção Oficial RR Store'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-[38px] font-bold tracking-tight text-white leading-[1.12]">
                      {copy.cardHeadline1}
                      <br />
                      {copy.cardHeadline2}
                    </h2>

                    <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xs">
                      {currentProduct ? (
                        <>
                          <strong className="text-white">{currentProduct.nome}</strong> por{' '}
                          <strong className="text-white">
                            {formatBRL(currentProduct.precoPix)} no PIX
                          </strong>{' '}
                          ou {currentProduct.parcelamento}. Retirada na{' '}
                          <strong className="text-white">SIA Loja D439</strong> ou Motoboy no DF.
                        </>
                      ) : (
                        'Aparelhos originais com garantia, retirada imediata na Feira dos Importados do SIA (Loja D439) e entrega expressa.'
                      )}
                    </p>
                  </div>

                  {/* Botão Pill Preto ("Explore Now (→)" da referência) + Botão Detalhes */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        currentProduct ? handleHeroAdd(currentProduct) : onExploreClick()
                      }
                      className="group inline-flex items-center gap-3 bg-[#0E0E11] hover:bg-black text-white font-bold text-xs sm:text-sm pl-5 pr-2.5 py-2.5 rounded-full shadow-lg transition-all cursor-pointer"
                    >
                      <span>
                        {currentProduct && addedId === currentProduct.id
                          ? 'Adicionado à Sacola!'
                          : currentProduct
                          ? 'Comprar Agora'
                          : 'Explorar Catálogo'}
                      </span>
                      <span className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                        {currentProduct && addedId === currentProduct.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>

                    {currentProduct && (
                      <button
                        type="button"
                        onClick={() => onSelectProduct?.(currentProduct)}
                        className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha Técnica</span>
                      </button>
                    )}
                  </div>

                  {/* Card Frosted Glass Inferior Esquerdo ("Loved by 20K+ Trendsetters ♥" da referência) */}
                  <div className="bg-white/20 backdrop-blur-md border border-white/25 rounded-[22px] p-3.5 max-w-[295px] flex items-center gap-3 shadow-sm">
                    <div className="flex -space-x-2.5 shrink-0">
                      <span className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        R
                      </span>
                      <span className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        M
                      </span>
                      <span className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        L
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white leading-tight">
                        Aprovado por +20 mil
                        <br />
                        <span className="text-white/90 font-medium">Clientes em Brasília</span>
                      </p>
                    </div>
                    <Heart className="w-4 h-4 fill-white text-white shrink-0 self-end" />
                  </div>
                </div>

                {/* COLUNA CENTRAL (4 Colunas): Espaço onde o Produto Protagonista fica posicionado */}
                <div className="hidden lg:block lg:col-span-4 min-h-[360px]" />

                {/* COLUNA DIREITA (4 Colunas): 3 Ícones de Diferenciais no Topo + Card "Featured Look" Branco na Base */}
                <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-between space-y-5">
                  {/* 3 Ícones Superiores Direitos (Premium Quality | Sustainable | Limited Edition -> Garantias RR Store) */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-5 text-center w-full max-w-[310px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/95 leading-tight">
                        Qualidade
                        <br />
                        Original
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/95 leading-tight">
                        Loja Física
                        <br />
                        SIA D439
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/95 leading-tight">
                        Motoboy
                        <br />
                        Expresso DF
                      </span>
                    </div>
                  </div>

                  {/* Card "Featured Look" (Oferta em Destaque) idêntico ao card branco à direita na referência */}
                  <div className="w-full max-w-[260px] flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-2 px-1">
                      <span className="text-xs font-bold tracking-wide text-white/95">
                        Destaque da Loja
                      </span>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="text-[11px] font-bold text-white/80 hover:text-white underline cursor-pointer"
                        >
                          Próximo →
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => currentProduct && onSelectProduct?.(currentProduct)}
                      className="w-full bg-white text-[#111115] rounded-[26px] p-2.5 border-2 border-white shadow-[0_18px_40px_rgba(17,12,46,0.28)] cursor-pointer group transition-transform hover:-translate-y-0.5"
                    >
                      {/* Moldura interna lilás clara com miniatura do produto */}
                      <div className="relative h-[138px] w-full rounded-[20px] bg-gradient-to-b from-[#E5DDFB] to-[#D5C8F8] flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={currentSlide.imagem}
                          alt={copy.shortName}
                          className="max-h-[112px] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                        />
                        {nextSlide && nextSlide.key !== currentSlide.key && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNext();
                            }}
                            title="Ver próximo destaque"
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/85 hover:bg-white text-[#6D52D8] flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Nome, Subtítulo e Botão Roxo com Preço PIX */}
                      <div className="pt-2.5 pb-1 px-2 text-center">
                        <p className="text-xs sm:text-sm font-extrabold text-[#111115] truncate">
                          {copy.shortName}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{copy.shortSub}</p>

                        {currentProduct ? (
                          <button
                            type="button"
                            onClick={(e) => handleHeroAdd(currentProduct, e)}
                            className="mt-2.5 w-full py-2 px-3 rounded-full bg-[#7C63E6] hover:bg-[#694FD6] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#7C63E6]/30 transition-all cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{formatBRL(currentProduct.precoPix)}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={onExploreClick}
                            className="mt-2.5 w-full py-2 px-3 rounded-full bg-[#7C63E6] text-white font-extrabold text-xs cursor-pointer"
                          >
                            Ver Catálogo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SELETOR RÁPIDO DE DESTAQUES NA BASE DO BANNER */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {slides.map((item, idx) => {
              const isCurrent = idx === safeIndex;
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => triggerSlideChange(idx)}
                  className={`group flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl border transition-all duration-200 shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#7C63E6] border-[#7C63E6] text-white shadow-md shadow-[#7C63E6]/25 scale-[1.02]'
                      : 'bg-white border-zinc-200/90 text-zinc-700 hover:border-[#7C63E6]/50'
                  }`}
                >
                  <img
                    src={item.imagem}
                    alt={item.product?.nome || item.titulo || 'Banner'}
                    className="w-9 h-9 rounded-xl object-contain bg-white p-1 shrink-0 border border-zinc-100"
                  />
                  <div className="text-left max-w-[135px]">
                    <p
                      className={`text-[11px] font-bold truncate ${
                        isCurrent ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {item.titulo || item.product?.nome || 'Destaque'}
                    </p>
                    {item.product && (
                      <p
                        className={`text-[11px] font-black ${
                          isCurrent ? 'text-amber-200' : 'text-[#6D52D8]'
                        }`}
                      >
                        {formatBRL(item.product.precoPix)} PIX
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
