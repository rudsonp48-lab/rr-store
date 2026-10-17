'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Star,
  Zap,
  Check,
  Truck,
} from 'lucide-react';
import { DFRegion, Product } from '../types/store';
import { formatBRL } from '../data/mockData';
import { buildSingleProductWhatsAppUrl } from '../data/whatsappUtils';

interface ProductCardProps {
  product: Product;
  selectedRegion: DFRegion;
  onAddToCart: (product: Product) => void;
  compactMobile?: boolean;
}

export default function ProductCard({
  product,
  selectedRegion,
  onAddToCart,
  compactMobile = false,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const discountPercent = Math.round(
    ((product.precoDe - product.precoPix) / product.precoDe) * 100
  );

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article className="motion-hover-lift group h-full bg-[#FFFFFF] rounded-2xl border border-zinc-200/90 hover:border-[#10B981] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.22)] flex flex-col overflow-hidden">
      {/* Container da Imagem com Zoom Suave */}
      <div className="relative aspect-[4/3] w-full bg-[#F8F9FA] overflow-hidden">
        <img
          src={product.imagem}
          alt={product.nome}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

        {/* Badges no Topo */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
          <span
            className={`${
              compactMobile ? 'hidden sm:inline-flex' : 'inline-flex'
            } items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#0A0A0A]/85 text-white backdrop-blur-md border border-white/15 truncate max-w-[62%]`}
          >
            {product.categoria}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#10B981] text-[#0A0A0A] shadow-md shrink-0">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            {product.tag}
          </span>
        </div>

        {/* Badge de Economia Total */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black bg-[#0A0A0A] text-[#34D399] border border-[#10B981]/40">
            -{discountPercent}% OFF
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-white/95 text-zinc-800 shadow-sm">
            <Truck className="w-3 h-3 text-[#059669] shrink-0" />
            <span className={compactMobile ? 'hidden xs:inline' : ''}>Hoje no DF</span>
          </span>
        </div>
      </div>

      {/* Corpo do Card */}
      <div
        className={`${
          compactMobile ? 'p-3 sm:p-5' : 'p-4 sm:p-5'
        } flex-1 flex flex-col justify-between bg-[#FFFFFF]`}
      >
        <div>
          {/* Avaliação em Estrelas */}
          <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span
                  className={`${
                    compactMobile ? 'hidden sm:inline-flex' : 'inline-flex'
                  } items-center`}
                >
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold text-zinc-900">
                {product.avaliacao.toFixed(1)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-zinc-500">
                ({product.avaliacoesCount})
              </span>
            </div>
            <span
              className={`${
                compactMobile ? 'hidden sm:inline-block' : 'inline-block'
              } text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full`}
            >
              Estoque ({product.estoque})
            </span>
          </div>

          {/* Título do Produto */}
          <h3
            className={`${
              compactMobile ? 'text-xs sm:text-base' : 'text-sm sm:text-base'
            } font-extrabold text-[#0A0A0A] group-hover:text-[#059669] transition-colors line-clamp-2 leading-snug mb-1.5`}
          >
            {product.nome}
          </h3>

          {/* Descrição Curta */}
          <p
            className={`${
              compactMobile ? 'hidden sm: -webkit-box sm:line-clamp-2' : 'line-clamp-2'
            } text-xs text-zinc-600 leading-relaxed mb-3.5`}
          >
            {product.descricao}
          </p>
        </div>

        <div>
          {/* Bloco de Preços */}
          <div
            className={`bg-[#F8F9FA] rounded-xl ${
              compactMobile ? 'p-2.5 sm:p-3' : 'p-3'
            } border border-zinc-200/80 mb-3`}
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="truncate">
                De <del className="font-semibold">{formatBRL(product.precoDe)}</del>
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#059669] bg-[#10B981]/15 px-1.5 py-0.5 rounded shrink-0">
                -5% PIX
              </span>
            </div>

            <div className="flex items-baseline gap-1 flex-wrap">
              <span
                className={`${
                  compactMobile ? 'text-base sm:text-2xl' : 'text-xl sm:text-2xl'
                } font-black text-[#059669] tracking-tight`}
              >
                {formatBRL(product.precoPix)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#059669]">
                no PIX
              </span>
            </div>

            <div className="mt-1 pt-1 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-[11px] text-zinc-600">
              <span className="truncate font-semibold text-zinc-700">
                {product.parcelamento}
              </span>
            </div>
          </div>

          {/* Dois Botões de Ação Ergonômicos (Touch Target >= 42px) */}
          <div className="space-y-1.5 sm:space-y-2">
            <button
              type="button"
              onClick={handleAdd}
              className={`touch-target w-full py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                justAdded
                  ? 'bg-[#0A0A0A] text-[#34D399] shadow-md'
                  : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3] shrink-0" />
                  <span className="truncate">Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">
                    {compactMobile ? 'Por na Sacola' : 'Adicionar ao Carrinho'}
                  </span>
                </>
              )}
            </button>

            <a
              href={buildSingleProductWhatsAppUrl(product, selectedRegion.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-[#0A0A0A] hover:bg-zinc-800 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-[#34D399] shrink-0" />
              <span className="truncate">
                {compactMobile ? 'Comprar Zap' : 'Comprar via WhatsApp'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
