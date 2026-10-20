'use client';

import React from 'react';
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DFRegion } from '../types/store';
import { formatBRL } from '../data/mockData';

interface MobileBottomBarProps {
  cartCount: number;
  cartSubtotalPix: number;
  cartSubtotalRaw: number;
  selectedRegion: DFRegion;
  onOpenCart: () => void;
  onHomeClick: () => void;
  onCategoriesClick: () => void;
  onSearchClick: () => void;
}

export default function MobileBottomBar({
  cartCount,
  cartSubtotalPix,
  cartSubtotalRaw,
  selectedRegion,
  onOpenCart,
  onHomeClick,
  onCategoriesClick,
  onSearchClick,
}: MobileBottomBarProps) {
  const isFreeShipping =
    cartSubtotalRaw >= selectedRegion.freteGratisAcimaDe && cartCount > 0;
  const missingForFree = Math.max(
    0,
    selectedRegion.freteGratisAcimaDe - cartSubtotalRaw
  );

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      {/* Barra Flutuante de Fechamento Rápido (Aparece quando há itens no carrinho) */}
      {cartCount > 0 && (
        <div className="px-3 pb-2 pointer-events-auto">
          <div
            onClick={onOpenCart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenCart()}
            className="w-full bg-gradient-to-r from-[#121212] via-[#0A0A0A] to-[#121212] border-2 border-[#10B981] rounded-2xl p-3 shadow-[0_-8px_30px_rgba(16,185,129,0.35)] flex items-center justify-between gap-2 active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-10 h-10 rounded-xl bg-[#10B981] text-[#0A0A0A] font-black flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0A0A0A] text-[#34D399] border border-[#34D399] text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-[#34D399]">
                    {formatBRL(cartSubtotalPix)}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    no PIX (5% OFF)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 truncate flex items-center gap-1">
                  {isFreeShipping ? (
                    <span className="text-[#34D399] font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Frete Grátis liberado no DF!
                    </span>
                  ) : (
                    <span>
                      Faltam <strong className="text-[#34D399]">{formatBRL(missingForFree)}</strong> p/ Frete Grátis
                    </span>
                  )}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 bg-[#10B981] text-[#0A0A0A] font-black text-xs px-3.5 py-2.5 rounded-xl shrink-0 shadow-md">
              <span>Fechar Pedido</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior Estilo App Nativo (Thumb Zone) */}
      <nav
        aria-label="Navegação rápida mobile"
        className="pointer-events-auto bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/15 px-2 pt-1.5 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.85)]"
      >
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={onHomeClick}
            className="touch-target flex flex-col items-center justify-center py-1 rounded-xl text-zinc-300 active:text-[#34D399] active:bg-white/5 transition-colors"
          >
            <Home className="w-5 h-5 text-[#10B981]" />
            <span className="text-[10px] font-bold mt-0.5">Início</span>
          </button>

          <button
            type="button"
            onClick={onCategoriesClick}
            className="touch-target flex flex-col items-center justify-center py-1 rounded-xl text-zinc-300 active:text-[#34D399] active:bg-white/5 transition-colors"
          >
            <LayoutGrid className="w-5 h-5 text-zinc-300" />
            <span className="text-[10px] font-bold mt-0.5">Departamentos</span>
          </button>

          <button
            type="button"
            onClick={onSearchClick}
            className="touch-target flex flex-col items-center justify-center py-1 rounded-xl text-zinc-300 active:text-[#34D399] active:bg-white/5 transition-colors"
          >
            <Search className="w-5 h-5 text-zinc-300" />
            <span className="text-[10px] font-bold mt-0.5">Buscar</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="touch-target relative flex flex-col items-center justify-center py-1 rounded-xl text-zinc-300 active:text-[#34D399] active:bg-white/5 transition-colors"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#34D399]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#10B981] text-[#0A0A0A] text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-extrabold text-[#34D399] mt-0.5">
              Sacola
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
