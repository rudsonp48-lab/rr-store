'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  MessageCircle,
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
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';

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

  // Slides: banners ativos do painel (com a foto escolhida lá) ou, na falta deles, os 8 primeiros produtos
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
    return source.slice(0, 8).map((p) => ({ key: p.id, imagem: p.imagem, product: p }));
  }, [products, banners]);

  // Evita índice fora do intervalo quando a lista de slides muda
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
      {/* Luzes Ambientais Sutis Estilo Stripe / Linear */}
      <div className="pointer-events-none absolute -top-36 left-1/4 w-[480px] h-[480px] rounded-full bg-[#10B981]/12 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-6 w-[420px] h-[420px] rounded-full bg-[#34D399]/10 blur-[130px]" />

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 pb-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          {/* Bloco 1 Compactado: Headline enxuta para destacar os Banners */}
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex flex-wrap items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#34D399]">
                Motoboy Express 45–90 min no DF
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold border-l border-white/15 pl-1.5 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                4.9
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug text-white">
              Tudo o que seu dia a dia em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-emerald-200">
                Brasília precisa
              </span>
              , na velocidade de um toque.
            </h1>

            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Os 10 departamentos mais desejados do DF com{' '}
              <strong className="text-[#34D399]">5% OFF imediato no PIX</strong> ou em até{' '}
              <strong className="text-white">12x no Cartão</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={onExploreClick}
                className="motion-hover-lift inline-flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <a
                href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-hover-lift inline-flex items-center justify-center gap-1.5 bg-[#121212] hover:bg-white/[0.08] text-white border border-white/15 hover:border-[#10B981]/50 font-bold text-xs px-3.5 py-2.5 rounded-xl"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#34D399]" />
                <span>WhatsApp DF</span>
              </a>
            </div>

            <div className="bg-[#121212]/90 border border-white/[0.08] rounded-xl px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Truck className="w-4 h-4 text-[#34D399] shrink-0" />
                <p className="text-[11px] text-zinc-300 truncate">
                  <strong className="text-white">{selectedRegion.nome.split('(')[0].trim()}</strong> •{' '}
                  <span className="text-[#34D399] font-bold">{selectedRegion.tempoEstimado}</span>
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-black text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-lg">
                Frete {formatBRL(selectedRegion.taxaEntrega)}
              </span>
            </div>
          </div>

          {/* Bloco 2: Super Banner com Transição Fluida */}
          <div
            className="lg:col-span-7"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="relative bg-gradient-to-b from-[#17171A] to-[#0E0E11] border border-[#10B981]/35 rounded-3xl p-4 sm:p-6 shadow-[0_25px_80px_rgba(16,185,129,0.16)] overflow-hidden">
              {/* Barra de Progresso */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
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

              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#10B981] text-[#0A0A0A] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Ofertas Passando Agora
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">
                    {safeIndex + 1} / {slides.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#10B981] hover:text-[#0A0A0A] border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                    aria-label="Banner anterior"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#10B981] hover:text-[#0A0A0A] border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                    aria-label="Próximo banner"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Card Grande com Transição (Opacity + Scale + Translate) */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 items-center bg-[#0A0A0A] border border-white/12 rounded-2xl p-4 sm:p-5 transition-all duration-300 ease-out ${
                  animPhase === 'in'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-2 scale-[0.985]'
                }`}
              >
                {/* Foto do Banner */}
                <div className="sm:col-span-6 relative aspect-[16/11] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-xl group">
                  <img
                    src={currentSlide.imagem}
                    alt={currentProduct?.nome || currentSlide.titulo || 'Banner RR Store'}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {currentProduct && (
                    <>
                      <span className="absolute top-3 left-3 bg-[#0A0A0A]/90 backdrop-blur-md text-[#34D399] border border-[#10B981]/50 text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
                        -{discountPercent}% OFF
                      </span>
                      <span className="absolute top-3 right-3 bg-[#10B981] text-[#0A0A0A] text-[11px] font-black px-2.5 py-1 rounded-lg shadow-lg">
                        {currentProduct.tag}
                      </span>
                    </>
                  )}
                  <span className="absolute bottom-2.5 left-3 text-[11px] font-extrabold text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                    ⚡ Entrega Hoje em {selectedRegion.nome.split('(')[0].trim()}
                  </span>
                </div>

                {/* Informações */}
                <div className="sm:col-span-6 flex flex-col justify-between space-y-3.5">
                  {currentProduct ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-extrabold text-[#34D399] uppercase tracking-wider truncate">
                            {currentProduct.categoria}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {currentProduct.avaliacao.toFixed(1)}
                          </span>
                        </div>

                        <h2 className="text-base sm:text-xl font-black text-white line-clamp-2 leading-tight">
                          {currentSlide.titulo || currentProduct.nome}
                        </h2>

                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {currentProduct.descricao}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-zinc-500 line-through block">
                            De {formatBRL(currentProduct.precoDe)}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl sm:text-2xl font-black text-[#34D399]">
                              {formatBRL(currentProduct.precoPix)}
                            </span>
                            <span className="text-[11px] font-black text-[#10B981]">no PIX</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block">
                            {currentProduct.parcelamento}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleHeroAdd(currentProduct)}
                          className={`touch-target px-4 sm:px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                            addedId === currentProduct.id
                              ? 'bg-white text-[#0A0A0A]'
                              : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_0_24px_rgba(16,185,129,0.4)]'
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
                              <span>+ Adicionar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-xs font-extrabold text-[#34D399] uppercase tracking-wider">
                          Destaque RR Store
                        </span>
                        <h2 className="text-base sm:text-xl font-black text-white leading-tight mt-1.5">
                          {currentSlide.titulo || 'Confira as ofertas com entrega hoje no DF'}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={onExploreClick}
                        className="touch-target self-start px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_0_24px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        <span>Ver Catálogo</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Miniaturas */}
              <div className="mt-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
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
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="text-left max-w-[115px]">
                        <p className="text-[11px] font-bold text-white truncate">
                          {item.titulo || item.product?.nome || 'Destaque'}
                        </p>
                        {item.product && (
                          <p className="text-[10px] font-black text-[#34D399]">
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
        </div>
      </div>
    </section>
  );
}
