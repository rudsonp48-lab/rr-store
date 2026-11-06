'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  Star,
  MapPin,
  Sparkles,
  ChevronRight,
  Home,
  Heart,
  MessageCircle,
  RefreshCw,
  Percent,
  X,
  Check,
} from 'lucide-react';
import { CategoryId, DFRegion, HeroBanner, Product } from '../../types/store';
import { CATEGORIES, DF_REGIONS, formatBRL } from '../../data/mockData';
import { buildConsultantWhatsAppUrl } from '../../data/whatsappUtils';
import { trackContact } from '../../lib/metaPixel';

interface MobileDiscoverViewProps {
  products: Product[];
  banners?: HeroBanner[];
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRegion: DFRegion;
  onSelectRegion?: (region: DFRegion) => void;
  regions?: DFRegion[];
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenTradeIn?: (product?: Product) => void;
}

// Categorias simplificadas para as pílulas horizontais idênticas ao mockup do Pinterest
const MOBILE_CATEGORY_PILLS: { id: CategoryId | 'smartphones' | 'headphones' | 'laptops' | 'smartwatches'; label: string }[] = [
  { id: 'Todos', label: 'All' },
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'headphones', label: 'Headphones' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'smartwatches', label: 'Smartwatches' },
  { id: 'Smart Home & Iluminação', label: 'Smart Home' },
  { id: 'Gamer & Consoles' as any, label: 'Gamer' },
];

