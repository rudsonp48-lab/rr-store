'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  ArrowLeftRight,
  MapPin,
  ChevronRight,
  Check,
  MessageCircle,
} from 'lucide-react';
import { CategoryId, DFRegion, Product } from '../types/store';
import { formatBRL } from '../data/mockData';
import { getProductVariantConfig, getPureModelName } from '../data/productVariantUtils';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';
import CutoutImage from './CutoutImage';

export type MobileQuickFilterId =
  | 'todos'
  | 'apple'
  | 'xiaomi'
  | 'realme'
  | 'samsung'
  | 'gamer'
  | 'jbl-audio'
  | 'smartwatches'
  | 'ssd';

export type MobileSortOption = 'destaques' | 'menor-preco' | 'maior-desconto' | 'melhor-avaliacao';

interface MobileStorefrontProps {
  products: Product[];
  filteredProducts: Product[];
  visibleProducts: Product[];
  visibleCount: number;
  onLoadMore: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  quickFilter: MobileQuickFilterId;
  onSelectQuickFilter: (id: MobileQuickFilterId) => void;
  onSelectCategory: (cat: CategoryId) => void;
  sortBy: MobileSortOption;
  onSortChange: (sort: MobileSortOption) => void;
  selectedRegion: DFRegion;
  onSelectRegion: (region: DFRegion) => void;
  regions: DFRegion[];
  cartCount: number;
  cartSubtotalPix: number;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenTradeIn: (product?: Product) => void;
  onOpenComparator: () => void;
}

const MOBILE_FILTER_PILLS: { id: MobileQuickFilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'apple', label: 'Apple' },
  { id: 'xiaomi', label: 'Xiaomi' },
  { id: 'realme', label: 'Realme' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'gamer', label: 'Gamer' },
  { id: 'jbl-audio', label: 'JBL & Áudio' },
  { id: 'smartwatches', label: 'Watches' },
  { id: 'ssd', label: 'SSD' },
];

