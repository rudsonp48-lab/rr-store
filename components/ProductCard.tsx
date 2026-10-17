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
}

export default function ProductCard({
  product,
  selectedRegion,
  onAddToCart,
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
    <article className="group bg-[#FFFFFF] rounded-2xl border border-zinc-200/90 hover:border-[#10B981] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden">
      {/* Container da Imagem com Zoom Suave no Hover */}
      <div className="relative aspect-[4/3] w-full bg-[#F8F9FA] overflow-hidden">
        <img
          src={product.imagem}
          alt={product.nome}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradiente sutil superior para leitura perfeita das badges */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

        {/* Badges no Topo: Categoria + Tag de Destaque */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0A0A0A]/85 text-white backdrop-blur-md border border-white/15 truncate max-w-[65%]">
            {product.categoria}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#10B981] text-[#0A0A0A] shadow-md shrink-0">
            <Zap className="w-3 h-3 fill-current" />
            {product.tag}
          </span>
        </div>

        {/* Badge de Economia Total (De -> Pix) no canto inferior esquerdo da imagem */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-[#0A0A0A] text-[#34D399] border border-[#10B981]/40">
            -{discountPercent}% OFF Total
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-zinc-800 shadow-sm">
            <Truck className="w-3 h-3 text-[#059669]" />
            Chega Hoje no DF
          </span>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-[#FFFFFF]">
        <div>
          {/* Avaliação em Estrelas */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-xs font-extrabold text-zinc-900 ml-1">
                {product.avaliacao.toFixed(1)}
              </span>
              <span className="text-[11px] text-zinc-500">
                ({product.avaliacoesCount})
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Em estoque ({product.estoque})
            </span>
          </div>

          {/* Título do Produto */}
          <h3 className="text-sm sm:text-base font-extrabold text-[#0A0A0A] group-hover:text-[#059669] transition-colors line-clamp-2 leading-snug mb-1.5">
            {product.nome}
          </h3>

          {/* Descrição Curta */}
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
            {product.descricao}
          </p>
        </div>

        <div>
          {/* Bloco de Preços: De / PIX em Destaque / Parcelamento */}
          <div className="bg-[#F8F9FA] rounded-xl p-3 border border-zinc-200/80 mb-3.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-0.5">
              <span>
                De{' '}
                <del className="font-semibold text-zinc-400">
                  {formatBRL(product.precoDe)}
                </del>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#059669] bg-[#10B981]/15 px-2 py-0.5 rounded-md">
                5% OFF no PIX
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[#059669] tracking-tight">
                {formatBRL(product.precoPix)}
              </span>
              <span className="text-xs font-bold text-[#059669]">à vista no PIX</span>
            </div>

            <div className="mt-1 pt-1 border-t border-zinc-200/70 flex items-center justify-between text-[11px] text-zinc-600">
              <span>
                Cartão: <strong className="text-zinc-900">{formatBRL(product.precoPor)}</strong>
              </span>
              <span className="font-semibold text-zinc-700">{product.parcelamento}</span>
            </div>
          </div>

          {/* Dois Botões de Ação no Card */}
          <div className="space-y-2">
            <button
              onClick={handleAdd}
              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                justAdded
                  ? 'bg-[#0A0A0A] text-[#34D399] shadow-md'
                  : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.45)] active:scale-98'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Adicionado ao Carrinho!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>Adicionar ao Carrinho</span>
                </>
              )}
            </button>

            <a
              href={buildSingleProductWhatsAppUrl(product, selectedRegion.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#0A0A0A] hover:bg-zinc-800 text-white flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#34D399]" />
              <span>Comprar via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
