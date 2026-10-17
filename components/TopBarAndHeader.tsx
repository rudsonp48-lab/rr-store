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
      {/* 2.1 Top Bar Oficial em Verde #10B981 (Compacta no Mobile) */}
      <div className="bg-[#10B981] text-[#0A0A0A] border-b border-[#34D399]/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-[11px] sm:text-sm font-extrabold tracking-tight flex-1 sm:flex-initial truncate">
            🚀 Motoboy no mesmo dia em Brasília-DF • 💳 5% OFF PIX ou 12x
          </p>
          <div className="hidden lg:flex items-center gap-4 text-xs font-bold">
            <span className="inline-flex items-center gap-1 bg-[#0A0A0A] text-[#34D399] px-2.5 py-0.5 rounded-full">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Despacho em até 30 min
            </span>
          </div>
        </div>
      </div>

      {/* Header Principal Sticky com Glassmorphism (Ergonômico Mobile-First) */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/92 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          {/* Linha 1: Logo 3D + Seletor DF + Busca Desktop + Ações */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
            {/* Logo RR Store / RR Mobile 3D Interativa */}
            <InteractiveLogo3D
              variant="header"
              onClickHeader={() => {
                onSelectCategory('Todos');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Seletor Rápido de Região no Mobile (Compact Pill) */}
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              className="lg:hidden flex items-center gap-1 bg-[#121212] active:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-white/10 text-left max-w-[140px] xs:max-w-[170px] shrink"
              title="Trocar Região Administrativa do DF"
            >
              <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <div className="truncate leading-tight">
                <span className="block text-[9px] text-zinc-400">Entregar em:</span>
                <span className="block text-[11px] font-extrabold text-[#34D399] truncate">
                  {selectedRegion.nome.split('(')[0].trim()}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            {/* Seletor de Região / CEP (Desktop) */}
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              className="hidden lg:flex items-center gap-2.5 bg-[#121212] hover:bg-zinc-900 text-left px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#10B981]/50 transition-all shrink-0 group cursor-pointer"
              title="Alterar Região Administrativa de entrega no DF"
            >
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="text-[11px] text-zinc-400 block font-medium">
                  Entregar em: <strong className="text-[#34D399]">Brasília - DF</strong>
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1 max-w-[165px] truncate">
                  {selectedRegion.nome}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </span>
              </div>
            </button>

            {/* Barra de Busca Inteligente (Visível na Linha 1 em Telas Médias/Grandes) */}
            <div className="hidden md:block flex-1 max-w-xl relative">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar por produto, departamento ou marca (ex: Creatina, Fone, MagSafe)..."
                  className="motion-input-focus w-full bg-[#121212] text-white placeholder-zinc-500 text-sm pl-10 pr-24 py-2.5 rounded-xl border border-white/15 focus:outline-none"
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

            {/* Ações Direita: Atendimento Rápido WhatsApp + Carrinho */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-2 bg-[#121212] hover:bg-[#10B981]/15 text-white hover:text-[#34D399] border border-white/10 hover:border-[#10B981]/50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#10B981]" />
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-zinc-400 font-normal">Dúvidas?</span>
                  <span>Atendimento DF</span>
                </div>
              </a>

              {/* Botão do Carrinho com Contador Dinâmico (Touch-Target >= 44px) */}
              <button
                type="button"
                onClick={onOpenCart}
                className="touch-target relative inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-extrabold px-3 sm:px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
                aria-label="Abrir carrinho de compras"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-[#0A0A0A] text-[#34D399] border border-[#34D399] text-[11px] font-black flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                </div>
                <div className="hidden sm:block text-left leading-tight pl-1">
                  <span className="block text-[10px] uppercase tracking-wider text-[#0A0A0A]/80 font-extrabold">
                    Carrinho
                  </span>
                  <span className="text-xs font-black text-[#0A0A0A]">
                    {cartCount > 0 ? formatBRL(cartSubtotal) : 'Vazio'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Linha 2 Exclusiva Mobile: Barra de Busca Full-Width (16px font para evitar auto-zoom no iOS) */}
          <div className="mt-2 md:hidden relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              id="rr-mobile-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="O que você precisa hoje em Brasília?"
              className="w-full bg-[#121212] text-white placeholder-zinc-500 text-base pl-10 pr-16 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-[#10B981]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 bg-zinc-800 text-zinc-200 text-xs font-bold px-2.5 py-1 rounded-lg"
              >
                Limpar
              </button>
            ) : (
              <span className="absolute right-2.5 text-[10px] font-bold text-[#34D399] bg-[#10B981]/10 px-2 py-0.5 rounded-md pointer-events-none flex items-center gap-1">
                <Truck className="w-3 h-3" /> Hoje
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Modal / Bottom Sheet Mobile de Seleção de Região Administrativa do DF */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#121212] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 pb-safe text-white shadow-2xl relative max-h-[88vh] flex flex-col">
            {/* Indicador de Drag Mobile */}
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