export default function MobileStorefront({
  products,
  filteredProducts,
  visibleProducts,
  visibleCount,
  onLoadMore,
  searchQuery,
  onSearchChange,
  quickFilter,
  onSelectQuickFilter,
  onSelectCategory,
  sortBy,
  onSortChange,
  selectedRegion,
  onSelectRegion,
  regions,
  cartCount,
  cartSubtotalPix,
  onOpenCart,
  onSelectProduct,
  onOpenTradeIn,
  onOpenComparator,
}: MobileStorefrontProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  // Produtos em destaque para o slider do banner mobile (modelos distintos em estoque)
  const bannerSlides = useMemo(() => {
    const inStock = products.filter((p) => p.estoque > 0 && p.imagem);
    const prioritizedIds = [
      'rr-apple-ip18duo-256-silver',
      'rr-apple-ip18promax-256-bordo',
      'rr-apple-ip18pro-256-bordo',
      'rr-apple-watch-s12-46-preto',
      'rr-apple-macbook-air-m5-16-512-midnight',
      'rr-apple-ipad-pro-m5-13-256-preto',
      'rr-apple-airpods-max-2-roxo',
    ];

    const picked: Product[] = [];
    const seenModels = new Set<string>();

    const tryPush = (p?: Product) => {
      if (!p || p.estoque <= 0 || !p.imagem) return;
      const modelKey = getPureModelName(p.nome).toLowerCase() || p.id;
      if (seenModels.has(modelKey)) return;
      seenModels.add(modelKey);
      picked.push(p);
    };

    for (const id of prioritizedIds) {
      tryPush(inStock.find((p) => p.id === id));
    }

    for (const p of inStock) {
      if (picked.length >= 7) break;
      tryPush(p);
    }

    if (picked.length === 0 && products[0]) {
      picked.push(products[0]);
    }
    return picked;
  }, [products]);

  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  useEffect(() => {
    if (activeSlide >= bannerSlides.length && bannerSlides.length > 0) {
      setActiveSlide(0);
    }
  }, [activeSlide, bannerSlides.length]);

  const handleBannerTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleBannerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || bannerSlides.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(delta) < 35) return;
    if (delta < 0) {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    } else {
      setActiveSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    }
  };

  const activeTitle = useMemo(() => {
    if (searchQuery.trim()) return 'Resultados';
    const found = MOBILE_FILTER_PILLS.find((p) => p.id === quickFilter);
    return quickFilter === 'todos' ? 'Novidades' : found?.label || 'Novidades';
  }, [quickFilter, searchQuery]);

  return (
    <div className="md:hidden min-h-screen bg-[#FAF8FE] text-[#1B1130] flex flex-col">
      {/* 1. Topo Lavanda Suave com Busca e Avatar/Menu */}
      <header className="bg-gradient-to-b from-[#D7C9F6] via-[#E8DFFA] to-[#FAF8FE] pt-3.5 pb-7 px-4">
        <div className="flex items-center gap-2.5">
          {/* Barra de Busca em Pílula Branca */}
          <div className="flex-1 bg-white rounded-full px-4 py-2.5 shadow-[0_4px_16px_rgba(45,27,78,0.06)] flex items-center gap-2.5 border border-white">
            <Search className="w-4 h-4 text-[#2D1B4E] shrink-0" />
            <input
              id="rr-mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar iPhone, Watch, AirPods..."
              className="w-full bg-transparent text-[13px] font-medium text-[#1B1130] placeholder:text-[#8E7DB3] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpar busca"
                className="text-[#8E7DB3] hover:text-[#2D1B4E]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botão Compacto de Sacola */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Abrir sacola"
            className="relative w-10 h-10 rounded-full bg-white text-[#2D1B4E] flex items-center justify-center shadow-[0_4px_16px_rgba(45,27,78,0.08)] shrink-0 border border-white active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5E35B1] text-white text-[10px] font-black flex items-center justify-center border-2 border-[#E8DFFA]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Logo Circular RR Mobile no Perfil */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir opções da loja"
            className="w-10 h-10 rounded-full bg-[#0A0A0A] overflow-hidden flex items-center justify-center shadow-md shrink-0 border-2 border-white active:scale-95 transition-transform"
          >
            <img
              src="/rr-mobile-logo.jpg"
              alt="RR Mobile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        {/* Banner Slider Roxo Vibrante com Proporção Ampliada e Fotos Maiores */}
        {!searchQuery.trim() && bannerSlides.length > 0 && (
          <div
            onTouchStart={handleBannerTouchStart}
            onTouchEnd={handleBannerTouchEnd}
            className="mt-3.5 rounded-[28px] bg-gradient-to-br from-[#3B1D6E] via-[#5E35B1] to-[#4A258C] h-[230px] text-white relative overflow-hidden shadow-[0_16px_34px_rgba(74,37,140,0.3)]"
          >
            {/* Brilho suave ao fundo */}
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#9D7CE8]/35 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#7C4DFF]/25 blur-2xl pointer-events-none" />

            {/* Trilha do Slider */}
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {bannerSlides.map((slide) => {
                const slideModel = getPureModelName(slide.nome) || slide.nome;
                return (
                  <div
                    key={slide.id}
                    onClick={() => onSelectProduct(slide)}
                    className="w-full h-full shrink-0 pl-4 pr-2 py-2 flex items-center justify-between gap-1 cursor-pointer relative z-10"
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full pt-2 pb-5">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E3DAFB] text-[#2D1B4E] text-[10px] font-black tracking-wide">
                          <Sparkles className="w-3 h-3 text-[#5E35B1]" />
                          Novidades
                        </span>

                        <h2 className="text-[20px] font-black leading-[1.12] tracking-tight mt-2.5 line-clamp-2">
                          {slideModel}
                        </h2>

                        <p className="text-[13px] font-black text-[#E3DAFB] mt-1">
                          {formatBRL(slide.precoPix)}{' '}
                          <span className="text-[10px] font-semibold text-white/75">
                            no PIX
                          </span>
                        </p>
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/15">
                          <span>Ver detalhes</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Foto Grande Ocupando Toda a Metade Direita do Banner */}
                    <div className="w-[55%] h-full shrink-0 flex items-center justify-center">
                      <CutoutImage
                        src={slide.imagem}
                        alt={slide.nome}
                        className="w-full h-full object-contain scale-[1.22] drop-shadow-[0_18px_30px_rgba(0,0,0,0.48)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicadores (Dots) do Slider */}
            {bannerSlides.length > 1 && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                {bannerSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Ir para slide ${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide
                        ? 'w-5 bg-white'
                        : 'w-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. Sheet Principal Arredondada ("Novidades" + Pílulas + Grid 2 Colunas) */}
      <main className="flex-1 bg-[#FAF8FE] rounded-t-[32px] -mt-3 pt-4 px-4 pb-28">
        {/* Cabeçalho da Seção + Ícone 3 Linhas de Menu/Ordenação */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[24px] font-black text-[#1B1130] tracking-tight leading-none">
              {activeTitle}
            </h1>
            <p className="text-[11px] font-semibold text-[#7A6A9E] mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'modelo' : 'modelos'} • Entrega {selectedRegion.nome}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Ordenar e filtrar"
            className="w-9 h-9 rounded-full bg-white border border-[#E7DFF8] flex items-center justify-center text-[#2D1B4E] shadow-2xs active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Pílulas de Filtro Horizontal */}
        <div
          id="mobile-filter-pills"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 mb-3"
        >
          {MOBILE_FILTER_PILLS.map((pill) => {
            const active = quickFilter === pill.id && searchQuery.trim() === '';
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  onSelectQuickFilter(pill.id);
                  onSelectCategory('Todos');
                  onSearchChange('');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#2D1B4E] text-white shadow-[0_4px_12px_rgba(45,27,78,0.25)]'
                    : 'bg-white text-[#4B3973] border border-[#E7DFF8]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Grid 2 Colunas Estilo Apple/Lavanda do Mockup */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7DFF8] p-8 text-center my-6 shadow-xs">
            <p className="text-sm font-black text-[#1B1130] mb-1">
              Nenhum produto encontrado
            </p>
            <p className="text-xs text-[#7A6A9E] mb-4">
              Tente outro termo ou limpe os filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                onSelectQuickFilter('todos');
                onSelectCategory('Todos');
                onSearchChange('');
              }}
              className="bg-[#2D1B4E] text-white text-xs font-bold px-5 py-2.5 rounded-full"
            >
              Mostrar Todos
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {visibleProducts.map((product) => {
                const variantConfig = getProductVariantConfig(product, products);
                const pureName = getPureModelName(product.nome);
                const isOutOfStock = product.estoque <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="rounded-[24px] bg-[#EFEAFB] p-3 flex flex-col justify-between relative active:scale-[0.97] transition-transform cursor-pointer border border-[#E5DDF8]/70"
                  >
                    {/* Badge sutil caso esgotado */}
                    {isOutOfStock && (
                      <span className="self-start px-2 py-0.5 rounded-full bg-amber-400/90 text-[9px] font-black text-black mb-1">
                        Sob consulta
                      </span>
                    )}

                    {/* Foto Flutuante Centralizada Ampliada */}
                    <div className="w-full h-36 flex items-center justify-center my-0.5">
                      <CutoutImage
                        src={product.imagem}
                        alt={product.nome}
                        className="w-full h-full object-contain scale-105 drop-shadow-[0_6px_12px_rgba(45,27,78,0.12)]"
                      />
                    </div>

                    {/* Nome e Preço Limpos (idêntico ao mockup) */}
                    <div className="mt-1.5">
                      <h3 className="text-[13px] font-bold text-[#1B1130] leading-tight line-clamp-2">
                        {pureName || product.nome}
                      </h3>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-[12px] font-bold text-[#5E4B8B]">
                          {formatBRL(product.precoPix)}
                        </span>

                        {/* Bolinhas de cores discretas */}
                        {variantConfig.hasColorOptions && (
                          <div className="flex items-center -space-x-0.5">
                            {variantConfig.availableColors.slice(0, 4).map((c) => (
                              <span
                                key={c.id}
                                className={`w-2.5 h-2.5 rounded-full border border-white relative overflow-hidden ${
                                  c.inStock === false ? 'opacity-40' : ''
                                }`}
                                style={{ backgroundColor: c.hex }}
                              >
                                {c.inStock === false && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-[140%] h-[1px] bg-red-500 -rotate-45" />
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="pt-6 flex justify-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="bg-white border border-[#DFD5F8] text-[#2D1B4E] font-bold text-xs px-6 py-2.5 rounded-full shadow-xs active:scale-95 transition-transform"
                >
                  Carregar mais ({Math.min(32, filteredProducts.length - visibleCount)})
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. Gaveta de Opções / Ordenação / Troca / Comparador / Região */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="w-full bg-[#FAF8FE] rounded-t-[32px] p-5 pb-8 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#1B1130]">Opções RR-MOBILE</h2>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E7DFF8] flex items-center justify-center text-[#2D1B4E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-[#7A6A9E]">
                Ordenar por
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'destaques', label: 'Destaques' },
                  { id: 'menor-preco', label: 'Menor Preço PIX' },
                  { id: 'maior-desconto', label: 'Maior Desconto' },
                  { id: 'melhor-avaliacao', label: 'Melhor Avaliação' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.id as MobileSortOption);
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-bold border text-left flex items-center justify-between ${
                      sortBy === opt.id
                        ? 'bg-[#2D1B4E] text-white border-[#2D1B4E]'
                        : 'bg-white text-[#1B1130] border-[#E7DFF8]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Ferramentas (Trade-In, Comparador, WhatsApp) */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-[#7A6A9E]">
                Ferramentas
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenTradeIn();
                  }}
                  className="w-full bg-white border border-[#E7DFF8] rounded-2xl p-3.5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFEAFB] text-[#2D1B4E] flex items-center justify-center">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1B1130]">Dar Usado na Troca</p>
                      <p className="text-[11px] text-[#7A6A9E]">Avalie seu aparelho na hora</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7A6A9E]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenComparator();
                  }}
                  className="w-full bg-white border border-[#E7DFF8] rounded-2xl p-3.5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFEAFB] text-[#2D1B4E] flex items-center justify-center">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1B1130]">Comparar Modelos</p>
                      <p className="text-[11px] text-[#7A6A9E]">Compare fichas técnicas lado a lado</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7A6A9E]" />
                </button>

                <a
                  href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#2D1B4E] text-white rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#D8CEFA]" />
                    <div>
                      <p className="text-xs font-black">Falar com Consultor RR-MOBILE</p>
                      <p className="text-[11px] text-[#D8CEFA]">Atendimento rápido no WhatsApp</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Região de Entrega */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-[#7A6A9E] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Região de Entrega no DF
              </p>
              <select
                value={selectedRegion.id}
                onChange={(e) => {
                  const reg = regions.find((r) => r.id === e.target.value);
                  if (reg) onSelectRegion(reg);
                }}
                className="w-full bg-white border border-[#E7DFF8] rounded-2xl px-4 py-3 text-xs font-bold text-[#1B1130] focus:outline-none"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome} ({r.tempoEstimado})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
