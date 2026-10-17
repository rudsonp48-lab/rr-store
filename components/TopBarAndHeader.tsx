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
import { CATEGORIES, DF_REGIONS, formatBRL } from '../data/mockData';
import { buildConsultantWhatsAppUrl } from '../data/whatsappUtils';

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
  selectedCategory,
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
    if (digits.startsWith('70') || digits.startsWith('71')) {
      // Map common DF CEP prefixes to regions
      if (digits.startsWith('700') || digits.startsWith('702') || digits.startsWith('703') || digits.startsWith('707') || digits.startsWith('708')) {
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
      <div className="bg-[#10B981] text-[#0A0A0A] border-b border-[#34D399]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <p className="text-xs sm:text-sm font-extrabold tracking-tight flex items-center justify-center gap-1.5">
            <span>🚀 Entrega Expressa via Motoboy no mesmo dia para toda Brasília e DF</span>
            <span className="hidden md:inline-block mx-1.5 opacity-40">|</span>
            <span className="hidden md:inline-block">💳 5% OFF no PIX ou em até 12x no Cartão</span>
          </p>
          <p className="md:hidden text-[11px] font-bold bg-[#0A0A0A]/10 px-2.5 py-0.5 rounded-full">
            💳 5% OFF no PIX ou em até 12x no Cartão
          </p>
          <div className="hidden lg:flex items-center gap-4 text-xs font-bold">
            <span className="inline-flex items-center gap-1 bg-[#0A0A0A] text-[#34D399] px-2.5 py-0.5 rounded-full">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Despacho em até 30 min
            </span>
          </div>
        </div>
      </div>

      {/* Header Principal Sticky com Glassmorphism */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Logo RR Store */}
            <button
              onClick={() => {
                onSelectCategory('Todos');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left group shrink-0 focus:outline-none"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_32px_rgba(52,211,153,0.65)] transition-all duration-300">
                <span className="text-[#0A0A0A] font-black text-xl tracking-tighter">RR</span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-[#34D399] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    RR <span className="text-[#10B981]">Store</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-[#34D399] rounded-md border border-[#10B981]/30">
                    DF
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                  Multidepartamentos • Entrega Hoje
                </p>
              </div>
            </button>

            {/* Seletor de Região / CEP (Desktop & Tablet) */}
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="hidden lg:flex items-center gap-2.5 bg-[#121212] hover:bg-zinc-900 text-left px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#10B981]/50 transition-all shrink-0 group"
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

            {/* Barra de Busca Inteligente em Tempo Real */}
            <div className="flex-1 max-w-xl relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar por produto, departamento ou marca (ex: Creatina, Fone, Potes, Sérum)..."
                  className="w-full bg-[#121212] text-white placeholder-zinc-500 text-xs sm:text-sm pl-10 pr-20 py-2.5 sm:py-3 rounded-xl border border-white/15 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 transition-all"
                />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 inline-flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 absolute right-3 text-[11px] font-semibold text-[#34D399] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-md pointer-events-none">
                    <Sparkles className="w-3 h-3" />
                    10 Nichos
                  </span>
                )}
              </div>
            </div>

            {/* Ações Direita: Atendimento Rápido WhatsApp + Carrinho */}
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={buildConsultantWhatsAppUrl(selectedRegion.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 bg-[#121212] hover:bg-[#10B981]/15 text-white hover:text-[#34D399] border border-white/10 hover:border-[#10B981]/50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#10B981]" />
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-zinc-400 font-normal">Dúvidas?</span>
                  <span>Atendimento DF</span>
                </div>
              </a>

              {/* Botão do Carrinho com Contador Dinâmico */}
              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-extrabold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(52,211,153,0.5)] transition-all active:scale-95 cursor-pointer"
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
                    Meu Carrinho
                  </span>
                  <span className="text-xs font-black text-[#0A0A0A]">
                    {cartCount > 0 ? formatBRL(cartSubtotal) : 'Vazio'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Barra Mobile de Região e Filtro Rápido */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between lg:hidden text-xs">
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-medium truncate"
            >
              <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Entregar em:</span>
              <strong className="text-[#34D399] underline decoration-[#10B981]/50 truncate">
                {selectedRegion.nome} - DF
              </strong>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            <span className="text-[11px] text-zinc-400 font-semibold shrink-0 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#10B981]" />
              {selectedRegion.tempoEstimado.split('(')[0]}
            </span>
          </div>
        </div>
      </header>

      {/* Modal de Seleção de Região Administrativa do DF / CEP */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRegionModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Onde você está em Brasília / DF?
                </h3>
                <p className="text-xs text-zinc-400">
                  Selecione sua Região Administrativa para calcular taxa de motoboy e prazo no mesmo dia.
                </p>
              </div>
            </div>

            <form onSubmit={handleCepLookup} className="mb-4 flex gap-2">
              <input
                type="text"
                value={cepInput}
                onChange={(e) => setCepInput(e.target.value)}
                placeholder="Digite seu CEP do DF (ex: 70200-000 ou 71900-000)"
                maxLength={9}
                className="flex-1 bg-[#0A0A0A] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10B981]"
              />
              <button
                type="submit"
                className="bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Aplicar CEP
              </button>
            </form>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {DF_REGIONS.map((region) => {
                const isSelected = region.id === selectedRegion.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => {
                      onSelectRegion(region);
                      setIsRegionModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                        : 'bg-[#0A0A0A] border-white/10 hover:border-white/25 text-zinc-300'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold flex items-center gap-2">
                        {region.nome}
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-[#10B981] text-[#0A0A0A] font-black px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" /> Selecionado
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        ⚡ {region.tempoEstimado} • Frete Grátis acima de {formatBRL(region.freteGratisAcimaDe)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="text-xs font-extrabold text-[#34D399] block">
                        {formatBRL(region.taxaEntrega)}
                      </span>
                      <span className="text-[10px] text-zinc-500">Taxa fixa</span>
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
