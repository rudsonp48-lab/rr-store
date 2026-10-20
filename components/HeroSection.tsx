'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Truck,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Eye,
  Flame,
  MousePointerClick,
  ChevronDown,
} from 'lucide-react';
import { DFRegion, HeroBanner, Product } from '../types/store';
import { formatBRL, PRODUCTS } from '../data/mockData';

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
  subtituloDestaque?: string;
  product?: Product;
}

// IDs curados para exibir variedade de categorias topo de linha no Super Banner
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

  // Estados da Animação Action no Scroll + Parallax 3D no Mouse
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 a 1 dentro do palco do banner
  const [showFloatingBar, setShowFloatingBar] = useState(false); // Barra de ação flutuante ao rolar a página
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const lastScrollSlideRef = useRef<number>(0);

  // Seleciona os slides: banners ativos do painel ou a seleção curada de flagships da loja
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
    }, 170);
  };

  // Auto-play fluido a cada 4.2 segundos (pausa quando o usuário interage ou rola)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setAnimPhase('out');
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
        setAnimPhase('in');
      }, 170);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Listener de Scroll Action (calcula progresso de scroll para animações 3D, parallax e barra flutuante)
  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        // Progresso de 0 a 1 nos primeiros 520px de rolagem
        const progress = Math.min(1, Math.max(0, y / 520));
        setScrollProgress(progress);
        setShowFloatingBar(y > 640);

        // Efeito Action no Scroll: ao rolar pela zona de destaque, avança suavemente entre os primeiros destaques
        if (y > 40 && y < 440 && slides.length > 1) {
          const step = Math.floor((y - 40) / 135);
          if (step !== lastScrollSlideRef.current) {
            lastScrollSlideRef.current = step;
            setActiveIndex((prev) => (prev + 1) % slides.length);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [slides.length]);

  if (!currentSlide) return null;

  const discountPercent = currentProduct
    ? Math.max(
        5,
        Math.round(
          ((currentProduct.precoDe - currentProduct.precoPix) / currentProduct.precoDe) * 100
        )
      )
    : 0;

  const savingsAmount = currentProduct
    ? Math.max(0, currentProduct.precoDe - currentProduct.precoPix)
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

  // Transformações dinâmicas baseadas no Scroll Action + Mouse 3D
  const stageScale = 1 + scrollProgress * 0.045;
  const stageTranslateY = scrollProgress * -14;
  const productScale = 1 + scrollProgress * 0.1;
  const productRotateZ = scrollProgress * -2.2 + mouseTilt.x * 0.25;
  const glowOpacity = 0.35 + scrollProgress * 0.45;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-[#070709] text-white border-b border-[#10B981]/25 overflow-hidden"
      >
        {/* Fundo Cinematográfico Dinâmico que Reage ao Scroll */}
        <div
          className="pointer-events-none absolute -top-32 left-1/4 w-[620px] h-[620px] rounded-full bg-[#10B981]/20 blur-[150px] transition-transform duration-300"
          style={{
            transform: `translate3d(${scrollProgress * 60}px, ${scrollProgress * 40}px, 0) scale(${
              1 + scrollProgress * 0.25
            })`,
            opacity: glowOpacity,
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-1/4 w-[540px] h-[540px] rounded-full bg-emerald-400/15 blur-[160px] transition-transform duration-300"
          style={{
            transform: `translate3d(${scrollProgress * -50}px, ${scrollProgress * -30}px, 0)`,
          }}
        />

        {/* Malha de Perspectiva Sutil no Fundo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            transform: `translateY(${scrollProgress * 28}px)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-7 sm:py-7">
          {/* Barra Superior de Status de Entrega Expressa */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 bg-[#111315]/90 backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
              </span>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                Entrega Expressa em{' '}
                <span className="text-[#34D399]">
                  {selectedRegion.nome.split('(')[0].trim()}
                </span>
              </p>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-300 border-l border-white/10 pl-2.5">
                <Truck className="w-3.5 h-3.5 text-[#34D399]" />
                {selectedRegion.tempoEstimado}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-400/25 px-2.5 py-1 rounded-xl">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Vitrine Oficial Joias Apple & Eletrônicos
              </span>
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

          {/* SUPER BANNER ACTION — O GRANDE DESTAQUE DO SITE COM ANIMAÇÃO NO SCROLL E 3D */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{
              transform: `translate3d(0, ${stageTranslateY}px, 0) scale(${stageScale})`,
              transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="relative bg-gradient-to-br from-[#141918] via-[#0D1012] to-[#090B0C] border-2 border-[#10B981]/55 rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-[0_25px_100px_-15px_rgba(16,185,129,0.38)] overflow-hidden"
          >
            {/* Feixe de Luz Superior Animado + Progresso de Scroll/Autoplay */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
              <div
                key={`${currentSlide.key}-${isPaused ? 'paused' : 'play'}`}
                className="h-full bg-gradient-to-r from-[#10B981] via-[#34D399] to-emerald-200"
                style={{
                  width: isPaused ? `${Math.max(25, scrollProgress * 100)}%` : '100%',
                  animation: isPaused ? 'none' : 'heroBannerProgress 4.2s linear infinite',
                }}
              />
            </div>

            <style>{`
              @keyframes heroBannerProgress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
              @keyframes floatSlow {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-7px); }
              }
              @keyframes pulseRing {
                0% { transform: scale(0.92); opacity: 0.55; }
                50% { transform: scale(1.06); opacity: 0.22; }
                100% { transform: scale(0.92); opacity: 0.55; }
              }
              @keyframes shineSweep {
                0% { transform: translateX(-120%) skewX(-20deg); }
                100% { transform: translateX(220%) skewX(-20deg); }
              }
            `}</style>

            {/* Cabeçalho do Super Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#0A0A0A] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.55)]">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Super Destaque RR-MOBILE
                </span>
                <span className="text-xs text-zinc-300 font-extrabold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  {safeIndex + 1} de {slides.length}
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/25 px-3 py-1 rounded-lg">
                  <MousePointerClick className="w-3.5 h-3.5" />
                  Clique no produto para ver Ficha Técnica & SEO
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-[#10B981] hover:text-[#0A0A0A] border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow"
                  aria-label="Destaque anterior"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-[#10B981] hover:text-[#0A0A0A] border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow"
                  aria-label="Próximo destaque"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* PALCO PRINCIPAL 3D COM PARALLAX NO SCROLL E NO CURSOR */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center bg-[#090B0D]/90 border border-white/12 rounded-3xl p-4 sm:p-6 lg:p-7 transition-all duration-300 ease-out ${
                animPhase === 'in'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-3 scale-[0.98]'
              }`}
            >
              {/* Coluna Esquerda (7 Colunas): Palco Spotlight com Animação Action no Scroll */}
              <div
                onClick={() => currentProduct && onSelectProduct?.(currentProduct)}
                className="lg:col-span-7 relative h-[300px] sm:h-[390px] lg:h-[430px] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group select-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.22) 0%, rgba(15,23,21,0.95) 62%, #07090A 100%)',
                }}
              >
                {/* Anéis de Energia Pulsantes no Fundo do Palco */}
                <div
                  className="pointer-events-none absolute w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] rounded-full border border-[#10B981]/30"
                  style={{
                    animation: 'pulseRing 4s ease-in-out infinite',
                    transform: `scale(${1 + scrollProgress * 0.18})`,
                  }}
                />
                <div
                  className="pointer-events-none absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-[#34D399]/20"
                  style={{
                    transform: `rotate(${scrollProgress * 45}deg) scale(${
                      1 + scrollProgress * 0.1
                    })`,
                    transition: 'transform 150ms linear',
                  }}
                />

                {/* Card Pedestal Iluminado para Destacar a Foto Sem Parecer um Bloco Retangular Chapado */}
                <div
                  className="relative w-[82%] sm:w-[76%] h-[82%] sm:h-[84%] rounded-3xl bg-white shadow-[0_25px_70px_rgba(16,185,129,0.35)] border-2 border-[#34D399]/50 flex items-center justify-center p-4 sm:p-6 transition-transform duration-300"
                  style={{
                    transform: `perspective(900px) rotateX(${mouseTilt.y * 0.6}deg) rotateY(${
                      mouseTilt.x * 0.6
                    }deg) scale(${productScale}) rotateZ(${productRotateZ}deg)`,
                  }}
                >
                  <img
                    src={currentSlide.imagem}
                    alt={currentProduct?.nome || currentSlide.titulo || 'Destaque RR Store'}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
                  />

                  {/* Reflexo de Luz Dinâmico no Hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Badges Flutuantes com Parallax Action no Scroll */}
                {currentProduct && (
                  <>
                    <div
                      style={{
                        transform: `translate3d(0, ${scrollProgress * -16}px, 0)`,
                      }}
                      className="absolute top-3.5 left-3.5 bg-[#0A0A0A]/95 backdrop-blur-md text-[#34D399] border border-[#10B981]/60 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-[#34D399]" />
                      <span>-{discountPercent}% OFF</span>
                    </div>

                    <div
                      style={{
                        transform: `translate3d(0, ${scrollProgress * -12}px, 0)`,
                      }}
                      className="absolute top-3.5 right-3.5 bg-[#10B981] text-[#0A0A0A] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-xl"
                    >
                      {currentProduct.tag}
                    </div>
                  </>
                )}

                {/* Selo Flutuante Esquerdo Inferior */}
                <div
                  style={{
                    transform: `translate3d(0, ${scrollProgress * 12}px, 0)`,
                  }}
                  className="absolute bottom-3.5 left-3.5 text-[11px] sm:text-xs font-extrabold text-white bg-[#0A0A0A]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#10B981]/40 shadow-lg flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                  <span>100% Original • Pronta-Entrega DF</span>
                </div>

                {/* Botão Rápido Ver Informações no Canto Direito Inferior */}
                {currentProduct && (
                  <div
                    style={{
                      transform: `translate3d(0, ${scrollProgress * 12}px, 0)`,
                    }}
                    className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-[#0A0A0A] bg-[#34D399] hover:bg-white px-3.5 py-1.5 rounded-xl shadow-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Informações</span>
                  </div>
                )}
              </div>

              {/* Coluna Direita (5 Colunas): Informações de Impacto, Preço PIX e Botões Action */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {currentProduct ? (
                  <>
                    <div
                      onClick={() => onSelectProduct?.(currentProduct)}
                      className="space-y-3 cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#34D399] uppercase tracking-wider bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1 rounded-lg">
                          {currentProduct.id.startsWith('rr-apple-')
                            ? '💎 Joias Apple Oficial'
                            : currentProduct.categoria}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {currentProduct.avaliacao.toFixed(1)} ({currentProduct.avaliacoesCount})
                        </span>
                      </div>

                      <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white hover:text-[#34D399] transition-colors leading-[1.12] tracking-tight">
                        {currentSlide.titulo || currentProduct.nome}
                      </h1>

                      <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                        {currentProduct.descricao.split(' | Pagamento:')[0]}
                      </p>

                      {/* Pílulas de Vantagens Rápidas */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-zinc-200 bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-lg">
                          ⚡ Envio Motoboy Hoje
                        </span>
                        <span className="text-[11px] font-bold text-zinc-200 bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-lg">
                          💰 PIX ou Dinheiro sem Fiado
                        </span>
                        <span className="text-[11px] font-bold text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-1 rounded-lg">
                          Economia de {formatBRL(savingsAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Bloco de Preço em Destaque Máximo */}
                    <div className="bg-gradient-to-r from-[#111A17] to-[#0D1211] border border-[#10B981]/40 rounded-2xl p-4 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>
                          De <del className="font-semibold">{formatBRL(currentProduct.precoDe)}</del>
                        </span>
                        <span className="text-[11px] font-black text-[#34D399] uppercase tracking-wider">
                          Estoque: {currentProduct.estoque} un.
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-3xl sm:text-4xl font-black text-[#34D399] tracking-tight drop-shadow-[0_2px_12px_rgba(52,211,153,0.35)]">
                          {formatBRL(currentProduct.precoPix)}
                        </span>
                        <span className="text-xs font-black text-[#0A0A0A] bg-[#34D399] px-2.5 py-1 rounded-lg">
                          no PIX (5% OFF)
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 font-semibold">
                        {currentProduct.parcelamento}
                      </p>

                      {/* Dupla de Botões de Ação de Alta Conversão */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleHeroAdd(currentProduct)}
                          className={`relative overflow-hidden touch-target px-4 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            addedId === currentProduct.id
                              ? 'bg-white text-[#0A0A0A]'
                              : 'bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_28px_rgba(16,185,129,0.5)]'
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

                        <button
                          type="button"
                          onClick={() => onSelectProduct?.(currentProduct)}
                          className="touch-target px-4 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#34D399]" />
                          <span>Ficha Técnica & SEO</span>
                        </button>
                      </div>
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

            {/* Carrossel Dock de Miniaturas Interativas */}
            <div className="mt-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {slides.map((item, idx) => {
                const isCurrent = idx === safeIndex;
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => triggerSlideChange(idx)}
                    className={`group flex items-center gap-2.5 p-1.5 pr-3.5 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#10B981]/25 border-[#34D399] text-white scale-[1.03] shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                        : 'bg-[#0A0A0A]/80 border-white/10 text-zinc-400 hover:border-white/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.imagem}
                      alt={item.product?.nome || item.titulo || 'Banner'}
                      className="w-11 h-11 rounded-lg object-contain bg-white p-1 shrink-0"
                    />
                    <div className="text-left max-w-[140px]">
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

            {/* Indicador Action de Rolagem para o Catálogo */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold">
                ✨ Role a página para explorar todos os departamentos com animação dinâmica
              </span>
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-1 text-[#34D399] hover:underline font-extrabold cursor-pointer"
              >
                <span>Descer para Vitrine</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA ACTION FLUTUANTE NO SCROLL: Mantém o Destaque do Banner Acessível Enquanto o Cliente Rola a Página */}
      <div
        className={`fixed top-[68px] sm:top-[76px] left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${
          showFloatingBar && currentProduct
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4'
        }`}
      >
        {currentProduct && (
          <div className="max-w-4xl mx-auto px-3">
            <div className="pointer-events-auto bg-[#0B0E0D]/95 backdrop-blur-xl border border-[#10B981]/60 rounded-2xl px-3.5 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.65)] flex items-center justify-between gap-3">
              <div
                onClick={() => onSelectProduct?.(currentProduct)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              >
                <span className="hidden sm:inline-flex items-center gap-1 bg-[#10B981] text-[#0A0A0A] text-[10px] font-black uppercase px-2 py-0.5 rounded-md shrink-0">
                  <Sparkles className="w-3 h-3 fill-current" />
                  Destaque
                </span>
                <img
                  src={currentSlide.imagem}
                  alt={currentProduct.nome}
                  className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">
                    {currentProduct.nome}
                  </p>
                  <p className="text-[11px] font-black text-[#34D399]">
                    {formatBRL(currentProduct.precoPix)} à vista no PIX
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectProduct?.(currentProduct)}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Detalhes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHeroAdd(currentProduct)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] flex items-center gap-1 cursor-pointer shadow"
                >
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Comprar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
