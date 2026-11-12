'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Star,
  Zap,
  Check,
  Truck,
  ShieldCheck,
  Sparkles,
  FileText,
  Cpu,
  AlertTriangle,
  PackageCheck,
  CreditCard,
  Plus,
  Minus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DFRegion, Product } from '../types/store';
import { formatBRL } from '../data/mockData';
import { buildSingleProductWhatsAppUrl } from '../data/whatsappUtils';
import { getProductSeoDetails } from '../data/productSeoUtils';
import {
  getProductVariantConfig,
  buildConfiguredProduct,
  ColorSwatch,
  StorageTier,
} from '../data/productVariantUtils';
import { trackAddToCart, trackContact, trackViewContent } from '../lib/metaPixel';

interface ProductDetailModalProps {
  product: Product | null;
  selectedRegion: DFRegion;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenTradeIn?: (product: Product) => void;
  allProducts?: Product[];
}

export default function ProductDetailModal({
  product,
  selectedRegion,
  onClose,
  onAddToCart,
  onOpenTradeIn,
  allProducts,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'sobre' | 'ficha' | 'parcelas'>('sobre');
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(product);

  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  // Variantes e Irmãos Reais do Catálogo
  const variantConfig = useMemo(() => {
    if (!activeProduct) return null;
    return getProductVariantConfig(activeProduct, allProducts);
  }, [activeProduct, allProducts]);

  const [selectedStorage, setSelectedStorage] = useState<StorageTier | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorSwatch | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (activeProduct) {
      setSelectedImage(activeProduct.imagem);
    }
  }, [activeProduct?.id, activeProduct?.imagem]);

  const productGallery = useMemo(() => {
    if (!activeProduct) return [];
    const list: string[] = [];
    if (activeProduct.imagem) {
      list.push(activeProduct.imagem);
    }
    if (Array.isArray(activeProduct.gallery)) {
      for (const img of activeProduct.gallery) {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      }
    }
    return list;
  }, [activeProduct?.id, activeProduct?.imagem, activeProduct?.gallery]);

  const currentMainImage = selectedImage || activeProduct?.imagem || '';

  useEffect(() => {
    if (activeProduct && variantConfig) {
      setQuantity(1);
      setActiveTab('sobre');
      setJustAdded(false);
      setSelectedStorage(variantConfig.currentStorage);
      setSelectedColor(variantConfig.currentColor);
      trackViewContent(activeProduct);
    }
  }, [activeProduct, variantConfig]);

  const handleSelectColor = (color: ColorSwatch) => {
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

  const handleCycleColor = (direction: -1 | 1) => {
    if (!variantConfig || variantConfig.availableColors.length <= 1) return;
    const colors = variantConfig.availableColors;
    const currentIndex = colors.findIndex(
      (c) => c.targetProductId === activeProduct?.id || c.id === selectedColor?.id
    );
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + colors.length) % colors.length;
    handleSelectColor(colors[nextIndex]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!variantConfig?.hasColorOptions) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !variantConfig?.hasColorOptions) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(deltaX) > 35) {
      handleCycleColor(deltaX < 0 ? 1 : -1);
    }
  };

  const handleSelectStorage = (tier: StorageTier) => {
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

  // Fecha com ESC
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product || !activeProduct) return null;

  const seo = getProductSeoDetails(activeProduct);
  const isOutOfStock = activeProduct.estoque <= 0;
  const discountPercent = Math.round(
    ((activeProduct.precoDe - activeProduct.precoPix) / activeProduct.precoDe) * 100
  );
  const savingsAmount = Math.max(0, activeProduct.precoDe - activeProduct.precoPix);
  const qualifiesFreeShipping = activeProduct.precoPix * quantity >= selectedRegion.freteGratisAcimaDe;

  const handleAdd = () => {
    if (isOutOfStock) return;
    trackAddToCart(activeProduct, quantity);
    onAddToCart(activeProduct, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleTradeIn = () => {
    onClose();
    onOpenTradeIn?.(activeProduct);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Fixo */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0A0A0A] text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#10B981] text-[#0A0A0A] shrink-0">
              <Zap className="w-3 h-3 fill-current" />
              {activeProduct.tag}
            </span>
            <span className="text-xs text-zinc-300 font-bold truncate">
              {seo.isAppleOfficial ? '💎 Joias Apple • Catálogo Oficial RR-MOBILE' : activeProduct.categoria}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do produto"
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Rolável: Foto Centralizada, Miniaturas Embaixo e Informações Organizadas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
            {/* 1. Foto Principal Grande no Centro */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-md sm:max-w-lg aspect-square rounded-3xl bg-[#F8F9FA] border border-zinc-200/90 overflow-hidden flex items-center justify-center p-4 sm:p-8 select-none shadow-xs"
            >
              <img
                src={currentMainImage}
                alt={activeProduct.nome}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />

              {variantConfig?.hasColorOptions && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCycleColor(-1)}
                    aria-label="Cor anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleColor(1)}
                    aria-label="Próxima cor"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-[#0A0A0A] text-[#34D399] shadow">
                  Preço de Atacado
                </span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-black shadow">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Zerou no Estoque • Sob Consulta
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Pronta Entrega ({activeProduct.estoque} un.)
                  </span>
                )}

                {variantConfig?.hasColorOptions && (
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {variantConfig.availableColors.map((color) => {
                      const isSelected =
                        activeProduct.id === color.targetProductId ||
                        selectedColor?.id === color.id;
                      return (
                        <span
                          key={`modal-dot-${color.id}`}
                          className={`rounded-full transition-all ${
                            isSelected ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Demais Fotos Embaixo da Foto Principal (Miniaturas da Galeria) */}
            {productGallery.length > 1 && (
              <div className="w-full max-w-md sm:max-w-lg mt-3.5 flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto py-1 px-1 select-none no-scrollbar">
                {productGallery.map((imgUrl, idx) => {
                  const isCurrent = currentMainImage === imgUrl;
                  return (
                    <button
                      key={`gallery-thumb-${idx}`}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      title={`Ver foto ${idx + 1}`}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-white border-2 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'border-zinc-950 ring-2 ring-zinc-950 shadow-sm scale-105'
                          : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Ângulo ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Informações Logo Abaixo */}
            <div className="w-full space-y-4 mt-5">
              {/* Selos de Confiança Rápida */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F8F9FA] border border-zinc-200 rounded-xl p-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
                  <span className="text-[11px] font-bold text-zinc-700 leading-tight">
                    {seo.isAppleOfficial ? 'Original Apple Homologado' : 'Garantia Oficial RR Store'}
                  </span>
                </div>
                <div className="bg-[#F8F9FA] border border-zinc-200 rounded-xl p-2.5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#059669] shrink-0" />
                  <span className="text-[11px] font-bold text-zinc-700 leading-tight">
                    Entrega Expressa no DF
                  </span>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-zinc-900">
                      {activeProduct.avaliacao.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      ({activeProduct.avaliacoesCount} avaliações)
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                    Cód: {activeProduct.id}
                  </span>
                </div>

                <h2
                  id="product-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0A0A0A] leading-tight"
                >
                  {activeProduct.nome}
                </h2>

                <p className="text-xs sm:text-sm font-bold text-[#059669] mt-1">
                  {seo.subtituloSeo}
                </p>
              </div>

              {/* ESPECIFICAÇÕES OFICIAIS & CORES REAIS (100% Autêntico) */}
              {variantConfig &&
                (variantConfig.hasColorOptions ||
                  variantConfig.currentColor ||
                  variantConfig.hasStorageOptions ||
                  variantConfig.officialSpecBadge) && (
                  <div className="bg-[#F4F4F6] border border-zinc-200 rounded-2xl p-3.5 space-y-3">
                    {/* Capacidades Reais do Catálogo */}
                    {variantConfig.hasStorageOptions && (
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                          Capacidade / Armazenamento Disponível:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {variantConfig.availableStorages.map((tier) => {
                            const isSelected =
                              activeProduct.id === tier.targetProductId ||
                              selectedStorage?.id === tier.id;
                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => handleSelectStorage(tier)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#0A0A0A] border-[#0A0A0A] text-[#34D399] shadow-sm'
                                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                }`}
                              >
                                {tier.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cores Reais do Catálogo */}
                    {variantConfig.hasColorOptions ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                            Cores Disponíveis para este Modelo:
                          </span>
                          <span className="text-xs font-black text-zinc-900">
                            {variantConfig.currentColor?.name || selectedColor?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {variantConfig.availableColors.map((color) => {
                            const isSelected =
                              activeProduct.id === color.targetProductId ||
                              selectedColor?.id === color.id;
                            const isOutOfStock = color.inStock === false;
                            return (
                              <button
                                key={color.id}
                                type="button"
                                title={
                                  isOutOfStock
                                    ? `Cor: ${color.name} (Indisponível no momento)`
                                    : `Selecionar cor: ${color.name}`
                                }
                                onClick={() => handleSelectColor(color)}
                                className={`w-7 h-7 rounded-full transition-all cursor-pointer relative overflow-hidden ${
                                  isSelected
                                    ? 'ring-2 ring-[#10B981] ring-offset-2 scale-110 shadow-sm'
                                    : isOutOfStock
                                    ? 'opacity-40 hover:opacity-75'
                                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                                style={{
                                  backgroundColor: color.hex,
                                  border: color.borderHex
                                    ? `1px solid ${color.borderHex}`
                                    : '1px solid rgba(0,0,0,0.18)',
                                }}
                              >
                                {isOutOfStock && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                                  >
                                    <span className="w-[140%] h-[2px] bg-red-500/90 -rotate-45 shadow-xs" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : variantConfig.currentColor ? (
                      /* Cor Oficial Única Autêntica */
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-5 h-5 rounded-full shadow-xs ring-1 ring-black/10 shrink-0"
                            style={{
                              backgroundColor: variantConfig.currentColor.hex,
                              border: variantConfig.currentColor.borderHex
                                ? `1px solid ${variantConfig.currentColor.borderHex}`
                                : '1px solid rgba(0,0,0,0.18)',
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block leading-tight">
                              Cor Oficial do Modelo:
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-zinc-900 truncate block">
                              {variantConfig.currentColor.name}
                            </span>
                          </div>
                        </div>
                        {variantConfig.officialSpecBadge && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
                            {variantConfig.officialSpecBadge}
                          </span>
                        )}
                      </div>
                    ) : variantConfig.officialSpecBadge ? (
                      <div className="flex items-center justify-start p-2 rounded-xl bg-white border border-zinc-200">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                          {variantConfig.officialSpecBadge}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

              {/* Card de Preços (Valor Integral de Atacado) */}
              <div className="bg-[#F8F9FA] border-2 border-[#10B981]/35 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-bold text-zinc-700">Valor Oficial de Atacado</span>
                  <span className="font-extrabold text-[#059669] bg-[#10B981]/15 px-2 py-0.5 rounded-md">
                    Pronta Entrega SIA Loja D439
                  </span>
                </div>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#059669] tracking-tight">
                    {formatBRL(activeProduct.precoPix)}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] bg-[#34D399] px-2 py-0.5 rounded-md">
                    à vista no PIX ou Dinheiro
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-2 text-xs text-zinc-700">
                  <span className="font-bold">
                    Cartão em até {activeProduct.maxParcelasSemJuros}x{' '}
                    <span className="text-zinc-500 font-semibold">
                      (juros de acordo com a taxa da operadora)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('parcelas')}
                    className="text-[#059669] hover:underline font-extrabold cursor-pointer shrink-0"
                  >
                    Ver opções
                  </button>
                </div>
              </div>

              {/* Botão de Troca Fácil (Trade-In) com Usado como Entrada */}
              {variantConfig?.isTechDevice && activeProduct.precoPix >= 1200 && (
                <div className="bg-gradient-to-r from-[#171130] to-[#0d1629] border border-[#7C63E6]/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#7C63E6]/30 border border-[#7C63E6]/50 flex items-center justify-center text-[#A78BFA] shrink-0">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">
                        Tem um aparelho usado para dar de entrada?
                      </p>
                      <p className="text-[11px] text-[#A78BFA] truncate">
                        Economize até R$ 4.000 na compra deste {activeProduct.nome.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTradeIn}
                    className="px-3 py-1.5 rounded-xl bg-[#7C63E6] hover:bg-[#684ddb] text-white text-xs font-black transition-all cursor-pointer shrink-0 shadow-md shadow-[#7C63E6]/30"
                  >
                    Simular Troca
                  </button>
                </div>
              )}

              {/* Estimativa de Entrega na Região Selecionada */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#10B981] text-[#0A0A0A] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-zinc-900 truncate">
                      Entrega para {selectedRegion.nome}
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      Prazo: <strong>{selectedRegion.tempoEstimado}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {qualifiesFreeShipping ? (
                    <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-lg">
                      FRETE GRÁTIS
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-zinc-900">
                      {formatBRL(selectedRegion.taxaEntrega)}
                    </span>
                  )}
                </div>
              </div>

              {/* Aviso Oficial RR-MOBILE para produtos Apple */}
              {seo.avisosLoja && seo.avisosLoja.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Regras e Informações Importantes RR-MOBILE
                  </div>
                  <ul className="space-y-1 text-[11px] sm:text-xs text-amber-950 font-medium leading-relaxed">
                    {seo.avisosLoja.map((aviso, i) => (
                      <li key={i}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Abas de Informações de SEO, Ficha Técnica e Parcelamento */}
            <div className="w-full border-t border-zinc-200 pt-5 mt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('sobre')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
                  activeTab === 'sobre'
                    ? 'bg-[#0A0A0A] text-[#34D399]'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Descrição & Benefícios (SEO)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ficha')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
                  activeTab === 'ficha'
                    ? 'bg-[#0A0A0A] text-[#34D399]'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Ficha Técnica ({seo.fichaTecnica.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('parcelas')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
                  activeTab === 'parcelas'
                    ? 'bg-[#0A0A0A] text-[#34D399]'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Opções de Pagamento
              </button>
            </div>

            {activeTab === 'sobre' && (
              <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-zinc-200/90 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#059669]" />
                    Sobre o Produto
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    {seo.descricaoCompleta}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-200">
                  <div>
                    <h4 className="text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                      Principais Destaques
                    </h4>
                    <ul className="space-y-1.5">
                      {seo.beneficios.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700">
                          <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-[#059669]" />
                      Itens Inclusos
                    </h4>
                    <ul className="space-y-1.5">
                      {seo.itensInclusos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ficha' && (
              <div className="bg-[#F8F9FA] rounded-2xl border border-zinc-200/90 overflow-hidden">
                <div className="divide-y divide-zinc-200">
                  {seo.fichaTecnica.map((spec, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                      }`}
                    >
                      <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">
                        {spec.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] sm:text-right">
                        {spec.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'parcelas' && (
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-zinc-200/90 space-y-3">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div>
                    <p className="text-xs font-black text-emerald-950">
                      PIX ou Dinheiro à Vista (Melhor Preço)
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Aprovação imediata e prioridade na saída do Motoboy
                    </p>
                  </div>
                  <span className="text-lg font-black text-[#059669]">
                    {formatBRL(activeProduct.precoPix)}
                  </span>
                </div>

                {/* Aviso claro sobre a taxa da operadora do cartão */}
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-950">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-black text-amber-900">
                      Parcelamento no Cartão de Crédito em até {activeProduct.maxParcelasSemJuros}x
                    </p>
                    <p className="font-semibold text-amber-800 mt-0.5">
                      Os juros do parcelamento serão calculados de acordo com a taxa da operadora do cartão/maquininha.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Array.from({ length: activeProduct.maxParcelasSemJuros }, (_, i) => i + 1).map(
                    (parcela) => (
                      <div
                        key={parcela}
                        className="bg-white border border-zinc-200 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-zinc-700">
                          {parcela}x <span className="text-[10px] text-zinc-500 font-semibold">(+ taxa da operadora)</span>
                        </span>
                        <span className="font-extrabold text-[#0A0A0A]">
                          {formatBRL(activeProduct.precoPix / parcela)}*
                        </span>
                      </div>
                    )
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 font-semibold text-center pt-1">
                  * Valores base de referência por parcela. O acréscimo de juros varia de acordo com a taxa da operadora no ato do pagamento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra Inferior Fixa de Compra */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {!isOutOfStock && (
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-xs font-extrabold text-zinc-600">Quantidade:</span>
              <div className="inline-flex items-center bg-[#F8F9FA] border border-zinc-300 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-200 flex items-center justify-center text-zinc-800 cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-black text-[#0A0A0A]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(activeProduct.estoque, q + 1))}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-200 flex items-center justify-center text-zinc-800 cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-black text-[#059669]">
                Total PIX: {formatBRL(activeProduct.precoPix * quantity)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-1 sm:justify-end">
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  justAdded
                    ? 'bg-[#0A0A0A] text-[#34D399]'
                    : 'bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] shadow-lg shadow-[#10B981]/25'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>Adicionar à Sacola</span>
                  </>
                )}
              </button>
            )}

            <a
              href={buildSingleProductWhatsAppUrl(activeProduct, selectedRegion.nome)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackContact('Modal Produto WhatsApp', activeProduct.precoPix * quantity, {
                  product_id: activeProduct.id,
                  product_name: activeProduct.nome,
                  quantity,
                });
              }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#0A0A0A] hover:bg-zinc-800 text-white flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>{isOutOfStock ? 'Consultar Chegada no WhatsApp' : 'Comprar via WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
