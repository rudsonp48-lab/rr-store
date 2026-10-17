'use client';

import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ShoppingBag,
  MessageCircle,
  Zap,
  ChevronDown,
  X,
  Check,
  Sparkles,
  Truck,
} from 'lucide-react';
import { CategoryId, DFRegion } from '../types/store';
import { DF_REGIONS, formatBRL } from '../data/mockData';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';
import InteractiveLogo3D from './InteractiveLogo3D';

interface TopBarAndHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  selectedRegion: DFRegion;
  onSelectRegion: (region: DFRegion) => void;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
}

export default function TopBarAndHeader({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  selectedRegion,
  onSelectRegion,
  cartCount,
  cartSubtotal,
  onOpenCart,
}: TopBarAndHeaderProps) {
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [cepInput, setCepInput] = useState('');

  const handleCepLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cepInput.replace(/\D/g, '');
    if (digits.startsWith('70') || digits.startsWith('71') || digits.startsWith('72')) {
      if (
        digits.startsWith('700') ||
        digits.startsWith('702') ||
        digits.startsWith('703') ||
        digits.startsWith('707') ||
        digits.startsWith('708')
      ) {
        const found = DF_REGIONS.find((r) => r.id === 'plano-piloto');
        if (found) onSelectRegion(found);
      } else if (digits.startsWith('719')) {
        const found = DF_REGIONS.find((r) => r.id === 'aguas-claras');
        if (found) onSelectRegion(found);
      } else if (digits.startsWith('720') || digits.startsWith('721')) {
        const found = DF_REGIONS.find((r) => r.id === 'taguatinga');
        if (found) onSelectRegion(found);
      } else if (digits.startsWith('710')) {
        const found = DF_REGIONS.find((r) => r.id === 'guara');
        if (found) onSelectRegion(found);
      } else if (digits.startsWith('716')) {
        const found = DF_REGIONS.find((r) => r.id === 'lago-sul');
        if (found) onSelectRegion(found);
      } else if (digits.startsWith('715')) {
        const found = DF_REGIONS.find((r) => r.id === 'lago-norte');
        if (found) onSelectRegion(found);
      }
      setIsRegionModalOpen(false);
    }
  };

  return (
    <>
      {/* 2.1 Top Bar Oficial em Verde #10B981 */}
      <div className="bg-[#10B981] text-[#0A0A0A] border-b border-[#34D399]/30">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-between gap-2">
          <p className="text-[11px] sm:text-xs md:text-sm font-extrabold tracking-tight truncate mx-auto sm:mx-0">
            🚀 Entrega Expressa via Motoboy hoje em Brasília-DF • 💳 5% OFF no PIX ou até 12x
          </p>
          <div className="hidden lg:flex items-center gap-3 text-xs font-bold shrink-0">
            <span className="inline-flex items-center gap-1 bg-[#0A0A0A] text-[#34D399] px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 fill-current" />
              Despacho em 30 min
            </span>
          </div>
        </div>
      </div>

      {/* Header Principal Sticky Ultra-Moderno com Glassmorphism */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3">
          {/* Linha 1: Brand 3D com a Logo Oficial + Região + Busca (Desktop) + Sacola */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-5">
            {/* Logo Oficial RR Mobile em 3D Interativo no Canto Superior Esquerdo */}
            <InteractiveLogo3D
              variant="header"
              onClickHeader={() => {
                onSelectCategory('Todos');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Seletor de Região DF (Mobile & Desktop Sem Cortar!) */}
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              className="flex items-center gap-2 bg-[#121212] hover:bg-zinc-900 active:scale-98 px-3 py-2 rounded-xl border border-white/10 hover:border-[#10B981]/50 transition-all min-w-0 max-w-[165px] xs:max-w-[200px] sm:max-w-[230px] cursor-pointer"
              title="Alterar Região Administrativa de entrega no DF"
            >
              <MapPin className="w-4 h-4 text-[#10B981] shrink-0" />
              <div className="truncate text-left leading-tight">
                <span className="block text-[10px] text-zinc-400 font-medium">
                  Entregar em:
                </span>
                <span className="block text-xs font-bold text-white truncate">
                  {selectedRegion.nome.split('(')[0].trim()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            {/* Barra de Busca Inteligente (Desktop) */}
            <div className="hidden md:block flex-1 max-w-xl relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar produtos, marcas ou departamentos (ex: Fone TWS, Creatina, Sérum)..."
                  className="motion-input-focus w-full bg-[#121212] text-white placeholder-zinc-500 text-sm pl-10 pr-24 py-2.5 rounded-xl border border-white/10 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 inline-flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 absolute right-3 text-[11px] font-semibold text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-md pointer-events-none">
                    <Sparkles className="w-3 h-3" />
                    10 Nichos
                  </span>
                )}
              </div>
            </div>

            {/* Ações Direita: Consultor + Carrinho */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-2 bg-[#121212] hover:bg-[#10B981]/15 text-white hover:text-[#34D399] border border-white/10 hover:border-[#10B981]/50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#10B981]" />
                <span>WhatsApp DF</span>
              </a>

              <button
                type="button"
                onClick={onOpenCart}
                className="touch-target relative inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black px-3.5 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label="Abrir carrinho de compras"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="text-xs font-black bg-[#0A0A0A] text-[#34D399] px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
                <span className="hidden sm:inline text-xs font-black">
                  {cartCount > 0 ? formatBRL(cartSubtotal) : 'Sacola'}
                </span>
              </button>
            </div>
          </div>

          {/* Linha 2 (Mobile): Barra de Busca Full-Width Limpa e Moderna */}
          <div className="mt-2.5 md:hidden relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              id="rr-mobile-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar na RR Store (ex: Creatina, Fone, Potes)..."
              className="w-full bg-[#121212] text-white placeholder-zinc-500 text-base pl-10 pr-20 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#10B981]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 bg-zinc-800 text-zinc-200 text-xs font-bold px-2.5 py-1 rounded-lg"
              >
                Limpar
              </button>
            ) : (
              <span className="absolute right-2.5 text-[11px] font-bold text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-lg pointer-events-none flex items-center gap-1">
                <Truck className="w-3 h-3" /> Hoje
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Modal / Bottom Sheet de Seleção de Região Administrativa do DF */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#121212] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 pb-safe text-white shadow-2xl relative max-h-[88vh] flex flex-col">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

            <button
              type="button"
              onClick={() => setIsRegionModalOpen(false)}
              className="touch-target absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              aria-label="Fechar seletor de região"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Sua Região em Brasília / DF
                </h3>
                <p className="text-xs text-zinc-400">
                  Escolha sua RA para calcular a taxa de motoboy e frete grátis.
                </p>
              </div>
            </div>

            <form onSubmit={handleCepLookup} className="mb-3.5 flex gap-2">
              <input
                type="tel"
                inputMode="numeric"
                value={cepInput}
                onChange={(e) => setCepInput(e.target.value)}
                placeholder="Digite seu CEP do DF (ex: 70200-000)"
                maxLength={9}
                className="flex-1 bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
              />
              <button
                type="submit"
                className="touch-target bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Aplicar CEP
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {DF_REGIONS.map((region) => {
                const isSelected = region.id === selectedRegion.id;
                return (
                  <button
                    type="button"
                    key={region.id}
                    onClick={() => {
                      onSelectRegion(region);
                      setIsRegionModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                        : 'bg-[#0A0A0A] border-white/10 active:bg-white/5 text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs sm:text-sm font-bold flex flex-wrap items-center gap-1.5">
                        <span className="truncate">{region.nome}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-[#10B981] text-[#0A0A0A] font-black px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" /> Atual
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        ⚡ {region.tempoEstimado} • Grátis acima de{' '}
                        {formatBRL(region.freteGratisAcimaDe)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#34D399] block">
                        {formatBRL(region.taxaEntrega)}
                      </span>
                      <span className="text-[10px] text-zinc-500">Motoboy</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
