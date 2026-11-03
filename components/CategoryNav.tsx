'use client';

import React from 'react';
import {
  LayoutGrid,
  Smartphone,
  Lightbulb,
  Dumbbell,
  Flame,
  Sparkles,
  Home,
  PawPrint,
  Baby,
  Watch,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { CategoryId, Product } from '../types/store';
import { CATEGORIES } from '../data/mockData';

interface CategoryNavProps {
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  products: Product[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Smartphone,
  Lightbulb,
  Dumbbell,
  Flame,
  Sparkles,
  Home,
  PawPrint,
  Baby,
  Watch,
  BookOpen,
};

export default function CategoryNav({
  selectedCategory,
  onSelectCategory,
  products,
}: CategoryNavProps) {
  const getCategoryCount = (catId: CategoryId) => {
    if (catId === 'Todos') return products.length;
    return products.filter((p) => p.categoria === catId).length;
  };

  return (
    <section id="departamentos" className="bg-[#121212] border-b border-white/10 py-3 sm:py-7">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* MOBILE: fileira de ícones circulares (estilo app) */}
        <div className="sm:hidden flex overflow-x-auto no-scrollbar gap-3.5 -mx-3 px-3 pb-1">
          {CATEGORIES.map((cat) => {
            const IconComponent = iconMap[cat.icone] || LayoutGrid;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 w-[62px] active:scale-95 transition-transform cursor-pointer"
              >
                <span
                  className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-[#10B981] border-[#34D399] text-[#0A0A0A] shadow-[0_0_18px_rgba(16,185,129,0.45)]'
                      : 'bg-[#0A0A0A] border-white/15 text-[#34D399]'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </span>
                <span
                  className={`text-xs font-bold text-center leading-tight line-clamp-1 w-full ${
                    isSelected ? 'text-[#34D399]' : 'text-zinc-300'
                  }`}
                >
                  {cat.nome.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-end justify-between gap-2 mb-3.5 sm:mb-5">
          <div>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#10B981]">
              Navegue por Departamento
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Departamentos Oficiais da RR Store
            </h2>
          </div>
          <p className="hidden sm:block text-xs text-zinc-400">
            Toque em um departamento para filtrar os produtos em tempo real
          </p>
        </div>

        {/* Grid Responsivo no Tablet/Desktop (no celular usa a fileira circular acima) */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const IconComponent = iconMap[cat.icone] || LayoutGrid;
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`snap-start group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shrink-0 w-[148px] xs:w-[158px] sm:w-auto active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-[#10B981] border-[#34D399] text-[#0A0A0A] shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                    : 'bg-[#0A0A0A] hover:bg-zinc-900/90 border-white/10 hover:border-[#10B981]/50 text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-[#34D399]'
                        : 'bg-[#121212] text-[#10B981] border border-white/10 group-hover:border-[#10B981]/40'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#0A0A0A]/15 text-[#0A0A0A]'
                        : 'bg-white/5 text-zinc-400 group-hover:text-[#34D399]'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div>
                  <h3
                    className={`text-xs sm:text-[13px] font-extrabold leading-snug line-clamp-1 ${
                      isSelected ? 'text-[#0A0A0A]' : 'text-white group-hover:text-[#34D399]'
                    }`}
                  >
                    {cat.nome}
                  </h3>
                  <p
                    className={`text-[10px] sm:text-[11px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-[#0A0A0A]/80 font-medium' : 'text-zinc-400'
                    }`}
                  >
                    {cat.subtitulo}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
