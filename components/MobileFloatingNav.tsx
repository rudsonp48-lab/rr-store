'use client';

import React from 'react';
import { Home, ShoppingBag, ArrowLeftRight, Menu } from 'lucide-react';

export type MobileNavTab = 'home' | 'sales' | 'compare' | 'menu';

interface MobileFloatingNavProps {
  activeTab: MobileNavTab;
  cartCount?: number;
  onHome: () => void;
  onSales: () => void;
  onCompare: () => void;
  onMenu: () => void;
}

export default function MobileFloatingNav({
  activeTab,
  cartCount = 0,
  onHome,
  onSales,
  onCompare,
  onMenu,
}: MobileFloatingNavProps) {
  const itemClass = (isActive: boolean) =>
    `relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none ${
      isActive
        ? 'bg-white text-[#11131D] shadow-md'
        : 'text-white/85 hover:text-white'
    }`;

  return (
    <nav
      aria-label="Menu principal mobile"
      className="md:hidden fixed bottom-3.5 left-1/2 -translate-x-1/2 z-[60] bg-[#11131D] rounded-full p-1.5 flex items-center gap-3.5 shadow-[0_14px_34px_rgba(17,19,29,0.45)] border border-white/10"
    >
      {/* Casinha: Voltar para Página Inicial */}
      <button
        type="button"
        onClick={onHome}
        aria-label="Página inicial"
        className={itemClass(activeTab === 'home')}
      >
        <Home className="w-5 h-5 stroke-[2]" />
      </button>

      {/* Venda / Sacola */}
      <button
        type="button"
        onClick={onSales}
        aria-label="Sacola e compras"
        className={itemClass(activeTab === 'sales')}
      >
        <ShoppingBag className="w-5 h-5 stroke-[2]" />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#7C4DFF] text-white text-[9px] font-black flex items-center justify-center border border-[#11131D]">
            {cartCount}
          </span>
        )}
      </button>

      {/* Comparador / Troca */}
      <button
        type="button"
        onClick={onCompare}
        aria-label="Comparar aparelhos"
        className={itemClass(activeTab === 'compare')}
      >
        <ArrowLeftRight className="w-5 h-5 stroke-[2]" />
      </button>

      {/* Menu Geral da Loja */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="Menu da loja"
        className={itemClass(activeTab === 'menu')}
      >
        <Menu className="w-5 h-5 stroke-[2.2]" />
      </button>
    </nav>
  );
}
