'use client';

import React, { useMemo, useState } from 'react';
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

  // Produto destaque para o banner roxo estilo Apple/AirPods do mockup
  const featuredProduct = useMemo(() => {
    return (
      products.find((p) => p.id === 'rr-apple-ip18pro-256-bordo' && p.estoque > 0) ||
      products.find((p) => p.id === 'rr-apple-ip18duo-256-silver' && p.estoque > 0) ||
      products.find((p) => p.id.startsWith('rr-apple-') && p.estoque > 0) ||
      products[0]
    );
  }, [products]);

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

          {/* Botão Circular RR / Ferramentas */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir opções da loja"
            className="w-10 h-10 rounded-full bg-[#2D1B4E] text-white flex items-center justify-center shadow-md shrink-0 font-black text-xs tracking-tight border-2 border-white"
          >
            RR
          </button>
        </div>

        {/* Card Hero Roxo Vibrante (Inspirado na Tela 1 do Mockup) */}
        {!searchQuery.trim() && featuredProduct && (
          <div
            onClick={() => onSelectProduct(featuredProduct)}
            className="mt-4 rounded-[28px] bg-gradient-to-br from-[#3B1D6E] via-[#5E35B1] to-[#4A258C] p-4 text-white relative overflow-hidden shadow-[0_14px_30px_rgba(74,37,140,0.28)] cursor-pointer active:scale-[0.99] transition-transform"
          >
            {/* Brilho suave ao fundo */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#9D7CE8]/30 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex-1 min-w-0 space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E3DAFB] text-[#2D1B4E] text-[10px] font-black tracking-wide">
                  <Sparkles className="w-3 h-3 text-[#5E35B1]" />
                  Novidades
                </span>

                <div>
                  <h2 className="text-xl font-black leading-tight tracking-tight">
                    Joias Apple.
                  </h2>
                  <p className="text-[11px] text-[#DFD5F8] font-medium leading-snug mt-0.5">
                    Preço oficial de atacado no PIX com entrega no DF.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-white/95 bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs">
                  <span>Ver {getPureModelName(featuredProduct.nome)}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="w-28 h-28 shrink-0 flex items-center justify-center">
                <CutoutImage
                  src={featuredProduct.imagem}
                  alt={featuredProduct.nome}
                  className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 mb-3">
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

                    {/* Foto Flutuante Centralizada */}
                    <div className="w-full h-28 flex items-center justify-center my-1">
                      <CutoutImage
                        src={product.imagem}
                        alt={product.nome}
                        className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(45,27,78,0.12)]"
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

      {/* 3. Pílula Flutuante de Carrinho Roxo Escuro (Idêntica à Tela 2 do Mockup) */}
      <button
        type="button"
        onClick={onOpenCart}
        aria-label="Abrir sacola"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#2D1B4E] hover:bg-[#3A2463] text-white rounded-full px-6 py-3 shadow-[0_12px_32px_rgba(45,27,78,0.45)] flex items-center gap-3 active:scale-95 transition-all cursor-pointer border border-white/10"
      >
        <span className="text-sm font-black tracking-tight">
          {cartCount > 0 ? formatBRL(cartSubtotalPix) : 'Ver Sacola'}
        </span>
        <div className="relative flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 text-white" />
          {cartCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#8B68D6] text-[10px] font-black">
              {cartCount}
            </span>
          )}
        </div>
      </button>

      {/* 4. Gaveta de Opções / Ordenação / Troca / Comparador / Região */}
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