export default function MobileDiscoverView({
  products,
  banners,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedRegion,
  onSelectRegion,
  regions = DF_REGIONS,
  cartCount,
  cartSubtotal,
  onOpenCart,
  onSelectProduct,
  onAddToCart,
  onOpenTradeIn,
}: MobileDiscoverViewProps) {
  const [activeSubFilter, setActiveSubFilter] = useState<string>('All');
  const [isRegionModalOpen, setIsRegionModalOpen] = useState<boolean>(false);

  // Filtragem dos produtos para a vitrine mobile
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Busca textual
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.descricao.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
      );
      return list;
    }

    // Filtro por categoria principal
    if (selectedCategory !== 'Todos') {
      list = list.filter((p) => p.categoria === selectedCategory);
    }

    // Filtro pelas pílulas do mockup (Smartphones, Headphones, Laptops, etc.)
    if (activeSubFilter === 'Smartphones') {
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes('iphone') ||
          p.nome.toLowerCase().includes('xiaomi') ||
          p.nome.toLowerCase().includes('samsung') ||
          p.nome.toLowerCase().includes('redmi') ||
          p.nome.toLowerCase().includes('galaxy')
      );
    } else if (activeSubFilter === 'Headphones') {
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes('airpods') ||
          p.nome.toLowerCase().includes('fone') ||
          p.nome.toLowerCase().includes('headphone') ||
          p.nome.toLowerCase().includes('jbl') ||
          p.nome.toLowerCase().includes('audio')
      );
    } else if (activeSubFilter === 'Laptops') {
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes('macbook') ||
          p.nome.toLowerCase().includes('laptop') ||
          p.nome.toLowerCase().includes('notebook') ||
          p.nome.toLowerCase().includes('ipad')
      );
    } else if (activeSubFilter === 'Smartwatches') {
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes('watch') ||
          p.nome.toLowerCase().includes('relógio') ||
          p.nome.toLowerCase().includes('band')
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory, activeSubFilter]);

  const handlePillClick = (label: string, id: string) => {
    setActiveSubFilter(label);
    if (id === 'Todos') {
      onSelectCategory('Todos');
    } else if (CATEGORIES.some((c) => c.id === id)) {
      onSelectCategory(id as CategoryId);
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#111827] min-h-screen pb-28 pt-2 select-none">
      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* =========================================================================
            1. TOP BAR — DISCOVER + SACOLA COM BADGE (Idêntico ao Mockup)
           ========================================================================= */}
        <header className="flex items-center justify-between pt-1 pb-1">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#111827]">Discover</h1>
            {/* Tag sutil de localidade do DF para garantia de entrega rápida */}
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-[#10B981] transition-colors mt-0.5 cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-[#10B981]" />
              <span>Entrega em: {selectedRegion.nome.split('(')[0].trim()}</span>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Abrir sacola de compras"
            className="relative w-11 h-11 rounded-full bg-[#F3F4F6] hover:bg-zinc-200 flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] text-white text-[10px] font-black flex items-center justify-center shadow-md animate-scaleIn">
                {cartCount}
              </span>
            )}
          </button>
        </header>

        {/* =========================================================================
            2. SEARCH BAR — PÍLULA SUAVE LIGHT (Idêntico ao Mockup)
           ========================================================================= */}
        <div className="relative flex items-center">
          <input
            id="rr-mobile-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#F3F4F6] text-[#111827] placeholder-zinc-400 text-sm pl-4 pr-11 py-3 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-4 pointer-events-none" />
        </div>

        {/* =========================================================================
            3. CLEARANCE SALES BANNER — VERDE ESMERALDA COM PRODUTO RECORTADO
           ========================================================================= */}
        <div
          onClick={() => {
            // Rola até o catálogo ou foca em destaques
            const el = document.getElementById('mobile-grid-start');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="relative overflow-hidden rounded-3xl bg-[#10B981] p-5 text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)] cursor-pointer active:scale-[0.99] transition-transform"
        >
          {/* Glow atmosférico suave */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between">
            {/* Lado Esquerdo: Textos do Banner */}
            <div className="max-w-[60%] space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                Clearance
                <br />
                Sales
              </h2>

              <div className="inline-flex items-center gap-1 bg-white text-[#111827] font-black text-[11px] px-3 py-1 rounded-full shadow-sm">
                <Percent className="w-3 h-3 text-[#10B981] stroke-[3]" />
                <span>Up to 50%</span>
              </div>
            </div>

            {/* Lado Direito: Imagem Recortada em Destaque (iPhone / Apple) */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 -mr-1 shrink-0 flex items-center justify-center">
              <Image
                src="/apple-cutouts/ip17pm-silver.png"
                alt="Clearance Sales"
                width={160}
                height={160}
                priority
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. CATEGORIES — CABEÇALHO COM "SEE ALL" + PÍLULAS HORIZONTAIS
           ========================================================================= */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-black text-[#111827] tracking-tight">Categories</h3>
            <button
              type="button"
              onClick={() => {
                setActiveSubFilter('All');
                onSelectCategory('Todos');
              }}
              className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Pílulas de categorias horizontais (sem scrollbar) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {MOBILE_CATEGORY_PILLS.map((pill) => {
              const isActive = activeSubFilter === pill.label;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handlePillClick(pill.label, pill.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#10B981] text-white shadow-sm'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 active:bg-zinc-50'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Marcador para rolagem suave */}
        <div id="mobile-grid-start" />

        {/* =========================================================================
            5. PRODUCT GRID — 2 COLUNAS CLEAN & MINIMALIST (Idêntico ao Mockup)
           ========================================================================= */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          {filteredProducts.slice(0, 40).map((product) => {
            const cleanName = product.nome
              .replace(/\(.*?\)/g, '')
              .replace(/Apple\s+/i, '')
              .trim();

            return (
              <article
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white rounded-2xl flex flex-col justify-between border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.98] cursor-pointer overflow-hidden p-2.5"
              >
                {/* Imagem em Quadro Cinza Claro (#F5F5F7) */}
                <div className="w-full bg-[#F5F5F7] rounded-xl aspect-square p-2.5 flex items-center justify-center relative overflow-hidden mb-2">
                  <Image
                    src={product.imagem}
                    alt={product.nome}
                    width={180}
                    height={180}
                    loading="lazy"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge sutil de Oferta se houver desconto */}
                  {product.precoDe > product.precoPix && (
                    <span className="absolute top-1.5 left-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      Oferta
                    </span>
                  )}
                </div>

                {/* Informações: Linha 1 Nome e Estrela | Linha 2 Preço */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-semibold text-zinc-700 truncate flex-1">
                      {cleanName}
                    </h4>
                    <div className="flex items-center gap-0.5 text-[11px] font-bold text-zinc-900 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.avaliacao.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="text-sm font-black text-[#111827] tracking-tight">
                      {formatBRL(product.precoPix)}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#10B981]">PIX</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-zinc-400 space-y-2">
            <p className="text-sm font-bold text-zinc-600">Nenhum produto encontrado</p>
            <p className="text-xs">Tente buscar por outro termo ou limpar os filtros.</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setActiveSubFilter('All');
                onSelectCategory('Todos');
              }}
              className="mt-2 text-xs font-black text-[#10B981] underline"
            >
              Ver todos os produtos
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. BOTTOM NAVIGATION DOCKED BAR — BRANCO COM TABS (Idêntico ao Mockup)
         ========================================================================= */}
      <nav
        aria-label="Navegação mobile estilo Pinterest"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-6 py-2 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Tab 1: Home (Ativa em Verde) */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveSubFilter('All');
              onSelectCategory('Todos');
            }}
            className="flex flex-col items-center gap-0.5 text-[#10B981] cursor-pointer"
          >
            <Home className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Tab 2: Search */}
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('rr-mobile-search-input');
              if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium text-zinc-600">Search</span>
          </button>

          {/* Tab 3: Favorites / Trade-In Troca Fácil */}
          <button
            type="button"
            onClick={() => onOpenTradeIn?.()}
            className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium text-zinc-600">Favorites</span>
          </button>

          {/* Tab 4: Profile / WhatsApp */}
          <a
            href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact('Mobile Pinterest Tab Zap')}
            className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-[#10B981] transition-colors cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium text-zinc-600">WhatsApp</span>
          </a>
        </div>
      </nav>

      {/* Modal / Bottom Sheet de Seleção de Região DF no Mobile */}
      {isRegionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsRegionModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#10B981]" />
                <h4 className="text-base font-black text-zinc-950">Localidade de Entrega (DF)</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 py-2">
              Selecione sua Região Administrativa para entregas rápidas via motoboy hoje:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {regions.map((reg) => {
                const isSelected = reg.id === selectedRegion.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      onSelectRegion?.(reg);
                      setIsRegionModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#10B981] bg-[#10B981]/10 text-zinc-950 font-bold'
                        : 'border-zinc-100 bg-[#F9FAFB] text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-950">{reg.nome}</p>
                      <p className="text-[11px] text-zinc-400">
                        {reg.tempoEstimado} • Grátis acima de {formatBRL(reg.freteGratisAcimaDe)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#10B981]">
                        {formatBRL(reg.taxaEntrega)}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#10B981] ml-auto mt-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
