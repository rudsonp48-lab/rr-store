'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Star,
  Zap,
  Check,
  Truck,
  Eye,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { DFRegion, Product } from '../types/store';
import { formatBRL } from '../data/mockData';
import { buildSingleProductWhatsAppUrl } from '../data/whatsappUtils';
import {
  getProductVariantConfig,
  buildConfiguredProduct,
  ColorSwatch,
  StorageTier,
} from '../data/productVariantUtils';
import { trackAddToCart, trackContact } from '../lib/metaPixel';

interface ProductCardProps {
  product: Product;
  selectedRegion: DFRegion;
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onOpenTradeIn?: (product: Product) => void;
  compactMobile?: boolean;
  allProducts?: Product[];
}

function ProductCard({
  product,
  selectedRegion,
  onAddToCart,
  onSelectProduct,
  onOpenTradeIn,
  compactMobile = false,
  allProducts,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product>(product);

  // Sincroniza se o produto mudar externamente
  React.useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  // Variantes e Irmãos Reais do Catálogo
  const variantConfig = useMemo(
    () => getProductVariantConfig(activeProduct, allProducts),
    [activeProduct, allProducts]
  );
  const [selectedStorage, setSelectedStorage] = useState<StorageTier | null>(
    variantConfig.currentStorage
  );
  const [selectedColor, setSelectedColor] = useState<ColorSwatch | null>(
    variantConfig.currentColor
  );

  const isApple = activeProduct.id.startsWith('rr-apple-');
  const isOutOfStock = activeProduct.estoque <= 0;
  const cleanDescription = activeProduct.descricao.split(' | Pagamento:')[0];

  const discountPercent = Math.round(
    ((activeProduct.precoDe - activeProduct.precoPix) / activeProduct.precoDe) * 100
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      onSelectProduct?.(activeProduct);
      return;
    }
    trackAddToCart(activeProduct, 1);
    onAddToCart(activeProduct);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleTradeInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenTradeIn?.(activeProduct);
  };

  const handleSelectStorage = (tier: StorageTier, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tier.targetProductId && allProducts) {
      const brother = allProducts.find((p) => p.id === tier.targetProductId);
      if (brother) {
        setActiveProduct(brother);
        setSelectedStorage(tier);
        return;
      }
    }
    setSelectedStorage(tier);
  };

  const handleSelectColor = (color: ColorSwatch, e: React.MouseEvent) => {
    e.stopPropagation();
    if (color.targetProductId && allProducts) {
      const brother = allProducts.find((p) => p.id === color.targetProductId);
      if (brother) {
        setActiveProduct(brother);
        setSelectedColor(color);
        return;
      }
    }
    setSelectedColor(color);
  };

  return (
    <article
      onClick={() => onSelectProduct?.(product)}
      className="motion-hover-lift group h-full bg-[#FFFFFF] rounded-2xl border border-zinc-200/90 hover:border-[#10B981] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.22)] flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Container da Imagem com Zoom Suave */}
      <div
        className={`relative aspect-[4/3] w-full ${
          isApple ? 'bg-white p-3' : 'bg-[#F8F9FA]'
        } overflow-hidden`}
      >
        <img
          src={product.imagem}
          alt={product.nome}
          loading="lazy"
          decoding="async"
          className={`w-full h-full ${
            isApple ? 'object-contain' : 'object-cover'
          } object-center group-hover:scale-105 transition-transform duration-500 ease-out`}
        />

        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

        {/* Badges no Topo */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
          <span
            className={`${
              compactMobile ? 'hidden sm:inline-flex' : 'inline-flex'
            } items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#0A0A0A]/85 text-white backdrop-blur-md border border-white/15 truncate max-w-[62%]`}
          >
            {isApple ? '💎 Joias Apple' : product.categoria}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md shrink-0 ${
              isOutOfStock
                ? 'bg-amber-400 text-[#0A0A0A]'
                : 'bg-[#10B981] text-[#0A0A0A]'
            }`}
          >
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            {isOutOfStock ? 'Zerou Estoque' : product.tag}
          </span>
        </div>

        {/* Badge Preço de Atacado + Botão Rápido Ver Detalhes */}
        <div className={`absolute bottom-2 left-2.5 right-2.5 items-center justify-between gap-1 ${compactMobile ? 'hidden sm:flex' : 'flex'}`}>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black bg-[#0A0A0A] text-[#34D399] border border-[#10B981]/40">
            Preço de Atacado
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-white/95 text-zinc-800 shadow-sm border border-zinc-200/80">
            <Eye className="w-3 h-3 text-[#059669] shrink-0" />
            <span className={compactMobile ? 'hidden xs:inline' : ''}>Ver Informações</span>
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
            {isOutOfStock ? (
              <span
                className={`${
                  compactMobile ? 'hidden sm:inline-block' : 'inline-block'
                } text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full`}
              >
                Zerou
              </span>
            ) : (
              <span
                className={`${
                  compactMobile ? 'hidden sm:inline-block' : 'inline-block'
                } text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full`}
              >
                Estoque ({product.estoque})
              </span>
            )}
          </div>

          {/* Título do Produto */}
          <h3
            className={`${
              compactMobile ? 'text-xs sm:text-base' : 'text-sm sm:text-base'
            } font-extrabold text-[#0A0A0A] group-hover:text-[#059669] transition-colors line-clamp-2 leading-snug mb-1.5`}
          >
            {activeProduct.nome}
          </h3>

          {/* Descrição Curta */}
          <p
            className={`${
              compactMobile ? 'hidden sm:-webkit-box sm:line-clamp-2' : 'line-clamp-2'
            } text-xs text-zinc-600 leading-relaxed mb-2.5`}
          >
            {cleanDescription}
          </p>

          {/* ESPECIFICAÇÕES OFICIAIS & CORES REAIS (100% Autêntico) */}
          {(variantConfig.hasColorOptions ||
            variantConfig.currentColor ||
            variantConfig.hasStorageOptions ||
            variantConfig.officialSpecBadge) && (
            <div className="space-y-1.5 mb-2.5 pt-1.5 border-t border-zinc-100">
              {/* Opções Reais de Capacidade no Catálogo */}
              {variantConfig.hasStorageOptions && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-0.5">
                    Cap:
                  </span>
                  {variantConfig.availableStorages.map((tier) => {
                    const isSelected =
                      activeProduct.id === tier.targetProductId ||
                      selectedStorage?.id === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={(e) => handleSelectStorage(tier, e)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer shrink-0 border ${
                          isSelected
                            ? 'bg-[#0A0A0A] border-[#0A0A0A] text-[#34D399] shadow-xs'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Opções Reais de Cores no Catálogo */}
              {variantConfig.hasColorOptions ? (
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    {variantConfig.availableColors.map((color) => {
                      const isSelected =
                        activeProduct.id === color.targetProductId ||
                        selectedColor?.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          title={`Cor: ${color.name}`}
                          onClick={(e) => handleSelectColor(color, e)}
                          className={`w-4 h-4 rounded-full transition-all cursor-pointer relative ${
                            isSelected
                              ? 'ring-2 ring-[#10B981] ring-offset-2 scale-110 shadow-xs'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: color.hex,
                            border: color.borderHex
                              ? `1px solid ${color.borderHex}`
                              : '1px solid rgba(0,0,0,0.18)',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 truncate max-w-[120px] text-right">
                    {variantConfig.currentColor?.name || selectedColor?.name}
                  </span>
                </div>
              ) : variantConfig.currentColor ? (
                /* Cor Oficial Única do Modelo */
                <div className="flex items-center justify-between gap-1.5 py-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                      style={{
                        backgroundColor: variantConfig.currentColor.hex,
                        border: variantConfig.currentColor.borderHex
                          ? `1px solid ${variantConfig.currentColor.borderHex}`
                          : '1px solid rgba(0,0,0,0.18)',
                      }}
                    />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-600 truncate">
                      Cor: <strong className="text-zinc-950 font-black">{variantConfig.currentColor.name}</strong>
                    </span>
                  </div>
                  {variantConfig.officialSpecBadge && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                      {variantConfig.officialSpecBadge}
                    </span>
                  )}
                </div>
              ) : variantConfig.officialSpecBadge ? (
                <div className="flex items-center justify-start py-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {variantConfig.officialSpecBadge}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div>
          {/* Bloco de Preços (Valor de Atacado Integral) */}
          <div
            className={`bg-[#F8F9FA] rounded-xl ${
              compactMobile ? 'p-2.5 sm:p-3' : 'p-3'
            } border border-zinc-200/80 mb-2.5`}
          >
            <div className={`${compactMobile ? 'hidden sm:flex' : 'flex'} items-center justify-between text-[11px] text-zinc-500 mb-0.5`}>
              <span className="truncate font-semibold text-zinc-600">Valor de Atacado</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#059669] bg-[#10B981]/15 px-1.5 py-0.5 rounded shrink-0">
                PIX / DINHEIRO
              </span>
            </div>

            <div className="flex items-baseline gap-1 flex-wrap">
              <span
                className={`${
                  compactMobile ? 'text-base sm:text-2xl' : 'text-xl sm:text-2xl'
                } font-black text-[#059669] tracking-tight`}
              >
                {formatBRL(activeProduct.precoPix)}
              </span>
              <span className={`${compactMobile ? 'text-[10px] sm:text-xs' : 'text-[10px] sm:text-xs'} font-bold text-[#059669]`}>
                {compactMobile ? 'PIX' : 'à vista no PIX'}
              </span>
            </div>

            <div className="mt-1 pt-1 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-[11px] text-zinc-600">
              <span className="truncate font-semibold text-zinc-700">
                {activeProduct.parcelamento}
              </span>
            </div>
          </div>

          {/* Botão de Troca Fácil (Trade-In) se for produto tech de alto valor */}
          {variantConfig.isTechDevice && activeProduct.precoPix >= 1200 && (
            <button
              type="button"
              onClick={handleTradeInClick}
              className="w-full mb-2 py-1.5 px-2 rounded-lg bg-[#7C63E6]/10 hover:bg-[#7C63E6]/20 border border-[#7C63E6]/30 text-[#6D52D8] text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-[#7C63E6] shrink-0" />
              <span>Dar Usado na Troca (Simular)</span>
            </button>
          )}

          {/* Botões de Ação: lado-a-lado em compactMobile, empilhados em 1-coluna */}
          <div className={compactMobile ? 'flex items-center gap-1.5' : 'space-y-1.5 sm:space-y-2'}>
            <button
              type="button"
              onClick={handleAdd}
              className={`touch-target ${compactMobile ? 'flex-1' : 'w-full'} py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                isOutOfStock
                  ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                  : justAdded
                  ? 'bg-[#0A0A0A] text-[#34D399] shadow-md'
                  : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span className="truncate">
                    {compactMobile ? 'Ver Detalhes' : 'Zerou • Ver Detalhes'}
                  </span>
                </>
              ) : justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3] shrink-0" />
                  <span className="truncate">Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="truncate">
                    {compactMobile ? 'Sacola' : 'Adicionar ao Carrinho'}
                  </span>
                </>
              )}
            </button>

            <a
              href={buildSingleProductWhatsAppUrl(activeProduct, selectedRegion.nome)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackContact('Card Produto WhatsApp', activeProduct.precoPix, {
                  product_id: activeProduct.id,
                  product_name: activeProduct.nome,
                });
              }}
              className={`touch-target ${compactMobile ? 'w-10 h-10 rounded-xl flex items-center justify-center' : 'w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5'} bg-[#0A0A0A] hover:bg-zinc-800 active:scale-95 text-white transition-all`}
            >
              <MessageCircle className="w-4 h-4 text-[#34D399] shrink-0" />
              {!compactMobile && (
                <span className="truncate">Comprar via WhatsApp</span>
              )}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
