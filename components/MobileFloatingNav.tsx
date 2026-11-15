'use client';

import React from 'react';
import { Home, LayoutGrid, BarChart2, User } from 'lucide-react';

export type MobileNavTab = 'home' | 'catalog' | 'compare' | 'account';

interface MobileFloatingNavProps {
  activeTab: MobileNavTab;
  onHome: () => void;
  onCatalog: () => void;
  onCompare: () => void;
  onAccount: () => void;
}

export default function MobileFloatingNav({
  activeTab,
  onHome,
  onCatalog,
  onCompare,
  onAccount,
}: MobileFloatingNavProps) {
  const itemClass = (isActive: boolean) =>
    `w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
      isActive
        ? 'bg-white text-[#11131D] shadow-md'
        : 'text-white/85 hover:text-white'
    }`;

  return (
    <nav
      aria-label="Menu principal mobile"
      className="md:hidden fixed bottom-3.5 left-1/2 -translate-x-1/2 z-[60] bg-[#11131D] rounded-full p-1.5 flex items-center gap-3.5 shadow-[0_14px_34px_rgba(17,19,29,0.45)] border border-white/10"
    >
      <button
        type="button"
        onClick={onHome}
        aria-label="Início"
        className={itemClass(activeTab === 'home')}
      >
        <Home className="w-5 h-5 stroke-[2]" />
      </button>

      <button
        type="button"
        onClick={onCatalog}
        aria-label="Catálogo e Categorias"
        className={itemClass(activeTab === 'catalog')}
      >
        <LayoutGrid className="w-5 h-5 stroke-[2]" />
      </button>

      <button
        type="button"
        onClick={onCompare}
        aria-label="Comparar Aparelhos"
        className={itemClass(activeTab === 'compare')}
      >
        <span className="w-[22px] h-[22px] rounded-[6px] border-[1.8px] border-current flex items-center justify-center">
          <BarChart2 className="w-3.5 h-3.5 stroke-[2.2]" />
        </span>
      </button>

      <button
        type="button"
        onClick={onAccount}
        aria-label="Opções e Sacola"
        className={itemClass(activeTab === 'account')}
      >
        <User className="w-5 h-5 stroke-[2]" />
      </button>
    </nav>
  );
}
