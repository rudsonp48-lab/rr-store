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

  useEffect(() => {
    if (activeProduct && variantConfig) {
      setQuantity(1);
      setActiveTab('sobre');
      setJustAdded(false);
      setSelectedStorage(variantConfig.currentStorage);
      setSelectedColor(variantConfig.currentColor);
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
        className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Fixo */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0A0A0A] text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#10B981] text-[#0A0A0A] shrink-0">
              <Zap className="w-3 h-3 fill-current" />
              {product.tag}
            </span>
            <span className="text-xs text-zinc-300 font-bold truncate">
              {seo.isAppleOfficial ? '💎 Joias Apple • Catálogo Oficial RR-MOBILE' : product.categoria}
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

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Coluna Esquerda: Foto do Produto + Selos */}
            <div className="md:col-span-5 flex flex-col gap-2.5 sm:gap-3">
              <div className="relative aspect-[4/3] sm:aspect-square max-h-[210px] sm:max-h-none w-full rounded-2xl bg-[#F8F9FA] border border-zinc-200/90 overflow-hidden flex items-center justify-center p-3 sm:p-4">
                <img
                  src={product.imagem}
                  alt={product.nome}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-[#0A0A0A] text-[#34D399] shadow">
                    Preço de Atacado
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-black shadow">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Zerou no Estoque • Sob Consulta
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Pronta Entrega ({product.estoque} un.)
                    </span>
                  )}
                </div>
              </div>

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
            </div>

            {/* Coluna Direita: Título, SEO Curto, Preço e Simulador de Frete */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-zinc-900">
                      {product.avaliacao.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      ({product.avaliacoesCount} avaliações)
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                    Cód: {product.id}
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
                            return (
                              <button
                                key={color.id}
                                type="button"
                                title={`Selecionar cor: ${color.name}`}
                                onClick={() => handleSelectColor(color)}
                                className={`w-7 h-7 rounded-full transition-all cursor-pointer relative ${
                                  isSelected
                                    ? 'ring-2 ring-[#10B981] ring-offset-2 scale-110 shadow-sm'
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
          </div>

          {/* Abas de Informações de SEO, Ficha Técnica e Parcelamento */}
          <div className="border-t border-zinc-200 pt-5">
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
                    {formatBRL(product.precoPix)}
                  </span>
                </div>

                {/* Aviso claro sobre a taxa da operadora do cartão */}
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-950">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-black text-amber-900">
                      Parcelamento no Cartão de Crédito em até {product.maxParcelasSemJuros}x
                    </p>
                    <p className="font-semibold text-amber-800 mt-0.5">
                      Os juros do parcelamento serão calculados de acordo com a taxa da operadora do cartão/maquininha.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Array.from({ length: product.maxParcelasSemJuros }, (_, i) => i + 1).map(
                    (parcela) => (
                      <div
                        key={parcela}
                        className="bg-white border border-zinc-200 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-zinc-700">
                          {parcela}x <span className="text-[10px] text-zinc-500 font-semibold">(+ taxa da operadora)</span>
                        </span>
                        <span className="font-extrabold text-[#0A0A0A]">
                          {formatBRL(product.precoPix / parcela)}*
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
                  onClick={() => setQuantity((q) => Math.min(product.estoque, q + 1))}
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
