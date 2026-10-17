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
    <section id="departamentos" className="bg-[#121212] border-b border-white/10 py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#10B981]">
              Navegue por Departamento
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Os 10 Nichos Oficiais da RR Store
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Clique em um departamento para filtrar os produtos em tempo real
          </p>
        </div>

        {/* Grid/Carrossel Responsivo Mobile-First */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const IconComponent = iconMap[cat.icone] || LayoutGrid;
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 shrink-0 w-44 sm:w-auto cursor-pointer ${
                  isSelected
                    ? 'bg-[#10B981] border-[#34D399] text-[#0A0A0A] shadow-[0_0_25px_rgba(16,185,129,0.35)] -translate-y-0.5'
                    : 'bg-[#0A0A0A] hover:bg-zinc-900/90 border-white/10 hover:border-[#10B981]/50 text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-[#34D399]'
                        : 'bg-[#121212] text-[#10B981] border border-white/10 group-hover:border-[#10B981]/40'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#0A0A0A]/15 text-[#0A0A0A]'
                        : 'bg-white/5 text-zinc-400 group-hover:text-[#34D399]'
                    }`}
                  >
                    {count} {count === 1 ? 'item' : 'itens'}
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
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
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
