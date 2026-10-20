'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Sparkles,
} from 'lucide-react';
import { DFRegion, HeroBanner, Product } from '../types/store';
import { formatBRL, PRODUCTS } from '../data/mockData';

interface HeroSectionProps {
  selectedRegion: DFRegion;
  onExploreClick: () => void;
  onAddToCart?: (product: Product) => void;
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

export default function HeroSection({
  selectedRegion,
  onExploreClick,
  onAddToCart,
  products = PRODUCTS,
  banners = [],
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState<'in' | 'out'>('in');

  // Slides: banners ativos do painel (com a foto escolhida lá) ou, na falta deles, os 10 primeiros produtos
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
    return source.slice(0, 10).map((p) => ({ key: p.id, imagem: p.imagem, product: p }));
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

  // Auto-play fluido a cada 3.6 segundos
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setAnimPhase('out');
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
        setAnimPhase('in');
      }, 180);
    }, 3600);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  if (!currentSlide) return null;

  const discountPercent = currentProduct
    ? Math.max(
        5,
        Math.round(((currentProduct.precoDe - currentProduct.precoPix) / currentProduct.precoDe) * 100)
      )
    : 0;

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

  return (
    <section className="relative bg-[#0A0A0A] text-white overflow-hidden border-b border-white/[0.08]">
      {/* Luz Ambiental Sutil */}
      <div className="pointer-events-none absolute -top-36 left-1/3 w-[520px] h-[520px] rounded-full bg-[#10B981]/12 blur-[140px]" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-5 sm:py-6">
        {/* Topo Enxuto e Limpo (Sem poluição visual e sem botão fixo de WhatsApp) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#121212]/90 border border-white/10 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm font-black text-white truncate">
              Entrega Expressa em <span className="text-[#34D399]">{selectedRegion.nome.split('(')[0].trim()}</span>
            </p>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-400 border-l border-white/10 pl-2">
              <Truck className="w-3.5 h-3.5 text-[#34D399]" />
              {selectedRegion.tempoEstimado}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-1 rounded-xl">
              Frete {formatBRL(selectedRegion.taxaEntrega)}
            </span>
            <button
              type="button"
              onClick={onExploreClick}
              className="hidden sm:inline-flex items-center gap-1 bg-white/10 hover:bg-[#10B981] hover:text-[#0A0A0A] text-white font-bold text-xs px-3 py-1 rounded-xl transition-colors cursor-pointer"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SUPER BANNER DE PRODUTOS EM DESTAQUE MÁXIMO (LARGURA TOTAL E IMAGEM GRANDE) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative bg-gradient-to-b from-[#16161A] to-[#0D0D10] border border-[#10B981]/40 rounded-3xl p-3 sm:p-5 lg:p-6 shadow-[0_24px_80px_rgba(16,185,129,0.18)] overflow-hidden"
        >
          {/* Barra de Progresso Fluida */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div
              key={`${currentSlide.key}-${isPaused ? 'paused' : 'play'}`}
              className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-300"
              style={{
                width: isPaused ? '45%' : '100%',
                animation: isPaused ? 'none' : 'heroBannerProgress 3.6s linear infinite',
              }}
            />
          </div>

          <style>{`
            @keyframes heroBannerProgress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>

          {/* Cabeçalho do Super Banner */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#10B981] text-[#0A0A0A] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Destaques da Loja
              </span>
              <span className="text-xs text-zinc-400 font-bold">
                {safeIndex + 1} / {slides.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#10B981] hover:text-[#0A0A0A] border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Banner anterior"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#10B981] hover:text-[#0A0A0A] border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Próximo banner"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Palco Principal do Banner — Imagem Muito Maior e Com Ênfase Total */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center bg-[#0A0A0A] border border-white/12 rounded-2xl p-3 sm:p-5 transition-all duration-300 ease-out ${
              animPhase === 'in'
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-2 scale-[0.985]'
            }`}
          >
            {/* Imagem Principal Grande (7 Colunas no Desktop e Altura Ampliada no Mobile) */}
            <div className="lg:col-span-7 relative h-[280px] sm:h-[360px] lg:h-[400px] rounded-2xl overflow-hidden bg-white flex items-center justify-center border border-white/10 shadow-2xl group">
              <img
                src={currentSlide.imagem}
                alt={currentProduct?.nome || currentSlide.titulo || 'Banner RR Store'}
                className="w-full h-full object-contain p-3 sm:p-5 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {currentProduct && (
                <>
                  <span className="absolute top-3 left-3 bg-[#0A0A0A]/90 backdrop-blur-md text-[#34D399] border border-[#10B981]/50 text-xs sm:text-sm font-black px-3 py-1 rounded-xl shadow-lg">
                    -{discountPercent}% OFF
                  </span>
                  <span className="absolute top-3 right-3 bg-[#10B981] text-[#0A0A0A] text-xs font-black px-3 py-1 rounded-xl shadow-lg">
                    {currentProduct.tag}
                  </span>
                </>
              )}
              <span className="absolute bottom-3 left-3 text-xs font-extrabold text-white bg-[#0A0A0A]/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                ⚡ Pronta-Entrega Hoje no DF
              </span>
            </div>

            {/* Detalhes Enxutos e Diretos do Produto em Destaque */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {currentProduct ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#34D399] uppercase tracking-wider truncate">
                        {currentProduct.categoria}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {currentProduct.avaliacao.toFixed(1)}
                      </span>
                    </div>

                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white line-clamp-2 leading-tight">
                      {currentSlide.titulo || currentProduct.nome}
                    </h1>

                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {currentProduct.descricao}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-zinc-500 line-through block">
                        De {formatBRL(currentProduct.precoDe)}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-[#34D399]">
                          {formatBRL(currentProduct.precoPix)}
                        </span>
                        <span className="text-xs font-black text-[#10B981]">no PIX (5% OFF)</span>
                      </div>
                      <span className="text-xs text-zinc-400 block">
                        {currentProduct.parcelamento}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHeroAdd(currentProduct)}
                      className={`touch-target px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                        addedId === currentProduct.id
                          ? 'bg-white text-[#0A0A0A]'
                          : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_0_28px_rgba(16,185,129,0.45)]'
                      }`}
                    >
                      {addedId === currentProduct.id ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                          <span>+ Comprar Agora</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <span className="text-xs font-extrabold text-[#34D399] uppercase tracking-wider">
                    Destaque RR Store
                  </span>
                  <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                    {currentSlide.titulo || 'Confira as ofertas com entrega hoje no DF'}
                  </h1>
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className="touch-target px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_0_24px_rgba(16,185,129,0.4)] cursor-pointer"
                  >
                    <span>Ver Catálogo</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Esteira de Miniaturas Maiores */}
          <div className="mt-3.5 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {slides.map((item, idx) => {
              const isCurrent = idx === safeIndex;
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => triggerSlideChange(idx)}
                  className={`group flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#10B981]/20 border-[#10B981] text-white scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'bg-[#0A0A0A]/80 border-white/10 text-zinc-400 hover:border-white/30 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.imagem}
                    alt={item.product?.nome || item.titulo || 'Banner'}
                    className="w-11 h-11 rounded-lg object-contain bg-white p-0.5 shrink-0"
                  />
                  <div className="text-left max-w-[125px]">
                    <p className="text-xs font-bold text-white truncate">
                      {item.titulo || item.product?.nome || 'Destaque'}
                    </p>
                    {item.product && (
                      <p className="text-xs font-black text-[#34D399]">
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

