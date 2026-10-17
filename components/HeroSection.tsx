'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  Truck,
  MessageCircle,
  ArrowRight,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Sparkles,
} from 'lucide-react';
import { DFRegion, Product } from '../types/store';
import { formatBRL, PRODUCTS } from '../data/mockData';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';

interface HeroSectionProps {
  selectedRegion: DFRegion;
  onExploreClick: () => void;
  onAddToCart?: (product: Product) => void;
}

// 8 Produtos Campeões de Venda para o Carrossel Automático do Banner
const HERO_FEATURED_PRODUCTS: Product[] = [
  PRODUCTS[0], // Fone Bluetooth TWS Pro ANC
  PRODUCTS[9], // Creatina 100% Pura 300g
  PRODUCTS[12], // Sérum Facial Ácido Hialurônico (Clima Seco DF)
  PRODUCTS[15], // Kit 10 Potes Herméticos Block
  PRODUCTS[6], // Conjunto Fitness Seamless Alta Compressão
  PRODUCTS[27], // Caderno Inteligente A4 Black Edition
  PRODUCTS[3], // Kit 3 Lâmpadas Smart Wi-Fi RGB
  PRODUCTS[1], // Power Bank MagSafe Ultra Slim
].filter(Boolean);

export default function HeroSection({
  selectedRegion,
  onExploreClick,
  onAddToCart,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Auto-play suave dos produtos passando a cada 3.2 segundos
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_FEATURED_PRODUCTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentProduct = HERO_FEATURED_PRODUCTS[activeIndex] || PRODUCTS[0];
  const discountPercent = Math.round(
    ((currentProduct.precoDe - currentProduct.precoPix) / currentProduct.precoDe) * 100
  );

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? HERO_FEATURED_PRODUCTS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_FEATURED_PRODUCTS.length);
  };

  const handleHeroAdd = (product: Product) => {
    onAddToCart?.(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1300);
  };

  return (
    <section className="relative bg-[#0A0A0A] text-white overflow-hidden border-b border-white/[0.08]">
      {/* Luzes Ambientais Modernas Estilo Linear / Vercel / Stripe */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[550px] h-[550px] rounded-full bg-[#10B981]/12 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-[450px] h-[450px] rounded-full bg-[#34D399]/10 blur-[140px]" />

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 pb-8 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
          {/* Coluna Esquerda: Headline Moderna, Logística DF & CTAs */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
                Entrega Hoje em Brasília-DF
              </span>
              <span className="text-[11px] text-zinc-400 font-semibold border-l border-white/15 pl-2 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                4.9/5 (+3.400 pedidos)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.12] text-white">
              Tudo o que seu dia a dia em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-emerald-200">
                Brasília precisa
              </span>
              , na velocidade de um clique.
            </h1>

            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Curadoria premium nos <strong className="text-white">10 departamentos</strong> mais
              desejados do DF — Eletrônicos, Smart Home, Suplementos, Fitness, Skincare e Concursos.
              Aproveite <strong className="text-[#34D399]">5% OFF imediato no PIX</strong> ou parcele em
              até <strong className="text-white">12x no Cartão</strong> com entrega via motoboy no mesmo dia.
            </p>

            {/* Dois Botões de CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExploreClick}
                className="motion-hover-lift inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm px-6 py-3.5 rounded-2xl shadow-[0_0_28px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                <span>Explorar Catálogo Completo</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <a
                href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-hover-lift inline-flex items-center justify-center gap-2 bg-[#121212] hover:bg-white/[0.08] text-white border border-white/15 hover:border-[#10B981]/50 font-bold text-sm px-5 py-3.5 rounded-2xl"
              >
                <MessageCircle className="w-4 h-4 text-[#34D399]" />
                <span>Falar com Consultor no WhatsApp</span>
              </a>
            </div>

            {/* Pílula de Rota Ativa em Brasília */}
            <div className="bg-[#121212]/90 border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">
                    Rota Motoboy: {selectedRegion.nome}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Prazo: <strong className="text-[#34D399]">{selectedRegion.tempoEstimado}</strong> • Grátis acima de {formatBRL(selectedRegion.freteGratisAcimaDe)}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-black text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/25 px-2.5 py-1 rounded-xl">
                {formatBRL(selectedRegion.taxaEntrega)}
              </span>
            </div>
          </div>

          {/* Coluna Direita: Carrossel Dinâmico de Produtos em Destaque Passando ao Vivo */}
          <div
            className="lg:col-span-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="relative bg-gradient-to-b from-[#161618] to-[#0E0E10] border border-white/12 rounded-3xl p-4 sm:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
              {/* Topo do Carrossel: Indicador de Ofertas Passando + Setas */}
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-[#10B981] text-[#0A0A0A] text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-3 h-3 fill-current" />
                    Destaques do Dia
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {activeIndex + 1} de {HERO_FEATURED_PRODUCTS.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                    aria-label="Produto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                    aria-label="Próximo produto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Principal do Produto em Destaque (Transição Suave) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#0A0A0A] border border-white/10 rounded-2xl p-3.5 sm:p-4">
                {/* Imagem do Produto */}
                <div className="sm:col-span-5 relative aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-zinc-900">
                  <img
                    key={currentProduct.id}
                    src={currentProduct.imagem}
                    alt={currentProduct.nome}
                    className="w-full h-full object-cover transition-all duration-500 scale-100 hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-[#0A0A0A]/85 backdrop-blur-md text-[#34D399] border border-[#10B981]/40 text-[10px] font-black px-2 py-0.5 rounded-md">
                    -{discountPercent}% OFF
                  </span>
                  <span className="absolute bottom-2 right-2 bg-[#10B981] text-[#0A0A0A] text-[10px] font-black px-2 py-0.5 rounded-md">
                    {currentProduct.tag}
                  </span>
                </div>

                {/* Detalhes do Produto no Slide */}
                <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#34D399] truncate">
                        {currentProduct.categoria}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-400 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {currentProduct.avaliacao.toFixed(1)}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-black text-white line-clamp-2 leading-snug">
                      {currentProduct.nome}
                    </h2>

                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {currentProduct.descricao}
                    </p>
                  </div>

                  {/* Preço PIX + Botão Adicionar Direto do Banner */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-zinc-500 line-through block">
                        De {formatBRL(currentProduct.precoDe)}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-black text-[#34D399]">
                          {formatBRL(currentProduct.precoPix)}
                        </span>
                        <span className="text-[10px] font-bold text-[#10B981]">no PIX</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block">
                        {currentProduct.parcelamento}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHeroAdd(currentProduct)}
                      className={`touch-target px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        addedId === currentProduct.id
                          ? 'bg-white text-[#0A0A0A]'
                          : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      }`}
                    >
                      {addedId === currentProduct.id ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Na Sacola!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Miniaturas Passando Abaixo do Slide Principal (Clique Rápido) */}
              <div className="mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {HERO_FEATURED_PRODUCTS.map((item, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`group flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                          : 'bg-[#0A0A0A]/70 border-white/10 text-zinc-400 hover:border-white/25'
                      }`}
                    >
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="text-left max-w-[110px]">
                        <p className="text-[11px] font-bold text-white truncate">
                          {item.nome}
                        </p>
                        <p className="text-[10px] font-black text-[#34D399]">
                          {formatBRL(item.precoPix)} PIX
                        </p>
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
